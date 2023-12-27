<?php

namespace App\Http\Controllers;

use App\Models\OccupancyType;
use Illuminate\Http\JsonResponse;

class OccupancyTypeController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(): JsonResponse
    {
        return $this->success([
            'occupancy_types' => OccupancyType::select([
                'id', 'description','sequence'
            ])
            ->active()
            ->orderBy('sequence')
            ->get(),
        ]);
    }
}
