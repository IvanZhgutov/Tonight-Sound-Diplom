<?php

namespace Database\Factories;

use App\Enums\BookingStatus;
use App\Models\Booking;
use App\Models\Service;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

/**
 * @extends Factory<Booking>
 */
class BookingFactory extends Factory
{
    public function definition(): array
    {
        // Берём случайную услугу, доступную для записи (bookable)
        $service = Service::where('bookable', true)->inRandomOrder()->first()
            ?? Service::factory()->create();

        // Случайные подряд идущие часы сессии (1–4 часа)
        $startHour = fake()->numberBetween(10, 19);
        $hoursCount = fake()->numberBetween(1, 4);
        $times = [];
        for ($i = 0; $i < $hoursCount && ($startHour + $i) <= 23; $i++) {
            $times[] = sprintf('%02d:00', $startHour + $i);
        }

        // Дата: часть в прошлом (для выручки), часть в будущем (для загрузки)
        $date = fake()->boolean(65)
            ? Carbon::today()->subDays(fake()->numberBetween(1, 60))
            : Carbon::today()->addDays(fake()->numberBetween(1, 30));

        $total = $service->totalFor(count($times));

        return [
            'user_id' => User::factory(),
            'service_id' => $service->id,
            'date' => $date->toDateString(),
            'times' => $times,
            'total' => $total,
            'telegram' => '@' . fake()->userName(),
            'comment' => fake()->boolean(30) ? fake()->randomElement([
                'Хочу записать припев и два куплета.',
                'Нужен тёплый винтажный вокал.',
                'Принесу свой бит, нужно свести.',
                'Запись подкаста, два микрофона.',
                'Можно ли продлить, если не успеем?',
            ]) : null,
            'status' => BookingStatus::Pending,
            'paid_at' => null,
        ];
    }

    /** Подтверждённая будущая запись */
    public function confirmed(): static
    {
        return $this->state(fn () => [
            'status' => BookingStatus::Confirmed,
            'date' => Carbon::today()->addDays(fake()->numberBetween(1, 21))->toDateString(),
        ]);
    }

    /** Завершённая (= оплаченная) запись в прошлом — даёт выручку */
    public function completed(): static
    {
        return $this->state(function () {
            $date = Carbon::today()->subDays(fake()->numberBetween(1, 60));
            return [
                'status' => BookingStatus::Completed,
                'date' => $date->toDateString(),
                'paid_at' => $date->copy()->setHour(fake()->numberBetween(10, 21)),
            ];
        });
    }

    /** Отклонённая заявка */
    public function declined(): static
    {
        return $this->state(fn () => ['status' => BookingStatus::Declined]);
    }

    /** Неявка */
    public function noShow(): static
    {
        return $this->state(fn () => [
            'status' => BookingStatus::NoShow,
            'date' => Carbon::today()->subDays(fake()->numberBetween(1, 40))->toDateString(),
        ]);
    }
}
