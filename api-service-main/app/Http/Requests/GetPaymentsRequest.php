<?php

namespace App\Http\Requests;

use App\Enums\DownPaymentType;
use Illuminate\Validation\Rules\Enum;

class GetPaymentsRequest extends FormRequest
{
    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'property_type_id' => 'property type',
            'occupancy_type_id' => 'occupancy type',
            'credit_score_range_id' => 'credit score range',
            'veterans_affairs' => 'veterans',
        ];
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        $type = DownPaymentType::tryFrom($this->down_payment_type);

        $max = match ($type) {
            DownPaymentType::PERCENTAGE => ['max:100'],
            default => [],
        };

        return [
            'price' => ['required', 'numeric', 'min:0'],
            'down_payment_type' => ['required', new Enum(DownPaymentType::class)],
            'down_payment' => ['required', 'numeric', 'min:0', ...$max],
            'loan_amount' => ['required', 'numeric', 'min:0'],
            'tax' => ['required', 'numeric', 'min:0'],
            'seller_credit' => ['required', 'numeric', 'min:0'],
            'property_type_id' => ['required', 'exists:property_types,id'],
            'occupancy_type_id' => ['required', 'exists:occupancy_types,id'],
            'credit_score_range_id' => ['required', 'exists:credit_score_ranges,id'],
            'debt_to_income_ratio' => ['required', 'numeric', 'min:0', 'max:100'],
            'homeowners_association_fee' => ['required', 'numeric', 'min:0'],
            'insurance' => ['required', 'numeric', 'min:0'],
            'veterans_affairs' => ['required', 'boolean'],
            'first_time_home_buyers' => ['required', 'boolean'],
            'veterans_affairs_approved' => ['required', 'boolean'],
            'first_time_home_buyers_approved' => ['required', 'boolean'],
            'county_id' => ['required', 'exists:counties,id'],
        ];
    }
}
