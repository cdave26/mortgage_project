<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rules\Password;

class ResetPasswordRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        $password = Password::min(8)
            ->letters()
            ->mixedCase()
            ->numbers()
            ->symbols();

        return [
            'email' => ['required', 'email', 'exists:users,email'],
            'password' => ['required', 'string', 'confirmed', $password],
            'ip' => ['required_if:trusted,true', 'ip', 'nullable'],
            'trusted' => ['boolean'],
        ];
    }
}
