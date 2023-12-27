<?php

namespace App\Http\Resources;

use App\Enums\UserStatus;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $resource = parent::toArray($request);

        $userStatus = UserStatus::from($this->user_status);

        return [
            'id' => $this->id,
            'employee_id' => $this->employee_id,
            'company_id' => $this->company_id,
            'user_type_id' => $this->user_type_id,
            'pricing_engine_id' => $this->pricing_engine_id,
            'email' => $this->email,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'job_title' => $this->job_title,
            'mobile_number' => $this->mobile_number,
            'nmls_num' => $this->nmls_num,
            "profile_logo" => $this->profile_logo,
            'url_identifier' => $this->url_identifier,
            'first_time_login' => $this->first_time_login,
            'email_verified_at' => $this->email_verified_at,
            'hubspot_contact_id' => $this->hubspot_contact_id,
            'subscription_expired_at' => $this->subscription_expired_at,
            'user_type' => new UserTypeResource($this->whenLoaded('userType')),
            'company' => new CompanyResource($this->whenLoaded('company')),
            'pricing_engine' => new PricingEngineResource($this->whenLoaded('pricingEngine')),
            'buyer_id' => data_get($resource, 'buyer.id'),
            'trusted' => !empty($resource['trusted_devices']),
            'iscomplete_onboarding' => $this->iscomplete_onboarding,
            'user_status' => [
                'id' => $userStatus->value,
                'description' => $userStatus->description(),
                'hubspot_value' => $userStatus->hubspotValue()
            ],
            'login_url' => $this->company ? implode([
                config('uplist.client_app_url'), '/', $this->company->code, '/login',
            ]) : null,
        ];
    }
}
