<?php

namespace App\Http\Requests;

use App\Enums\DownPaymentType;
use Illuminate\Validation\Rules\Enum;

class SaveBuyersPreApprovalRequest extends FormRequest
{
    /**
     * Get custom messages for validator errors.
     *
     * @return array
     */
    public function messages(): array
    {
        return [
            'down_payment.in' => 'The :attribute field must be equal to :values.',
            'loan_amount.in' => 'The :attribute field must be equal to :values.',
        ];
    }

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
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        $downPayment = $loanAmount = [];

        $price = $this->price ?? 0;

        $type = DownPaymentType::tryFrom($this->down_payment_type);

        if ($price) {
            $loanAmount[] = implode(['max:', $price]);

            $downPayment[] = match ($type) {
                DownPaymentType::PERCENTAGE => 'max:100',
                default => implode(['max:', $price]),
            };
        }

        return [
            'price' => ['required', 'numeric', 'min:0'],
            'down_payment_type' => ['required', new Enum(DownPaymentType::class)],
            'down_payment' => ['required', 'numeric', 'min:0', ...$downPayment],
            'loan_amount' => ['required', 'numeric', 'min:0', ...$loanAmount],
            'tax' => ['required', 'numeric', 'min:0'],
            'seller_credit' => ['required', 'numeric', 'min:0'],
            'property_type_id' => ['required', 'exists:property_types,id'],
            'occupancy_type_id' => ['required', 'exists:occupancy_types,id'],
            'credit_score_range_id' => ['required', 'exists:credit_score_ranges,id'],
            'debt_to_income_ratio' => ['required', 'numeric', 'min:0', 'max:100'],
            'homeowners_association_fee' => ['required', 'numeric', 'min:0'],
            'veterans_affairs' => ['required', 'boolean'],
            'first_time_home_buyers' => ['required', 'boolean'],
            'address' => ['required', 'string'],
            'city' => ['required', 'string'],
            'zip' => ['required', 'integer'],
            'county_id' => ['required', 'exists:counties,id'],
            'veterans_affairs_approved' => ['boolean'],
            'first_time_home_buyers_approved' => ['boolean'],
            'payments' => ['required', 'array'],
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
