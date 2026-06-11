<?php

namespace App\Enums;

enum BookingStatus: string
{
    case Pending = 'pending';       // новая заявка
    case Confirmed = 'confirmed';   // подтверждена админом
    case Completed = 'completed';   // сессия прошла, ждёт оплаты
    case Paid = 'paid';             // оплачена
    case Declined = 'declined';     // отклонена
    case NoShow = 'no_show';        // клиент не пришёл

    /**
     * Воронка CRM: какие переходы разрешены из каждого статуса
     */
    public function allowedTransitions(): array
    {
        return match ($this) {
            self::Pending => [self::Confirmed, self::Declined],
            self::Confirmed => [self::Completed, self::NoShow, self::Declined],
            self::Completed => [self::Paid],
            self::Paid, self::Declined, self::NoShow => [],
        };
    }

    public function canTransitionTo(self $target): bool
    {
        return in_array($target, $this->allowedTransitions(), true);
    }
}
