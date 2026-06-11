<?php

namespace App\Http\Requests;

use App\Enums\BookingStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBookingStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // маршрут уже под admin-middleware
    }

    public function rules(): array
    {
        return [
            'status' => [
                'required',
                Rule::in([
                    BookingStatus::Confirmed->value,
                    BookingStatus::Declined->value,
                    BookingStatus::Completed->value,
                    BookingStatus::Paid->value,
                    BookingStatus::NoShow->value,
                ]),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'status.required' => 'Укажите статус.',
            'status.in' => 'Недопустимый статус.',
        ];
    }
}
