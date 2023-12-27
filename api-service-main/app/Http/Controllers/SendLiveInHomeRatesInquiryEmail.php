<?php

namespace App\Http\Controllers;

use App\Facades\SendGridService;
use App\Mail\LiveInHomeRatesInquiry;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SendLiveInHomeRatesInquiryEmail extends Controller
{
    public function __construct(
        protected LiveInHomeRatesInquiry $inquiry,
    ) {}

    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): JsonResponse
    {
        try {
            $inquiry = $this->inquiry->__invoke($request->toArray());
            SendGridService::send($inquiry);

            return $this->success([
                'message' => trans('messages.success.dynamic', [
                    'beginning' => 'Your',
                    'resource' => 'email',
                    'super' => 'has been',
                    'action' => 'sent.',
                ]),
            ]);
        } catch (Exception $e) {
            return $this->error([
                'message' => $e->getMessage()
            ], JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
        }
    }
}
