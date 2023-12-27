<?php

namespace App\Http\Controllers;

use App\Models\UserStatus;
use Illuminate\Http\JsonResponse;

class UserStatusController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(): JsonResponse
    {
        return $this->success([
            'user_statuses' => UserStatus::select([
                'id', 'description', 'hubspot_value', 'sequence'
            ])
            ->active()
            ->orderBy('sequence')
            ->get(),
        ]);
    }
}
