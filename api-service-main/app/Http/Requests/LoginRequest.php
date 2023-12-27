<?php

namespace App\Http\Requests;

class LoginRequest extends \Laravel\Fortify\Http\Requests\LoginRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            ...parent::rules(),
            'company' => ['exists:companies,id'],
            'ip' => ['required', 'ip'],
        ];
    }
}
