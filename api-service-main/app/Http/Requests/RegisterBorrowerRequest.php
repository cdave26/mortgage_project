<?php

namespace App\Http\Requests;

use App\Models\Buyer;
use Illuminate\Validation\Rule;

class RegisterBorrowerRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        $username = [
            'required',
            'string',
            'unique:users',
        ];

        $code = $this->input('code');

        $buyer = Buyer::where('code', $code)
            ->first();

        if ($buyer) {
            $username[] = Rule::unique('users', 'email')
                ->ignore($buyer->borrower_id);
        }

        return [
            'code' => ['required', 'exists:buyers,code'],
            'username' => $username,
            'password' => ['required', 'string', 'confirmed'],
        ];
    }
}
