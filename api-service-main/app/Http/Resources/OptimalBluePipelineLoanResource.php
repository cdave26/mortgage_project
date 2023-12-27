<?php

namespace App\Http\Resources;

use App\Enums\CreditScoreRange;
use App\Enums\OccupancyType;
use App\Enums\PropertyType;
use App\Enums\Unit;
use App\Models\County;
use App\Models\State;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;

class OptimalBluePipelineLoanResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $resource = parent::toArray($request);

        if (!Arr::has($resource, 'loanId')) {
            return [];
        }

        $propertyType = Arr::get($resource, 'propertyInformation.propertyType');
        $propertyType = PropertyType::from($propertyType);

        $occupancyType = Arr::get($resource, 'propertyInformation.occupancy');
        $occupancyType = OccupancyType::from($occupancyType);

        $unit = Arr::get($resource, 'propertyInformation.numberOfUnits');
        $unit = Unit::from($unit);

        $state = Arr::get($resource, 'propertyInformation.state');
        $state = Str::substr($state, 0, strpos($state, ' ('));
        $state = State::firstWhere('name', $state);

        if ($state) {
            $state = Arr::only($state->toArray(), ['id', 'name', 'full_state']);
        }

        $county = Arr::get($resource, 'propertyInformation.county');
        $county = County::firstWhere('name', $county);

        if ($county) {
            $county = Arr::only($county->toArray(), ['id', 'name']);
        }

        $representativeFICO = Arr::get($resource, 'representativeFICO');

        $creditScoreRange = array_column(CreditScoreRange::cases(), 'value');

        $creditScoreRange = Arr::first($creditScoreRange, function (string $value) use ($representativeFICO) {
            [$min, $max] = explode(',', $value);
            return $representativeFICO >= $min && $representativeFICO <= $max;
        });

        $creditScoreRange = CreditScoreRange::from($creditScoreRange);

        return [
            'id' => Arr::get($resource, 'loanId'),
            'borrower_first_name' => Arr::get($resource, 'borrowerInformation.firstName'),
            'borrower_last_name' => Arr::get($resource, 'borrowerInformation.lastName'),
            'property_type' => [
                'id' => $propertyType->value,
                'description' => $propertyType->description(),
            ],
            'occupancy_type' => [
                'id' => $occupancyType->value,
                'description' => $occupancyType->description(),
            ],
            'unit' => [
                'id' => $unit->value,
                'description' => $unit->description(),
            ],
            'property_state' => $state,
            'property_county' => $county,
            'credit_score_range' => [
                'id' => $creditScoreRange->value,
                'description' => $creditScoreRange->description(),
            ],
            'debt_to_income_ratio' => Arr::get($resource, 'loanLevelDebtToIncomeRatio'),
            'self_employed' => Arr::get($resource, 'borrowerInformation.selfEmployed'),
            'first_time_home_buyers' => Arr::get($resource, 'borrowerInformation.firstTimeHomeBuyer'),
        ];
    }
}
