<?php

namespace App\Http\Controllers;

use App\Facades\OTPService;
use App\Http\Requests\VerifyOTPRequest;
use Illuminate\Http\JsonResponse;

class VerifyOTPController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(VerifyOTPRequest $request): JsonResponse
    {
        $data = $request->validated();

        return $this->success([
            'authorized' => OTPService::verify($data),
        ]);
    }
}
