<?php

namespace App\Models;

use App\Enums\BookingStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Booking extends Model
{
    protected $fillable = [
        'user_id',
        'service_id',
        'date',
        'times',
        'total',
        'telegram',
        'comment',
        'status',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date:Y-m-d',
            'times' => 'array',
            'total' => 'integer',
            'status' => BookingStatus::class,
            'paid_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    /** Записи, занимающие слоты (не отклонённые) */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', '!=', BookingStatus::Declined);
    }

    public function scopeOnDate(Builder $query, string $date): Builder
    {
        return $query->whereDate('date', $date);
    }

    public function isPast(): bool
    {
        return $this->date->isPast() && ! $this->date->isToday();
    }
}
