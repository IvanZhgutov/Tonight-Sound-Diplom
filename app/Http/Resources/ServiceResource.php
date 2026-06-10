<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'name' => $this->name,
            'price' => $this->price,
            'hourly' => $this->hourly,
            'bookable' => $this->bookable,
            'icon' => $this->icon,
            'description' => $this->description,
        ];
    }
}
