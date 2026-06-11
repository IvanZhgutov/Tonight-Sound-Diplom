<?php

namespace Database\Seeders;

use App\Models\Service;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        $services = [
            ['slug' => 'vocal',     'name' => 'Запись вокала',      'price' => 1500, 'hourly' => true,  'bookable' => true,  'icon' => '🎙️', 'description' => 'Пишем вокал на Neumann TLM 102 в тихой подготовленной комнате. Поможем с дублями, подскажем по подаче и соберём черновой микс сразу после сессии.'],
            ['slug' => 'mixing',    'name' => 'Сведение',           'price' => 4000, 'hourly' => false, 'bookable' => false, 'icon' => '🎚️', 'description' => 'Балансы, частоты, динамика и пространство — доведём трек до уверенного звучания на любых системах, от наушников до клубного саба.'],
            ['slug' => 'mastering', 'name' => 'Мастеринг',          'price' => 2500, 'hourly' => false, 'bookable' => false, 'icon' => '💿', 'description' => 'Финальная полировка: громкость под стриминговые платформы, ширина и плотность без потери динамики. Отдаём версии под все площадки.'],
            ['slug' => 'arrange',   'name' => 'Аранжировка',        'price' => 8000, 'hourly' => true,  'bookable' => true,  'icon' => '🎛️', 'description' => 'Соберём аранжировку под ваш референс или с нуля: бит, гармония, структура и продакшн до состояния «можно записывать вокал».'],
            ['slug' => 'podcast',   'name' => 'Подкасты и озвучка', 'price' => 1200, 'hourly' => true,  'bookable' => true,  'icon' => '🎧', 'description' => 'Запись подкастов, озвучки и аудиокниг с чисткой дорожек от шумов, щелчков и лишних пауз. Готовые файлы — под монтаж или сразу в эфир.'],
            ['slug' => 'produce',   'name' => 'Продюсирование',     'price' => null, 'hourly' => false, 'bookable' => false, 'icon' => '🚀', 'description' => 'Полный цикл: от идеи и демки до релиза. Поможем с концепцией, звуком, сведением и подготовкой трека к дистрибуции.'],
        ];

        foreach ($services as $service) {
            Service::updateOrCreate(['slug' => $service['slug']], $service);
        }
    }
}
