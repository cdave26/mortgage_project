<?php

namespace App\Http\Requests;

use App\Enums\Buydown;
use App\Enums\DownPaymentType;
use Illuminate\Validation\Rules\Enum;

class GetRateProviderRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        return [
            'property_value' => ['required', 'numeric', 'min:0'],
            'loan_purpose' => ['required', 'string'],
            'loan_amount' => ['required', 'numeric', 'min:0'],
            'ltv' => ['required', 'numeric', 'min:0', 'max:100'],
            'down_payment_type' => ['required', new Enum(DownPaymentType::class)],
            'credit_score' => ['required', 'exists:App\Models\CreditScoreRange,id'],
            'occupancy' => ['required', 'exists:App\Models\OccupancyType,id'],
            'property_type' => ['required', 'exists:App\Models\PropertyType,id'],
            'state_id' => ['required', 'exists:App\Models\State,id'],
            'county_id' => ['required', 'exists:App\Models\County,id'],
            'is_military_veteran' => ['required', 'boolean'],
            'property_taxes' => ['required', 'numeric', 'min:0'],
            'hoa_dues' => ['required', 'numeric', 'min:0'],
            'units_count' => ['required', 'string'],
            'heloc_loan_amount' => ['nullable', 'numeric', 'min:0'],
            'is_first_time_buyer' => ['required', 'boolean'],
            'is_self_employed' => ['required', 'boolean'],
            'seller_credits' => ['required', 'numeric', 'min:0'],
            'homeowners_insurance' => ['required', 'numeric', 'min:0'],
            'buydown' => ['required', new Enum(Buydown::class)],
        ];
    }
}
