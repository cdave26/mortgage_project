<?php

namespace App\Http\Requests;

class SearchBuyerRequest extends FormRequest
{
    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'property_type.*' => 'property type',
            'state.*' => 'state',
            'order_by.borrower_first_name' => 'order by',
            'order_by.borrower_last_name' => 'order by',
            'order_by.occupancy_type' => 'order by',
            'order_by.property_type' => 'order by',
            'order_by.property_state' => 'order by',
            'order_by.agent_name' => 'order by',
            'order_by.loan_officer_name' => 'order by',
            'order_by.created_at' => 'order by',
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
            'name' => ['string'],
            'property_type' => ['array'],
            'property_type.*' => ['exists:property_types,id'],
            'state' => ['array'],
            'state.*' => ['exists:states,id'],
            'loan_officer' => ['string'],
            'company' => ['exists:companies,id'],
            'order_by' => ['array'],
            'order_by.borrower_first_name' => ['in:ASC,DESC'],
            'order_by.borrower_last_name' => ['in:ASC,DESC'],
            'order_by.occupancy_type' => ['in:ASC,DESC'],
            'order_by.property_type' => ['in:ASC,DESC'],
            'order_by.property_state' => ['in:ASC,DESC'],
            'order_by.agent_name' => ['in:ASC,DESC'],
            'order_by.loan_officer_name' => ['in:ASC,DESC'],
            'order_by.created_at' => ['in:ASC,DESC'],
            'per_page' => ['integer'],
        ];
    }
}
