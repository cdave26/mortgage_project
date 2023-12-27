<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Arr;

class PreApprovedBuyerCollectionItemResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $resource = [
            ...(array) $this->resource,
            'created_at' => Carbon::parse($this->created_at)
                ->format('m/d/Y'),
        ];

        return Arr::except($resource, [
            'property_type_id',
            'property_state_id',
        ]);
    }
}
