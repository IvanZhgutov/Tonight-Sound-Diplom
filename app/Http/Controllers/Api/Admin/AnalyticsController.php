<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\BookingStatus;
use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        // Период из запроса; по умолчанию — последние 30 дней
        $to = $request->filled('to')
            ? Carbon::parse($request->date('to'))->endOfDay()
            : Carbon::today()->endOfDay();

        $from = $request->filled('from')
            ? Carbon::parse($request->date('from'))->startOfDay()
            : (clone $to)->subDays(29)->startOfDay();

        // Защита: from не позже to
        if ($from->gt($to)) {
            [$from, $to] = [$to->copy()->startOfDay(), $from->copy()->endOfDay()];
        }

        $completed = BookingStatus::Completed;

        // --- Тайлы за период ---
        $paidQuery = Booking::where('status', $completed)
            ->whereBetween('date', [$from->toDateString(), $to->toDateString()]);

        $revenue   = (int) (clone $paidQuery)->sum('total');
        $paidCount = (clone $paidQuery)->count();

        $tiles = [
            'revenue'   => $revenue,
            'bookings'  => Booking::whereBetween('date', [$from->toDateString(), $to->toDateString()])
                ->where('status', '!=', BookingStatus::Declined)
                ->count(),
            'avg_check' => $paidCount > 0 ? (int) round($revenue / $paidCount) : 0,
        ];

        // --- Выручка по месяцам внутри периода ---
        $monthly = Booking::where('status', $completed)
            ->whereBetween('date', [$from->toDateString(), $to->toDateString()])
            ->select(
                DB::raw("DATE_FORMAT(date, '%Y-%m') as month"),
                DB::raw('SUM(total) as revenue'),
            )
            ->groupBy('month')->orderBy('month')->get()
            ->map(fn ($r) => ['month' => $r->month, 'revenue' => (int) $r->revenue]);

        // --- Выручка по дням внутри периода (для коротких диапазонов) ---
        $daily = Booking::where('status', $completed)
            ->whereBetween('date', [$from->toDateString(), $to->toDateString()])
            ->select(
                DB::raw('date as day'),
                DB::raw('SUM(total) as revenue'),
            )
            ->groupBy('day')->orderBy('day')->get()
            ->map(fn ($r) => [
                'day' => \Illuminate\Support\Carbon::parse($r->day)->toDateString(),
                'revenue' => (int) $r->revenue,
            ]);

        // --- Популярность услуг за период ---
        $services = Booking::query()
            ->join('services', 'services.id', '=', 'bookings.service_id')
            ->whereBetween('bookings.date', [$from->toDateString(), $to->toDateString()])
            ->where('bookings.status', '!=', BookingStatus::Declined)
            ->select(
                'services.name',
                DB::raw('COUNT(*) as count'),
                DB::raw("SUM(CASE WHEN bookings.status = 'completed' THEN bookings.total ELSE 0 END) as revenue"),
            )
            ->groupBy('services.name')->orderByDesc('count')->get()
            ->map(fn ($r) => [
                'name' => $r->name, 'count' => (int) $r->count, 'revenue' => (int) $r->revenue,
            ]);

        // --- Загрузка по дням недели за период ---
        $weekdays = Booking::query()
            ->whereBetween('date', [$from->toDateString(), $to->toDateString()])
            ->where('status', '!=', BookingStatus::Declined)
            ->select(DB::raw('WEEKDAY(date) + 1 as dow'), DB::raw('COUNT(*) as count'))
            ->groupBy('dow')->orderBy('dow')->get()
            ->map(fn ($r) => ['dow' => (int) $r->dow, 'count' => (int) $r->count]);

        return response()->json([
            'period' => ['from' => $from->toDateString(), 'to' => $to->toDateString()],
            'tiles' => $tiles,
            'monthly' => $monthly,
            'daily' => $daily,
            'services' => $services,
            'weekdays' => $weekdays,
        ]);
    }
}