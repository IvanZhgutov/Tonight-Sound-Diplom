<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AvailabilityController extends Controller
{
    /**
     * GET /api/availability?date=YYYY-MM-DD
     * Возвращает занятые часы на дату (из не-отклонённых записей).
     */
    public function show(Request $request): JsonResponse
    {
        $validated = $request->validate(
            ['date' => ['required', 'date_format:Y-m-d']],
            ['date.required' => 'Укажите дату.', 'date.date_format' => 'Дата в формате YYYY-MM-DD.'],
        );

        $busy = Booking::query()
            ->onDate($validated['date'])
            ->active()
            ->pluck('times')
            ->flatten()
            ->unique()
            ->sort()
            ->values();

        return response()->json([
            'date' => $validated['date'],
            'busy' => $busy,
        ]);
    }
}
