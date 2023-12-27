<?php

namespace App\Http\Requests;

class ListingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        return [
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'company_id' => ['required','integer', 'exists:companies,id'],
            'user_license_id' => 'required', 'integer', 'exists:licenses,id',
            'state_id' => ['required' ,'integer','exists:states,id'],
            'county_id' => ['required' ,'integer', 'exists:counties,id'],
            'mls_number' => ['required', 'string'],
            'mls_link' => ['nullable', 'string'],
            'page_link' => ['nullable', 'string'],
            'listing_agent_name' => ['required', 'string'],
            'listing_agent_email' => ['required', 'email'],
            'property_address' => ['required', 'string'],
            'property_apt_suite' => ['nullable', 'string'],
            'property_city' => ['required', 'string'],
            'property_zip' => ['required', 'string'],
            'property_type' => ['required', 'exists:property_types,id'],
            'units_count' => ['required', 'exists:units,id'],
            'property_value' => ['required', 'numeric', 'min:0'],
            'seller_credits' => ['required', 'numeric', 'min:0'],
            'credit_verified_by' => ['required', 'string'],
            'default_down_payment' => ['required', 'numeric', 'min:0'],
            'loan_amount' => ['nullable', 'numeric','min:0'],
            'hoa_dues' => ['nullable', 'numeric','min:0'],
            'property_taxes' => ['required', 'numeric', 'min:0'],
            'homeowners_insurance' => ['required', 'numeric', 'min:0'],
            'usda_lookup' => ['required', 'boolean'],
            'fha_condo_lookup' => ['required', 'boolean'],
            'va_condo_lookup' => ['required', 'boolean'],
            'listing_status' => ['required',' exists:listing_statuses,id'],
        ];
    }
}
