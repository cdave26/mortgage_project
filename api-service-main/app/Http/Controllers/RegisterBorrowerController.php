<?php

namespace App\Http\Controllers;

use App\Facades\RegistrationService;
use App\Http\Requests\RegisterBorrowerRequest;
use Illuminate\Http\JsonResponse;

class RegisterBorrowerController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(RegisterBorrowerRequest $request): JsonResponse
    {
        RegistrationService::borrower($request->validated());

        return $this->success([
            'message' => trans('messages.success.registration'),
        ]);
    }
}
