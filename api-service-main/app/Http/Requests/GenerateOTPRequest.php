<?php

namespace App\Http\Requests;

use App\Enums\OTPChannel;
use Illuminate\Validation\Rules\Enum;

class GenerateOTPRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        $channels = new Enum(OTPChannel::class);

        return [
            'email' => ['required', 'email', 'exists:users'],
            'channel' => ['required', $channels],
        ];
    }
}
