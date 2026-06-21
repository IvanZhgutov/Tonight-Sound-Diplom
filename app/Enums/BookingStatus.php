<?php

namespace App\Enums;

enum BookingStatus: string
{
    case Pending = 'pending';       // ожидает подтверждения
    case Confirmed = 'confirmed';   // подтверждена
    case Completed = 'completed';   // завершена (= оплачена)
    case Declined = 'declined';     // отклонена
    case NoShow = 'no_show';        // не пришёл

    /** Воронка CRM: допустимые переходы */
    public function allowedTransitions(): array
    {
        return match ($this) {
            self::Pending   => [self::Confirmed, self::Declined],
            self::Confirmed => [self::Completed, self::NoShow],
            self::Completed, self::Declined, self::NoShow => [],
        };
    }

    public function canTransitionTo(self $target): bool
    {
        return in_array($target, $this->allowedTransitions(), true);
    }

    /** Статусы, которые приносят выручку (завершённые = оплаченные) */
    public static function paidStatuses(): array
    {
        return [self::Completed];
    }
}