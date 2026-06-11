<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\BookingStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\BookingResource;
use App\Models\ClientNote;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClientAdminController extends Controller
{
    /**
     * Список клиентов с CRM-агрегатами.
     * GET /api/admin/clients?search=&sort=spent|recent|debt
     */
    public function index(Request $request): JsonResponse
    {
        $clients = $this->withAggregates(User::query())
            ->where('is_admin', false)
            ->when($request->filled('search'), function (Builder $q) use ($request) {
                $term = '%'.mb_strtolower($request->string('search')).'%';
                $q->where(function (Builder $q) use ($term) {
                    $q->whereRaw('LOWER(name) LIKE ?', [$term])
                        ->orWhereRaw('LOWER(email) LIKE ?', [$term]);
                });
            })
            ->when($request->string('sort')->toString(), function (Builder $q, string $sort) {
                match ($sort) {
                    'recent' => $q->orderByDesc('last_booking'),
                    'debt' => $q->orderByDesc('debt'),
                    default => $q->orderByDesc('total_spent'),
                };
            }, fn (Builder $q) => $q->orderByDesc('total_spent'))
            ->get()
            ->map(fn (User $u) => $this->clientPayload($u));

        return response()->json(['data' => $clients]);
    }

    /**
     * Карточка клиента: профиль, статистика, история записей, заметки.
     * GET /api/admin/clients/{client}
     */
    public function show(User $client): JsonResponse
    {
        abort_if($client->is_admin, 404);

        $client = $this->withAggregates(User::query())->findOrFail($client->id);
        $client->load([
            'bookings' => fn ($q) => $q->with('service')->orderByDesc('date'),
            'notes.author',
        ]);

        return response()->json([
            'data' => array_merge($this->clientPayload($client), [
                'bookings' => BookingResource::collection($client->bookings),
                'notes' => $client->notes->map(fn (ClientNote $n) => [
                    'id' => $n->id,
                    'text' => $n->text,
                    'author' => $n->author?->name,
                    'created_at' => $n->created_at->toIso8601String(),
                ]),
            ]),
        ]);
    }

    /**
     * Обновление CRM-полей клиента (теги, телефон).
     * PATCH /api/admin/clients/{client}
     */
    public function update(Request $request, User $client): JsonResponse
    {
        abort_if($client->is_admin, 404);

        $validated = $request->validate([
            'tags' => ['sometimes', 'array', 'max:10'],
            'tags.*' => ['string', 'max:24'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:32'],
        ], [
            'tags.max' => 'Максимум 10 тегов.',
            'tags.*.max' => 'Тег слишком длинный (максимум 24 символа).',
        ]);

        if (array_key_exists('tags', $validated)) {
            $validated['tags'] = array_values(array_unique(array_filter(
                array_map('trim', $validated['tags'])
            )));
        }

        $client->update($validated);

        return response()->json([
            'message' => 'Данные клиента обновлены.',
            'data' => $this->clientPayload(
                $this->withAggregates(User::query())->findOrFail($client->id)
            ),
        ]);
    }

    /**
     * POST /api/admin/clients/{client}/notes
     */
    public function storeNote(Request $request, User $client): JsonResponse
    {
        abort_if($client->is_admin, 404);

        $validated = $request->validate(
            ['text' => ['required', 'string', 'max:2000']],
            ['text.required' => 'Заметка не может быть пустой.', 'text.max' => 'Заметка слишком длинная.'],
        );

        $note = $client->notes()->create([
            'author_id' => $request->user()->id,
            'text' => trim($validated['text']),
        ]);

        return response()->json([
            'message' => 'Заметка добавлена.',
            'note' => [
                'id' => $note->id,
                'text' => $note->text,
                'author' => $request->user()->name,
                'created_at' => $note->created_at->toIso8601String(),
            ],
        ], 201);
    }

    /**
     * DELETE /api/admin/notes/{note}
     */
    public function destroyNote(ClientNote $note): JsonResponse
    {
        $note->delete();

        return response()->json(['message' => 'Заметка удалена.']);
    }

    /* ------------------------------------------------------------------ */

    private function withAggregates(Builder $query): Builder
    {
        return $query
            ->withCount('bookings')
            ->withSum([
                'bookings as total_spent' => fn ($q) => $q->where('status', BookingStatus::Paid),
            ], 'total')
            ->withSum([
                'bookings as debt' => fn ($q) => $q->where('status', BookingStatus::Completed),
            ], 'total')
            ->withMax('bookings as last_booking', 'date');
    }

    private function clientPayload(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'tags' => $user->tags ?? [],
            'bookings_count' => $user->bookings_count ?? 0,
            'total_spent' => (int) ($user->total_spent ?? 0),
            'debt' => (int) ($user->debt ?? 0),
            'last_booking' => $user->last_booking,
            'registered_at' => $user->created_at?->format('Y-m-d'),
        ];
    }
}
