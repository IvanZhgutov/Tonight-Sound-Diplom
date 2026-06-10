<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // маршрут уже под auth:sanctum
    }

    public function rules(): array
    {
        return [
            'date' => ['required', 'date_format:Y-m-d', 'after:today'],
            'times' => ['required', 'array', 'min:1', 'max:24'],
            'times.*' => ['string', 'distinct', 'regex:/^([01]\d|2[0-3]):00$/'],
            'service' => [
                'required',
                'string',
                Rule::exists('services', 'slug')->where('bookable', true),
            ],
            'telegram' => ['required', 'string', 'max:64'],
            'comment' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'date.required' => 'Выберите день записи.',
            'date.after' => 'Записаться можно начиная с завтрашнего дня.',
            'times.required' => 'Выберите хотя бы один час.',
            'times.min' => 'Выберите хотя бы один час.',
            'times.*.regex' => 'Время должно быть в формате HH:00.',
            'times.*.distinct' => 'Часы не должны повторяться.',
            'service.required' => 'Выберите услугу.',
            'service.exists' => 'Эта услуга недоступна для онлайн-записи.',
            'telegram.required' => 'Укажите Telegram ID для связи.',
            'comment.max' => 'Комментарий слишком длинный (максимум 1000 символов).',
        ];
    }
}
