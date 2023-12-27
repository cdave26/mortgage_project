<?php

namespace App\Http\Controllers;

use App\Models\CreditScoreRange;
use Illuminate\Http\JsonResponse;

class CreditScoreRangeController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(): JsonResponse
    {
        return $this->success([
            'credit_score_ranges' => CreditScoreRange::select([
                'id', 'description',
            ])
            ->active()
            ->orderBy('sequence')
            ->get(),
        ]);
    }
}
