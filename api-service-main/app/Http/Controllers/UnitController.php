<?php

namespace App\Http\Controllers;

use App\Models\Unit;
use Illuminate\Http\JsonResponse;

class UnitController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(): JsonResponse
    {
        return $this->success([
            'units' => Unit::select([
                'id', 'description',
            ])
            ->active()
            ->orderBy('sequence')
            ->get(),
        ]);
    }
}
