<?php

namespace App\Http\Requests;

class CheckUserRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'string'],
            'company_id' => ['exists:companies,id'],
        ];
    }
}
