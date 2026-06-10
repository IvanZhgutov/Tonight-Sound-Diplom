<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'date' => $this->date?->format('Y-m-d'),
            'times' => $this->times ?? [],
            'service' => new ServiceResource($this->whenLoaded('service')),
            'total' => $this->total,
            'telegram' => $this->telegram,
            'comment' => $this->comment,
            'status' => $this->status,
            'is_past' => $this->date ? $this->isPast() : false,
            'user' => new UserResource($this->whenLoaded('user')),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
