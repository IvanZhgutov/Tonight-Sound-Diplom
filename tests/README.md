# Tonight Sound API (Laravel 12)

REST API для студии звукозаписи: Sanctum Bearer-токены, MySQL.

## Установка

Этот архив — только авторский код поверх свежего скелета Laravel 12
(vendor не входит). Развёртывание:

```bash
# 1. Свежий Laravel 12
composer create-project laravel/laravel:^12.0 tonight-sound-api
cd tonight-sound-api

# 2. Sanctum + routes/api.php
php artisan install:api

# 3. Скопировать файлы этого архива поверх проекта (с заменой):
#    app/ bootstrap/app.php config/cors.php database/ routes/api.php

# 4. Настроить .env по образцу .env.api.example (база tonight_sound должна существовать)

# 5. Миграции и данные
php artisan migrate --seed

# 6. Запуск
php artisan serve   # http://localhost:8000
```

Сидер создаёт каталог услуг, 26 плагинов и админа:
`admin@tonightsound.studio` / `admin123` (сменить в проде!).

## Эндпоинты

### Публичные
| Метод | URL | Описание |
|---|---|---|
| POST | /api/auth/register | `{name, email, phone?, password, password_confirmation}` → user + token |
| POST | /api/auth/login | `{email, password}` → user + token |
| GET | /api/services | каталог услуг, `?bookable=1` — только для записи |
| GET | /api/plugins | плагины, `?search=` `?category=` |
| POST | /api/plugins/requests | `{name}` — «Не нашли плагин?» (throttle 5/мин) |
| GET | /api/availability?date=YYYY-MM-DD | занятые часы: `{date, busy: ["16:00", ...]}` |

### Авторизованные (заголовок `Authorization: Bearer <token>`)
| Метод | URL | Описание |
|---|---|---|
| GET | /api/auth/me | текущий пользователь |
| POST | /api/auth/logout | отзыв текущего токена |
| GET | /api/bookings | мои записи (с услугой) |
| POST | /api/bookings | `{date, times[], service, telegram, comment?}` |
| DELETE | /api/bookings/{id} | отмена своей будущей записи |

### Админ / CRM (is_admin = true)
| Метод | URL | Описание |
|---|---|---|
| GET | /api/admin/stats | счётчики дашборда |
| GET | /api/admin/bookings | все заявки, `?status=` |
| PATCH | /api/admin/bookings/{id}/status | переход по воронке (см. ниже) |
| GET | /api/admin/clients | клиенты с агрегатами, `?search=` `?sort=spent\|recent\|debt` |
| GET | /api/admin/clients/{id} | карточка: профиль, статистика, записи, заметки |
| PATCH | /api/admin/clients/{id} | теги / телефон клиента |
| POST | /api/admin/clients/{id}/notes | добавить заметку |
| DELETE | /api/admin/notes/{id} | удалить заметку |
| GET | /api/admin/analytics | тайлы, выручка по месяцам, услуги, загрузка |
| PATCH | /api/admin/services/{id} | изменить цену услуги (`{price: int\|null}`) |
| POST | /api/admin/plugins | добавить плагин (`{name, vendor?, version?, category}`) |
| GET | /api/admin/plugin-requests | запросы артистов |
| PATCH | /api/admin/plugins/{id}/approve | запрос → «Новинка» |
| DELETE | /api/admin/plugins/{id} | отклонить запрос / удалить из каталога |

### Воронка записи (state machine в BookingStatus)
```
pending ──→ confirmed ──→ completed ──→ paid
   └→ declined   ├→ no_show              (paid_at ставится автоматически)
                 └→ declined
```
Недопустимый переход → 422. Клиент может отменить только свою будущую
запись в статусе pending/confirmed.

## Бизнес-логика

- **Создание записи**: цена считается на сервере (`price × кол-во часов` для
  почасовых услуг), часы проверяются на конфликт с не-отклонёнными записями
  этой даты внутри транзакции с `lockForUpdate` — двойное бронирование
  одного часа невозможно даже при одновременных запросах.
- **Занятость слотов** больше не имитируется хэшем, как на фронте, —
  `/api/availability` отдаёт реальные занятые часы.
- **Воронка CRM**: переходы статусов валидирует enum
  `BookingStatus::canTransitionTo()`; оплата фиксирует `paid_at`.
- **Финансы**: «оплачено» = сумма paid-записей, «долг» = completed без
  оплаты; агрегаты считаются в SQL через withSum с условиями.
- **Плагины**: запрос артиста создаёт плагин со статусом `requested`
  (категория «Скоро»); одобрение админом переводит в `new` («Новинка»);
  дубликаты по имени отсекаются без учёта регистра.
- Все ошибки и валидация — JSON (middleware `ForceJsonResponse`),
  сообщения валидации на русском.

## Пример: создать запись

```http
POST /api/bookings
Authorization: Bearer 1|abc...
Content-Type: application/json

{
  "date": "2026-06-20",
  "times": ["16:00", "17:00"],
  "service": "vocal",
  "telegram": "@username",
  "comment": "Референс пришлю в личку"
}
```

Ответ `201`:
```json
{
  "message": "Запись создана! Мы свяжемся с вами в Telegram для подтверждения.",
  "booking": {
    "id": 1, "date": "2026-06-20", "times": ["16:00","17:00"],
    "total": 3000, "status": "pending", "is_past": false, ...
  }
}
```

## Следующие шаги
- Подключение React-фронта (заменить zustand-логику на fetch к API).
- Уведомления в Telegram о новых заявках (бот + очередь).
- Тесты: Pest/PHPUnit на бронирование и конфликты слотов.
