<?php

namespace App\Http\Controllers;

use App\Facades\SendGridService;
use App\Http\Requests\SendContactRequest;
use App\Mail\BuyersContactRequest;
use Illuminate\Http\JsonResponse;

class SendContactRequestController extends Controller
{
    public function __construct(
        public BuyersContactRequest $contactRequest,
    ) { }

    /**
     * Handle the incoming request.
     */
    public function __invoke(SendContactRequest $request): JsonResponse
    {
        $data = $request->validated();

        $contactRequest = $this->contactRequest->__invoke($data);

        SendGridService::send($contactRequest);

        return $this->success([
            'message' => trans('messages.success.dynamic', [
                'beginning' => 'Your',
                'resource' => 'email',
                'super' => 'has been',
                'action' => 'sent.',
            ]),
        ]);
    }
}
