<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class CompanyResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $logo = ($this->company_logo && Storage::exists($this->company_logo)) ? Storage::url($this->company_logo)
            : config('services.sendgrid.default_company_logo');

        return [
            'id' => $this->id,
            'pricing_engine_id' => $this->pricing_engine_id,
            'code' => $this->code,
            'name' => $this->name,
            'has_company_msa' => $this->has_company_msa,
            'address' => $this->address,
            'city' => $this->city,
            'state' => $this->state,
            'zip' => $this->zip,
            'company_logo' => $logo,
            'header_background_color' => $this->header_background_color,
            'header_text_color' => $this->header_text_color,
            'listing_disclaimer' => $this->listing_disclaimer,
            'is_enterprise' => $this->is_enterprise,
            'enterprise_max_user' => $this->enterprise_max_user,
            'hubspot_company_id' => $this->hubspot_company_id,
            'deleted_at' => $this->deleted_at,
            'created_at' => $this->created_at,
            'company_privacy_policy_url' => $this->company_privacy_policy_URL,
            'company_terms_of_tervice_url' => $this->company_terms_of_tervice_URL,
            'company_nmls_number' => $this->company_nmls_number,
            'company_mobile_number' => $this->company_mobile_number,
            'additional_details' => $this->additional_details,
            'expiration_date' => $this->expiration_date,
            'renewal_date' => $this->renewal_date,
            'pricing_engine' => new PricingEngineResource($this->whenLoaded('pricingEngine')),
            // 'allow_access_to_buyer_app' => $this->allow_access_to_buyer_app, for future purpose
            'allow_loan_officer_to_upload_logo' => $this->allow_loan_officer_to_upload_logo,

        ];
    }
}
