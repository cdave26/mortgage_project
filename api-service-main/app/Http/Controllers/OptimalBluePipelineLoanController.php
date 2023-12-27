<?php

namespace App\Http\Controllers;

use App\Facades\OptimalBlueService;
use App\Http\Resources\OptimalBluePipelineLoanResource;
use App\Models\OptimalBlueDefaultStrategy;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Auth;

class OptimalBluePipelineLoanController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(string $id): JsonResponse
    {
        $user = Auth::user();

        $strategy = $user->optimalBlueStrategy;

        if (is_null($strategy)) {
            $strategy = OptimalBlueDefaultStrategy::firstWhere(
                'company_id', $user->company_id,
            );
        }

        $channel = Arr::get($strategy, 'business_channel_id');

        $originator = Arr::get($strategy, 'originator_id');

        try {
            $loan = OptimalBlueService::loan(
                $channel, $originator, $id,
            );
        } catch (\Exception $exception) {
            return $this->error([
                'message' => trans('messages.loan_id.invalid'),
            ], JsonResponse::HTTP_BAD_REQUEST);
        }

        $resource = new OptimalBluePipelineLoanResource($loan);

        $loan = $resource->resolve();

        $stateId = Arr::get($loan, 'property_state.id');

        $stateName = Arr::get($loan, 'property_state.name');

        $licenses = $user->licenses
            ->where('state_id', $stateId);

        if ($licenses->isEmpty()) {
            return $this->error([
                'message' => trans('messages.loan_id.state_license_not_exist', [
                    'state' => $stateName,
                ]),
            ], JsonResponse::HTTP_BAD_REQUEST);
        }

        return $this->success([
            'loan' => $loan,
        ]);
    }
}
