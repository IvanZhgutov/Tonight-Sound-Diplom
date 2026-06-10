<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateBookingStatusRequest;
use App\Http\Resources\BookingResource;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\ValidationException;

class BookingAdminController extends Controller
{
    /**
     * GET /api/admin/bookings — все заявки
     * ?status=pending|confirmed|declined
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $bookings = Booking::query()
            ->with(['service', 'user'])
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')))
            ->orderByRaw("FIELD(status, 'pending', 'confirmed', 'declined')")
            ->orderBy('date')
            ->get();

        return BookingResource::collection($bookings);
    }

    /**
     * PATCH /api/admin/bookings/{booking}/status
     */
    public function updateStatus(UpdateBookingStatusRequest $request, Booking $booking): JsonResponse
    {
        if ($booking->isPast()) {
            throw ValidationException::withMessages([
                'booking' => 'Нельзя менять статус прошедшей записи.',
            ]);
        }

        $booking->update(['status' => $request->input('status')]);

        return response()->json([
            'message' => 'Статус обновлён.',
            'booking' => new BookingResource($booking->load(['service', 'user'])),
        ]);
    }
}
