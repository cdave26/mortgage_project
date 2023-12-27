<?php

namespace App\Http\Requests;

class HtmlToPdfRequest extends FormRequest
{
    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'state_id' => 'state',
            'qr_image' => 'QR image',
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
            'source' => ['required', 'in:listing,marketing'],
            'flyer_id' => ['required', 'exists:flyers,id'],
            'listing_id' => ['exists:listings,id'],
            'state_id' => ['exists:states,id'],
            'qr_image' => ['string'],
        ];
    }
}
