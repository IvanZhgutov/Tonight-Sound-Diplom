<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RequestPluginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:2', 'max:120'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Введите название плагина.',
            'name.min' => 'Название слишком короткое.',
            'name.max' => 'Название слишком длинное (максимум 120 символов).',
        ];
    }
}
