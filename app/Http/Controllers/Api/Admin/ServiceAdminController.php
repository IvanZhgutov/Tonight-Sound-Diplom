<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ServiceResource;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ServiceAdminController extends Controller
{
    /**
     * Управление ценами услуг.
     * PATCH /api/admin/services/{service}
     *
     * price: null → «по запросу». Уже созданные записи не пересчитываются —
     * их total зафиксирован на момент бронирования.
     */
    public function update(Request $request, Service $service): JsonResponse
    {
        $validated = $request->validate([
            'price' => ['present', 'nullable', 'integer', 'min:0', 'max:1000000'],
        ], [
            'price.present' => 'Передайте цену.',
            'price.integer' => 'Цена должна быть целым числом.',
            'price.min' => 'Цена не может быть отрицательной.',
            'price.max' => 'Слишком большая цена.',
        ]);

        $service->update($validated);

        return response()->json([
            'message' => "Цена услуги «{$service->name}» обновлена.",
            'service' => new ServiceResource($service),
        ]);
    }
}
