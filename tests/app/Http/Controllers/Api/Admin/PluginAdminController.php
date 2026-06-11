<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\PluginStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\PluginResource;
use App\Models\Plugin;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class PluginAdminController extends Controller
{
    /** Категории, в которые админ может добавлять плагины */
    public const CATEGORIES = [
        'EQ', 'Компрессор', 'Реверб', 'Синтезатор', 'Вокал', 'Мастеринг', 'Эффект',
    ];

    /**
     * POST /api/admin/plugins — админ добавляет плагин в каталог
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:120'],
            'vendor' => ['nullable', 'string', 'max:120'],
            'version' => ['nullable', 'string', 'max:32'],
            'category' => ['required', Rule::in(self::CATEGORIES)],
        ], [
            'name.required' => 'Укажите название плагина.',
            'name.min' => 'Название слишком короткое.',
            'category.required' => 'Выберите категорию.',
            'category.in' => 'Недопустимая категория.',
        ]);

        $name = trim($validated['name']);

        if (Plugin::whereRaw('LOWER(name) = ?', [mb_strtolower($name)])->exists()) {
            throw ValidationException::withMessages([
                'name' => 'Плагин с таким названием уже есть в каталоге.',
            ]);
        }

        $plugin = Plugin::create([
            'name' => $name,
            'vendor' => $validated['vendor'] ?? null,
            'version' => $validated['version'] ?? null,
            'category' => $validated['category'],
            'status' => PluginStatus::Available,
        ]);

        return response()->json([
            'message' => "«{$plugin->name}» добавлен в каталог.",
            'plugin' => new PluginResource($plugin),
        ], 201);
    }

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
     * DELETE /api/admin/plugins/{plugin} —
     * отклонить запрос артиста или убрать плагин из каталога
     */
    public function destroy(Plugin $plugin): JsonResponse
    {
        $wasRequest = $plugin->status === PluginStatus::Requested;
        $plugin->delete();

        return response()->json([
            'message' => $wasRequest ? 'Запрос отклонён.' : 'Плагин удалён из каталога.',
        ]);
    }
}
