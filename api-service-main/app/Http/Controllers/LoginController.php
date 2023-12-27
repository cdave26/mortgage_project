<?php

namespace App\Http\Controllers;

use App\Facades\AuthenticationService;
use App\Http\Requests\LoginRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;

class LoginController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(LoginRequest $request): JsonResponse
    {
        $user = AuthenticationService::authenticate($request->validated());

        if (is_null($user)) {
            return $this->error([
                'message' => [trans('auth.failed')],
            ], JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
        }

        return $this->success([
            'success' => true,
            'user' => new UserResource($user),
        ]);
    }
}
