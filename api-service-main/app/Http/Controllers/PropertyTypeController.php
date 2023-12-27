<?php

namespace App\Http\Controllers;

use App\Models\PropertyType;
use Illuminate\Http\JsonResponse;

class PropertyTypeController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(): JsonResponse
    {
        return $this->success([
            'property_types' => PropertyType::select([
                'id', 'description',
            ])
            ->active()
            ->orderBy('sequence')
            ->get(),
        ]);
    }
}
