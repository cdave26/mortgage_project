<?php

namespace App\Http\Controllers;

use App\Facades\BuyersPreApprovalRequestService;
use App\Http\Requests\SaveBuyersPreApprovalRequest;
use Illuminate\Http\JsonResponse;

class BuyersPreApprovalRequestController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(SaveBuyersPreApprovalRequest $request): JsonResponse
    {
        BuyersPreApprovalRequestService::create($request->validated());

        return $this->success([
            'message' => trans('messages.success.create', [
                'resource' => "buyer's pre-approval request",
            ]),
        ]);
    }
}
