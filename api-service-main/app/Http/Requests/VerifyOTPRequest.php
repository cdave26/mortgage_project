<?php

namespace App\Http\Requests;

class VerifyOTPRequest extends FormRequest
{
    /**
     * Get custom messages for validator errors.
     *
     * @return array
     */
    public function messages()
    {
        return [
            'otp.required' => 'The :attribute is required.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array
     */
    public function attributes()
    {
        return [
            'otp' => 'One-Time Password (OTP)',
        ];
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'email', 'exists:users'],
            'otp' => ['required', 'digits:6'],
            'ip' => ['required', 'ip'],
            'trusted' => ['boolean'],
        ];
    }
}
