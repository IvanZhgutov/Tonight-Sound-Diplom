<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ServiceResource;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ServiceController extends Controller
{
    /**
     * GET /api/services
     * ?bookable=1 — только услуги, доступные для онлайн-записи
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $services = Service::query()
            ->when($request->boolean('bookable'), fn ($q) => $q->where('bookable', true))
            ->orderBy('id')
            ->get();

        return ServiceResource::collection($services);
    }
}
