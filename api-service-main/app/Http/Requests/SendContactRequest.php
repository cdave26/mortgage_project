<?php

namespace App\Http\Requests;

use App\Enums\DownPaymentType;
use Illuminate\Validation\Rules\Enum;

class SendContactRequest extends FormRequest
{
    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'payments.*.search_id' => "payment's search ID",
            'payments.*.product_id' => "payment's product ID",
            'payments.*.quote_number' => "payment's quote number",
            'payments.*.interest_rate' => "payment's interest rate",
            'payments.*.annual_percentage_rate' => "payment's annual percentage rate",
            'payments.*.monthly_principal_interest' => "payment's monthly principal interest",
            'payments.*.mortgage_insurance' => "payment's mortgage insurance",
            'payments.*.lock_period' => "payment's lock period",
            'payments.*.tax' => "payment's tax",
            'payments.*.insurance' => "payment's insurance",
            'payments.*.total_payment' => "payment's total payment",
            'payments.*.homeowners_association_fee' => "payment's homeowners association fee",
        ];
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        $type = DownPaymentType::tryFrom($this->down_payment_type);

        $max = match ($type) {
            DownPaymentType::PERCENTAGE => ['max:100'],
            default => [],
        };

        return [
            'recipient' => ['required', 'exists:users,email'],
            'sender' => ['required', 'string'],
            'email' => ['required', 'email'],
            'contact_number' => ['required', 'string'],
            'property_address' => ['string'],
            'comments' => ['required', 'string'],
            'price' => ['numeric', 'min:0'],
            'down_payment_type' => [new Enum(DownPaymentType::class)],
            'down_payment' => ['numeric', 'min:0', ...$max],
            'seller_credit' => ['numeric', 'min:0'],
            'loan_amount' => ['numeric', 'min:0'],
            'credit_score_range_id' => ['exists:credit_score_ranges,id'],
            'occupancy_type_id' => ['exists:occupancy_types,id'],
            'veterans_affairs' => ['boolean'],
            'first_time_home_buyers' => ['boolean'],
            'payments' => ['array'],
            'payments.*.search_id' => ['required', 'string'],
            'payments.*.product_id' => ['required', 'integer'],
            'payments.*.quote_number' => ['integer'],
            'payments.*.interest_rate' => ['required', 'numeric', 'min:0'],
            'payments.*.annual_percentage_rate' => ['required', 'numeric', 'min:0'],
            'payments.*.monthly_principal_interest' => ['required', 'numeric', 'min:0'],
            'payments.*.mortgage_insurance' => ['required', 'numeric', 'min:0'],
            'payments.*.lock_period' => ['required', 'integer', 'min:1'],
            'payments.*.tax' => ['required', 'numeric', 'min:0'],
            'payments.*.insurance' => ['required', 'numeric', 'min:0'],
            'payments.*.total_payment' => ['required', 'numeric', 'min:0'],
            'payments.*.homeowners_association_fee' => ['required', 'numeric', 'min:0'],
        ];
    }
}
