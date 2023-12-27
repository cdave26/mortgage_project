<?php

namespace App\Http\Controllers;

use App\Models\ListingStatus;
use Illuminate\Http\JsonResponse;

class ListingStatusController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(): JsonResponse
    {
        return $this->success([
            'listing_statuses' => ListingStatus::select([
                'id', 'description',
            ])
            ->active()
            ->orderBy('sequence')
            ->get(),
        ]);
    }
}
