<?php

namespace App\Http\Controllers;

use App\Enums\UserType as UserTypeEnum;
use App\Models\UserType;
use Illuminate\Http\JsonResponse;

class UserTypeController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(): JsonResponse
    {
        return $this->success([
            'user_types' => UserType::select([
                'id', 'name',
            ])
            ->whereNotIn('name', [UserTypeEnum::BUYER])
            ->get(),
        ]);
    }
}
