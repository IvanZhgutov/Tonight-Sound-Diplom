<?php

namespace Database\Factories;

use App\Models\ClientNote;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ClientNote>
 */
class ClientNoteFactory extends Factory
{
    /** Реалистичные заметки звукорежиссёра о клиенте */
    private const NOTES = [
        'Любит тёплый ламповый вокал, предпочитает Neumann.',
        'Работает в жанре хип-хоп, приносит свои биты.',
        'Просит добавлять лёгкий автотюн на припевы.',
        'Постоянный клиент, записывается раз в две недели.',
        'Нужно больше дублей — перфекционист по подаче.',
        'Записывает подкаст с напарником, нужны два микрофона.',
        'Предпочитает вечерние сессии после 18:00.',
        'Голос хорошо звучит с близкой подачей к микрофону.',
        'Оплачивает заранее, проблем с оплатой не было.',
        'Просил подсказать по сведению — заинтересован в мастеринге.',
    ];

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'author_id' => User::factory()->admin(),
            'text' => fake()->randomElement(self::NOTES),
        ];
    }
}
