<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\BookingStatus;
use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    /**
     * GET /api/admin/analytics
     * Сводка для CRM-дашборда: тайлы за 30 дней + динамика и распределения.
     */
    public function index(): JsonResponse
    {
        $from = Carbon::today()->subDays(30);

        // --- Тайлы за последние 30 дней ---
        $paid = Booking::where('status', BookingStatus::Paid)
            ->whereDate('date', '>=', $from);

        $revenue = (int) (clone $paid)->sum('total');
        $paidCount = (clone $paid)->count();

        $tiles = [
            'revenue' => $revenue,
            'bookings' => Booking::whereDate('date', '>=', $from)
                ->whereNotIn('status', [BookingStatus::Declined])
                ->count(),
            'avg_check' => $paidCount > 0 ? (int) round($revenue / $paidCount) : 0,
            // долг — все завершённые, но не оплаченные (без ограничения по периоду)
            'debt' => (int) Booking::where('status', BookingStatus::Completed)->sum('total'),
        ];

        // --- Выручка по месяцам (последние 6) ---
        $monthly = Booking::where('status', BookingStatus::Paid)
            ->whereDate('date', '>=', Carbon::today()->startOfMonth()->subMonths(5))
            ->select(
                DB::raw("DATE_FORMAT(date, '%Y-%m') as month"),
                DB::raw('SUM(total) as revenue'),
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(fn ($row) => [
                'month' => $row->month,
                'revenue' => (int) $row->revenue,
            ]);

        // --- Популярность услуг (90 дней, без отклонённых) ---
        $services = Booking::query()
            ->join('services', 'services.id', '=', 'bookings.service_id')
            ->whereDate('bookings.date', '>=', Carbon::today()->subDays(90))
            ->whereNotIn('bookings.status', [BookingStatus::Declined])
            ->select(
                'services.name',
                DB::raw('COUNT(*) as count'),
                DB::raw("SUM(CASE WHEN bookings.status = 'paid' THEN bookings.total ELSE 0 END) as revenue"),
            )
            ->groupBy('services.name')
            ->orderByDesc('count')
            ->get()
            ->map(fn ($row) => [
                'name' => $row->name,
                'count' => (int) $row->count,
                'revenue' => (int) $row->revenue,
            ]);

        // --- Загрузка по дням недели (90 дней): 1 = понедельник ---
        $weekdays = Booking::query()
            ->whereDate('date', '>=', Carbon::today()->subDays(90))
            ->whereNotIn('status', [BookingStatus::Declined])
            ->select(DB::raw('WEEKDAY(date) + 1 as dow'), DB::raw('COUNT(*) as count'))
            ->groupBy('dow')
            ->orderBy('dow')
            ->get()
            ->map(fn ($row) => ['dow' => (int) $row->dow, 'count' => (int) $row->count]);

        return response()->json([
            'period_from' => $from->format('Y-m-d'),
            'tiles' => $tiles,
            'monthly' => $monthly,
            'services' => $services,
            'weekdays' => $weekdays,
        ]);
    }
}
