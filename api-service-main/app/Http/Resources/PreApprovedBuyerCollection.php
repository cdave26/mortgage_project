<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Support\Arr;

class PreApprovedBuyerCollection extends ResourceCollection
{
    /**
     * The resource that this resource collects.
     *
     * @var string
     */
    public $collects = PreApprovedBuyerCollectionItemResource::class;

    /**
     * Transform the resource collection into an array.
     *
     * @return array<int|string, mixed>
     */
    public function toArray(Request $request): array
    {
        return Arr::only($this->resource->toArray(), [
            'data',
            'current_page',
            'from',
            'to',
            'total',
            'next_page_url',
            'prev_page_url',
            'per_page',
        ]);
    }
}
