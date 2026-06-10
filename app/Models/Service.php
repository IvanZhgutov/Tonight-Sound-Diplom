<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Service extends Model
{
    protected $fillable = [
        'slug',
        'name',
        'price',
        'hourly',
        'bookable',
        'icon',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'integer',
            'hourly' => 'boolean',
            'bookable' => 'boolean',
        ];
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    /** Стоимость сессии для набора часов */
    public function totalFor(int $hoursCount): ?int
    {
        if ($this->price === null) {
            return null;
        }

        return $this->hourly ? $this->price * $hoursCount : $this->price;
    }
}
