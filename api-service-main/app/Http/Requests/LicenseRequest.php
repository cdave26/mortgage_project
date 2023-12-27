<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class LicenseRequest extends FormRequest
{
    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'user_id' => 'user',
            'state_id' => 'state',
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
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'state_id' => [
                'required',
                'integer',
                'exists:states,id',
                Rule::unique('licenses', 'state_id')
                    ->where('user_id', $this->user_id)
                    ->whereNull('deleted_at')
                    ->ignore($this->state_id, 'state_id')
            ],
            'license' => [
                'required',
                'string',
                Rule::unique('licenses', 'license')
                    ->where('user_id', $this->user_id)
                    ->where('state_id', $this->state_id)
                    ->whereNull('deleted_at')
                    ->ignore($this->state_id, 'state_id')
                    ->ignore($this->license, 'license')
            ],
        ];
    }
}
