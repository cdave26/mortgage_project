<?php

namespace App\Http\Requests;

use App\Enums\Buydown;
use App\Enums\DownPaymentType;
use Illuminate\Validation\Rules\Enum;

class ListingGetPaymentsRequest extends FormRequest
{   
    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'property_value' => 'offer price',
        ];
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        return [
            'property_value' => ['required', 'numeric', 'min:1'],
            'loan_amount' => ['required', 'numeric', 'min:0'],
            'down_payment' => ['required', 'numeric', 'min:0'],
            'down_payment_type' => ['required', new Enum(DownPaymentType::class)],
            'occupancy' => ['required', 'exists:App\Models\OccupancyType,id'],
            'credit_score' => ['required', 'exists:App\Models\CreditScoreRange,id'],
            'is_military_veteran' => ['required', 'boolean'],
            'is_first_time_buyer' => ['required', 'boolean'],
            'seller_credits' => ['required', 'numeric', 'min:0'],
            'buydown' => ['required', new Enum(Buydown::class)],
        ];
    }
}
