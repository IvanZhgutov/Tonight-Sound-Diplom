<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\ClientNote;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Демо-данные для наглядной работы CRM: клиенты, их записи и заметки.
 *
 * Запуск отдельно:
 *   php artisan db:seed --class=DemoSeeder
 */
class DemoSeeder extends Seeder
{
    public function run(): void
    {
        // Администратор — автор заметок (берём существующего из AdminUserSeeder)
        $admin = User::where('is_admin', true)->first()
            ?? User::factory()->admin()->create([
                'name' => 'Администратор студии',
                'email' => 'admin@tonightsound.studio',
            ]);

        // 25 клиентов студии
        $clients = User::factory()->count(25)->create();

        foreach ($clients as $client) {
            // У каждого клиента — история записей с разными статусами.
            // Завершённые (completed) дают выручку в аналитике.

            // 2–6 завершённых записей в прошлом
            Booking::factory()
                ->count(fake()->numberBetween(2, 6))
                ->completed()
                ->for($client)
                ->create();

            // 0–2 подтверждённые будущие записи
            if (fake()->boolean(60)) {
                Booking::factory()
                    ->count(fake()->numberBetween(1, 2))
                    ->confirmed()
                    ->for($client)
                    ->create();
            }

            // 0–1 новая заявка (ожидает подтверждения)
            if (fake()->boolean(40)) {
                Booking::factory()->for($client)->create();
            }

            // изредка — неявка или отклонённая
            if (fake()->boolean(20)) {
                Booking::factory()->noShow()->for($client)->create();
            }
            if (fake()->boolean(15)) {
                Booking::factory()->declined()->for($client)->create();
            }

            // У половины клиентов — заметки звукорежиссёра
            if (fake()->boolean(50)) {
                ClientNote::factory()
                    ->count(fake()->numberBetween(1, 3))
                    ->create([
                        'user_id' => $client->id,
                        'author_id' => $admin->id,
                    ]);
            }
        }

        $this->command->info('Создано клиентов: ' . $clients->count());
        $this->command->info('Всего записей: ' . Booking::count());
        $this->command->info('Всего заметок: ' . ClientNote::count());
    }
}
