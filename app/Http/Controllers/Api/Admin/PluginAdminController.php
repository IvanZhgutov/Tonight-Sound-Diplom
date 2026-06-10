<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\PluginStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\PluginResource;
use App\Models\Plugin;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\ValidationException;

class PluginAdminController extends Controller
{
    /**
     * GET /api/admin/plugin-requests — запросы артистов
     */
    public function requests(): AnonymousResourceCollection
    {
        $plugins = Plugin::requested()->orderBy('created_at')->get();

        return PluginResource::collection($plugins);
    }

    /**
     * PATCH /api/admin/plugins/{plugin}/approve — плагин куплен и установлен
     */
    public function approve(Plugin $plugin): JsonResponse
    {
        if ($plugin->status !== PluginStatus::Requested) {
            throw ValidationException::withMessages([
                'plugin' => 'Этот плагин не находится в списке запросов.',
            ]);
        }

        $plugin->update([
            'status' => PluginStatus::Fresh,
            'category' => 'Новинка',
            'vendor' => 'Установлен в студии',
            'version' => 'v1.0',
        ]);

        return response()->json([
            'message' => 'Плагин добавлен в каталог.',
            'plugin' => new PluginResource($plugin),
        ]);
    }

    /**
     * DELETE /api/admin/plugins/{plugin} — отклонить запрос
     */
    public function destroy(Plugin $plugin): JsonResponse
    {
        if ($plugin->status !== PluginStatus::Requested) {
            throw ValidationException::withMessages([
                'plugin' => 'Удалять можно только запросы артистов.',
            ]);
        }

        $plugin->delete();

        return response()->json(['message' => 'Запрос отклонён.']);
    }
}
