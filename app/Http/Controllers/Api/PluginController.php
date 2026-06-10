<?php

namespace App\Http\Controllers\Api;

use App\Enums\PluginStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\RequestPluginRequest;
use App\Http\Resources\PluginResource;
use App\Models\Plugin;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\ValidationException;

class PluginController extends Controller
{
    /**
     * GET /api/plugins
     * ?search= — по названию и вендору
     * ?category= — фильтр по категории
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $plugins = Plugin::query()
            ->when($request->filled('search'), function ($q) use ($request) {
                $term = '%'.mb_strtolower($request->string('search')).'%';
                $q->where(function ($q) use ($term) {
                    $q->whereRaw('LOWER(name) LIKE ?', [$term])
                        ->orWhereRaw('LOWER(vendor) LIKE ?', [$term]);
                });
            })
            ->when($request->filled('category'), fn ($q) => $q->where('category', $request->string('category')))
            ->orderBy('category')
            ->orderBy('name')
            ->get();

        return PluginResource::collection($plugins);
    }

    /**
     * POST /api/plugins/requests — «Не нашли плагин? Напишите его нам»
     */
    public function storeRequest(RequestPluginRequest $request): JsonResponse
    {
        $name = trim($request->string('name'));

        $exists = Plugin::whereRaw('LOWER(name) = ?', [mb_strtolower($name)])->exists();

        if ($exists) {
            throw ValidationException::withMessages([
                'name' => 'Этот плагин уже есть в студии или в списке на добавление.',
            ]);
        }

        $plugin = Plugin::create([
            'name' => $name,
            'vendor' => 'По запросу артиста',
            'category' => 'Скоро',
            'status' => PluginStatus::Requested,
        ]);

        return response()->json([
            'message' => "«{$name}» добавлен в список — скоро он появится в студии!",
            'plugin' => new PluginResource($plugin),
        ], 201);
    }
}
