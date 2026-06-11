<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\BookingStatus;
use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Plugin;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class StatsController extends Controller
{
    /**
     * GET /api/admin/stats — счётчики для дашборда
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'pending_bookings' => Booking::where('status', BookingStatus::Pending)->count(),
            'pending_plugins' => Plugin::requested()->count(),
            'users' => User::where('is_admin', false)->count(),
        ]);
    }
}
