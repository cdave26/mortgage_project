<?php

namespace App\Http\Controllers;

use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RecaptchaController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $token = $request->token;

        try { 
            if(!$token) {
                return  $this->error([
                    'message' => 'The token is invalid.'
                ], JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
            }
    
            $response = Http::asForm('https://www.google.com/recaptcha/api/siteverify', [
                'secret' => config('services.recaptcha.secret'),
                'respnse' => $token,
            ]);
    
            if(!$response) {
                return  $this->error([
                    'message' => 'The reCaptcha was not verified.',
                ], JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
            }
    
            return $this->success(['message' => 'The reCaptcha was verified.']);
        } catch (Exception $e) {
            Log::error($e);
            return $this->error([
                'message' => $e->getMessage()
            ], JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
        }
    }
}
