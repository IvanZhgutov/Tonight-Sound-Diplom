<?php

namespace App\Models;

use App\Enums\PluginStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class Plugin extends Model
{
    protected $fillable = [
        'name',
        'vendor',
        'version',
        'category',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'status' => PluginStatus::class,
        ];
    }

    public function scopeRequested(Builder $query): Builder
    {
        return $query->where('status', PluginStatus::Requested);
    }
}
