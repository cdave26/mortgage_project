<?php

namespace App\Http\Controllers;

use App\Facades\OTPService;
use App\Http\Requests\GenerateOTPRequest;
use Illuminate\Http\JsonResponse;

class GenerateOTPController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(GenerateOTPRequest $request): JsonResponse
    {
        OTPService::generate($request->validated());

        return $this->success([
            'message' => trans('messages.otp.success'),
        ]);
    }
}
