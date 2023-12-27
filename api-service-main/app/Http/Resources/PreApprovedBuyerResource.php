<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;

class PreApprovedBuyerResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $attributes = $this->resource->getFillable();
        $relations = $this->resource->getRelations();

        $relations = Arr::map($relations, function ($value, string $key) {
            return Str::snake($key);
        });

        $resource = Arr::only(parent::toArray($request), [
            'id',
            ...$attributes,
            ...$relations,
        ]);

        $resource['borrower_first_name'] = Arr::get($resource, 'borrower.first_name');
        $resource['borrower_last_name'] = Arr::get($resource, 'borrower.last_name');
        $resource['borrower_email'] = Arr::get($resource, 'borrower.email');
        $resource['borrower_mobile_number'] = Arr::get($resource, 'borrower.mobile_number');

        $code = Arr::get($resource, 'borrower.company.code');

        $resource['login_url'] = implode([
            config('uplist.client_app_url'), '/', $code, '/login',
        ]);

        $loanOfficer = Arr::only($resource['loan_officer'], [
            'id', 'first_name', 'last_name', 'email', 'custom_logo_flyers'
        ]);

        Arr::set($resource, 'loan_officer', $loanOfficer);

        return Arr::except($resource, [
            'borrower_id',
            'loan_officer_id',
            'borrower',
            'borrower_state_id',
            'property_type_id',
            'occupancy_type_id',
            'unit_id',
            'property_state_id',
            'property_county_id',
            'credit_score_range_id',
            'code',
        ]);
    }
}
