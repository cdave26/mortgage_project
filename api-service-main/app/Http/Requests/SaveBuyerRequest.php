<?php

namespace App\Http\Requests;

use App\Enums\DownPaymentType;
use App\Models\Buyer;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;
use Illuminate\Validation\Rules\Unique;

class SaveBuyerRequest extends FormRequest
{
    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'borrower_state_id' => 'borrower state',
            'co_borrower_first_name' => 'co-borrower first name',
            'co_borrower_last_name' => 'co-borrower last name',
            'co_borrower_email' => 'co-borrower email',
            'property_type_id' => 'property type',
            'occupancy_type_id' => 'occupancy type',
            'unit_id' => 'unit',
            'property_state_id' => 'property state',
            'property_county_id' => 'property county',
            'credit_score_range_id' => 'credit score range',
            'veterans_affairs' => 'veterans',
            'company_id' => 'company',
        ];
    }

    public function uniqueBorrower(): string | Unique
    {
        if (in_array($this->method(), ['PUT', 'PATCH'])) {
            $buyer = Buyer::findOrFail($this->buyer);

            return Rule::unique('users', 'email')
                ->ignore($buyer->borrower);
        }

        return 'unique:users,email';
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        $downPaymentType = new Enum(DownPaymentType::class);

        return [
            'loan_id' => ['nullable', 'integer'],
            'borrower_first_name' => ['required', 'string', 'max:50'],
            'borrower_last_name' => ['required', 'string', 'max:50'],
            'borrower_email' => ['required', 'email', $this->uniqueBorrower()],
            'borrower_mobile_number' => ['required', 'string', 'size:14'],
            'borrower_address' => ['required', 'string'],
            'borrower_city' => ['required', 'string'],
            'borrower_state_id' => ['required', 'exists:states,id'],
            'borrower_zip' => ['required', 'integer'],
            'co_borrower_first_name' => ['nullable', 'string', 'max:50'],
            'co_borrower_last_name' => ['nullable', 'string', 'max:50'],
            'co_borrower_email' => ['nullable', 'email'],
            'agent_first_name' => ['nullable', 'string', 'max:50'],
            'agent_last_name' => ['nullable', 'string', 'max:50'],
            'agent_email' => ['nullable', 'email'],
            'property_type_id' => ['required', 'exists:property_types,id'],
            'occupancy_type_id' => ['required', 'exists:occupancy_types,id'],
            'unit_id' => ['required', 'exists:units,id'],
            'property_state_id' => ['required', 'exists:states,id'],
            'property_county_id' => ['required', 'exists:counties,id'],
            'credit_score_range_id' => ['required', 'exists:credit_score_ranges,id'],
            'debt_to_income_ratio' => ['required', 'numeric', 'min:0', 'max:100'],
            'veterans_affairs' => ['required', 'boolean'],
            'max_qualifying_payment' => ['required', 'numeric', 'min:0'],
            'max_down_payment' => ['required', 'numeric', 'min:0'],
            'first_time_home_buyers' => ['required', 'boolean'],
            'homeowners_insurance' => ['required', 'numeric', 'min:0'],
            'purchase_price' => ['required', 'numeric', 'min:0'],
            'default_down_payment_type' => ['required', $downPaymentType],
            'default_down_payment_value' => ['required', 'numeric', 'min:0'],
            'self_employed' => ['required', 'boolean'],
            'company_id' => ['required', 'exists:companies,id'],
        ];
    }
}
