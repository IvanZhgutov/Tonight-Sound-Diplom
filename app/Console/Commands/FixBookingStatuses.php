<?php

namespace App\Console\Commands;

use App\Enums\BookingStatus;
use App\Models\Booking;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * Диагностика и починка статусов заявок после перехода
 * со старой воронки (paid) на новую (completed).
 *
 * Запуск:
 *   php artisan bookings:fix-statuses          — показать сводку
 *   php artisan bookings:fix-statuses --apply  — перевести paid → completed
 */
class FixBookingStatuses extends Command
{
    protected $signature = 'bookings:fix-statuses {--apply : Применить изменения}';

    protected $description = 'Диагностика статусов заявок и перевод старых paid → completed';

    public function handle(): int
    {
        $this->info('Сводка по статусам заявок:');
        $this->newLine();

        // Группировка по статусу — что реально лежит в БД
        $counts = Booking::select('status', DB::raw('COUNT(*) as cnt'), DB::raw('SUM(total) as sum'))
            ->groupBy('status')
            ->get();

        if ($counts->isEmpty()) {
            $this->warn('В базе нет ни одной заявки.');
            return self::SUCCESS;
        }

        $rows = $counts->map(fn ($r) => [
            $r->status,
            $r->cnt,
            number_format((int) $r->sum, 0, '.', ' ') . ' ₽',
        ])->all();

        $this->table(['Статус', 'Кол-во', 'Сумма total'], $rows);

        // Сколько записей со старым статусом paid
        $paidCount = Booking::where('status', 'paid')->count();

        // Диапазон дат завершённых записей — чтобы понять, попадают ли они в фильтр
        $completed = Booking::where('status', BookingStatus::Completed);
        $compCount = (clone $completed)->count();
        if ($compCount > 0) {
            $min = (clone $completed)->min('date');
            $max = (clone $completed)->max('date');
            $this->newLine();
            $this->info("Завершённых записей (completed): {$compCount}");
            $this->line("Диапазон их дат: {$min} … {$max}");
            $this->comment('Аналитика покажет выручку, только если выбранный период пересекается с этим диапазоном.');
        } else {
            $this->newLine();
            $this->warn('Завершённых записей (completed) нет — поэтому выручка нулевая.');
        }

        if ($paidCount > 0) {
            $this->newLine();
            $this->warn("Найдено {$paidCount} записей со старым статусом «paid».");

            if ($this->option('apply')) {
                $updated = Booking::where('status', 'paid')->update([
                    'status' => BookingStatus::Completed->value,
                ]);
                $this->info("✓ Переведено в «completed»: {$updated}");
            } else {
                $this->comment('Запустите с флагом --apply, чтобы перевести их в «completed»:');
                $this->line('   php artisan bookings:fix-statuses --apply');
            }
        } else {
            $this->newLine();
            $this->info('Записей со старым статусом «paid» не найдено — миграция данных не требуется.');
        }

        return self::SUCCESS;
    }
}
