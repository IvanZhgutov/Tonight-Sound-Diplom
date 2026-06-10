<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBookingRequest;
use App\Http\Resources\BookingResource;
use App\Models\Booking;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class BookingController extends Controller
{
    /**
     * GET /api/bookings — записи текущего пользователя
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $bookings = $request->user()
            ->bookings()
            ->with('service')
            ->orderByDesc('date')
            ->get();

        return BookingResource::collection($bookings);
    }

    /**
     * POST /api/bookings — создать запись
     */
    public function store(StoreBookingRequest $request): JsonResponse
    {
        $service = Service::where('slug', $request->string('service'))->firstOrFail();

        $times = collect($request->input('times'))
            ->unique()
            ->sort()
            ->values();

        $booking = DB::transaction(function () use ($request, $service, $times) {
            // Блокируем записи этой даты, чтобы два человека
            // не забронировали один час одновременно
            $busy = Booking::query()
                ->onDate($request->string('date'))
                ->active()
                ->lockForUpdate()
                ->pluck('times')
                ->flatten();

            $conflicts = $times->intersect($busy);

            if ($conflicts->isNotEmpty()) {
                throw ValidationException::withMessages([
                    'times' => 'Эти часы уже заняты: '.$conflicts->implode(', ').'. Обновите страницу и выберите другое время.',
                ]);
            }

            return Booking::create([
                'user_id' => $request->user()->id,
                'service_id' => $service->id,
                'date' => $request->string('date'),
                'times' => $times->all(),
                'total' => $service->totalFor($times->count()),
                'telegram' => trim($request->string('telegram')),
                'comment' => $request->filled('comment') ? trim($request->string('comment')) : null,
            ]);
        });

        return response()->json([
            'message' => 'Запись создана! Мы свяжемся с вами в Telegram для подтверждения.',
            'booking' => new BookingResource($booking->load('service')),
        ], 201);
    }

    /**
     * DELETE /api/bookings/{booking} — отменить свою будущую запись
     */
    public function destroy(Request $request, Booking $booking): JsonResponse
    {
        abort_if($booking->user_id !== $request->user()->id, 403, 'Это не ваша запись.');

        if ($booking->isPast()) {
            throw ValidationException::withMessages([
                'booking' => 'Прошедшую запись нельзя отменить.',
            ]);
        }

        $booking->delete();

        return response()->json(['message' => 'Запись отменена.']);
    }
}
