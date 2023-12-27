<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Arr;

class LoanOfficerResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $resource = parent::toArray($request);

        $company = Arr::only($resource['company'], [
            'id',
            'name',
            'address',
            'city',
            'state',
            'zip',
            'equal_housing',
            'company_nmls_number',
            'company_mobile_number',
            'additional_details',
            'allow_loan_officer_to_upload_logo',
            'company_logo'
        ]);

        $listings = Arr::map(
            $resource['listings'],
            fn ($listing) => Arr::except($listing, ['user_id']),
        );

        $licenses = Arr::map($resource['licenses'], function ($license) {
            $dotted = Arr::dot($license);

            $stateLicense = Arr::get($dotted, 'state.company_state_license.license');
            $stateMetadata = Arr::get($license, 'state.company_state_license.state_metadata');

            $license = Arr::only($dotted, [
                'id',
                'license',
                'state.id',
                'state.name',
                'state.full_state',
                'state.disclosure',
                'state.licensing_information',
                'state.additional_required_disclosures',
            ]);

            return Arr::undot([
                ...$license,
                'state.license' => $stateLicense,
                'state.metadata' => $stateMetadata,
            ]);
        });

        $resource = Arr::only($resource, [
            'id',
            'user_type_id',
            'first_name',
            'last_name',
            'job_title',
            'email',
            'mobile_number',
            'nmls_num',
            'url_identifier',
            'custom_logo_flyers'
        ]);

        $resource['company'] = $company;
        $resource['listings'] = $listings;
        $resource['licenses'] = $licenses;

        return $resource;
    }
}
