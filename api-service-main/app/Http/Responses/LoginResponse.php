<?php

namespace App\Http\Responses;

use App\Http\Resources\UserResource;
use Illuminate\Contracts\Auth\StatefulGuard;
use Laravel\Fortify\Http\Responses\LoginResponse as FortifyLoginResponse;

class LoginResponse extends FortifyLoginResponse
{
    protected $guard;

    public function __construct(StatefulGuard $guard)
    {
        $this->guard = $guard;
    }

    public function toResponse($request)
    {
        return response()->json([
            'success' => true,
            'user' => new UserResource($this->guard->user())
        ], 200);
    }
}