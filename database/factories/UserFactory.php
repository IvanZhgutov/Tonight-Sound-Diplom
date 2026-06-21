<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    protected static ?string $password;

    /** Русские имена для генерации клиентов студии */
    private const FIRST_M = ['Александр', 'Дмитрий', 'Максим', 'Иван', 'Артём', 'Никита', 'Михаил', 'Егор', 'Роман', 'Кирилл', 'Андрей', 'Павел'];
    private const FIRST_F = ['Анна', 'Мария', 'Елена', 'Дарья', 'Алина', 'Виктория', 'Полина', 'София', 'Ксения', 'Юлия', 'Екатерина', 'Ольга'];
    private const LAST_M = ['Иванов', 'Петров', 'Смирнов', 'Кузнецов', 'Соколов', 'Попов', 'Лебедев', 'Козлов', 'Новиков', 'Морозов', 'Волков', 'Алексеев'];
    private const LAST_F = ['Иванова', 'Петрова', 'Смирнова', 'Кузнецова', 'Соколова', 'Попова', 'Лебедева', 'Козлова', 'Новикова', 'Морозова', 'Волкова', 'Алексеева'];

    /** Возможные теги клиента для сегментации в CRM */
    private const TAG_POOL = ['постоянный', 'вокалист', 'битмейкер', 'рэп', 'поп', 'подкастер', 'новичок', 'VIP', 'рекомендация'];

    public function definition(): array
    {
        $isMale = fake()->boolean();

        if ($isMale) {
            $first = fake()->randomElement(self::FIRST_M);
            $last = fake()->randomElement(self::LAST_M);
        } else {
            $first = fake()->randomElement(self::FIRST_F);
            $last = fake()->randomElement(self::LAST_F);
        }

        $name = "{$first} {$last}";

        // Транслитерация имени в логин для уникального email
        $login = self::translit("{$first}.{$last}");
        $email = $login . fake()->numberBetween(1, 999) . '@' . fake()->randomElement(['gmail.com', 'mail.ru', 'yandex.ru']);

        return [
            'name' => $name,
            'email' => $email,
            'phone' => self::phoneRu(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'is_admin' => false,
            // у части клиентов — теги, у части нет
            'tags' => fake()->boolean(60)
                ? fake()->randomElements(self::TAG_POOL, fake()->numberBetween(1, 3))
                : [],
            'remember_token' => Str::random(10),
        ];
    }

    /** Российский номер в формате +7 (XXX)-XXX-XX-XX */
    private static function phoneRu(): string
    {
        $code = fake()->randomElement(['903', '905', '909', '915', '916', '920', '925', '926', '999']);
        $n = fake()->numerify('#######');
        return sprintf(
            '+7 (%s)-%s-%s-%s',
            $code,
            substr($n, 0, 3),
            substr($n, 3, 2),
            substr($n, 5, 2)
        );
    }

    /** Простая транслитерация кириллицы в латиницу для email */
    private static function translit(string $text): string
    {
        $map = [
            'а' => 'a', 'б' => 'b', 'в' => 'v', 'г' => 'g', 'д' => 'd', 'е' => 'e', 'ё' => 'e',
            'ж' => 'zh', 'з' => 'z', 'и' => 'i', 'й' => 'y', 'к' => 'k', 'л' => 'l', 'м' => 'm',
            'н' => 'n', 'о' => 'o', 'п' => 'p', 'р' => 'r', 'с' => 's', 'т' => 't', 'у' => 'u',
            'ф' => 'f', 'х' => 'h', 'ц' => 'c', 'ч' => 'ch', 'ш' => 'sh', 'щ' => 'sch', 'ъ' => '',
            'ы' => 'y', 'ь' => '', 'э' => 'e', 'ю' => 'yu', 'я' => 'ya', '.' => '.',
        ];
        return preg_replace('/[^a-z.]/', '', strtr(mb_strtolower($text), $map));
    }

    /** Клиент с гарантированными тегами */
    public function tagged(): static
    {
        return $this->state(fn () => [
            'tags' => fake()->randomElements(self::TAG_POOL, fake()->numberBetween(1, 3)),
        ]);
    }

    /** Администратор */
    public function admin(): static
    {
        return $this->state(fn () => [
            'is_admin' => true,
            'tags' => [],
        ]);
    }

    public function unverified(): static
    {
        return $this->state(fn () => ['email_verified_at' => null]);
    }
}
