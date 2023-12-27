<?php

namespace App\Http\Controllers;

use App\Facades\BuyersPreApprovalRequestService;
use App\Http\Requests\GetPaymentsRequest;
use Illuminate\Http\JsonResponse;

class BuyersPreApprovalRequestGetPaymentController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(GetPaymentsRequest $request): JsonResponse
    {
        $payments = BuyersPreApprovalRequestService::getPayments($request->validated());
        return $this->success($payments);
    }
}
