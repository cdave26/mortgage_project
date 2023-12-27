<?php

namespace App\Http\Controllers;

use App\Enums\UserType;
use App\Models\OptimalBlueDefaultStrategy;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class OptimalBlueDefaultStrategyController extends Controller
{
    private function allowedAccess()
    {
        return [
            UserType::UPLIST_ADMIN->id(),
            UserType::COMPANY_ADMIN->id()
        ];
    }

    public function view(Request $request): JsonResponse
    {
        $authUser = Auth::user();
        $userTypeId = $authUser->user_type_id;

        if (!in_array($userTypeId, $this->allowedAccess())) {
            throw new Exception(
                trans('messages.error.bad_request'),
                JsonResponse::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        try {
            $defaultStrategy = OptimalBlueDefaultStrategy::query()
                ->where('company_id', $request->companyId)
                ->first();

            if (!$defaultStrategy) {
                throw new Exception(
                    trans('messages.error.optimal_blue.default_strategy.not_found'),
                    JsonResponse::HTTP_UNPROCESSABLE_ENTITY
                );
            }

            return $this->success([
                'default_strategy' => $defaultStrategy
            ]);
        } catch (Exception $e) {
            return $this->error([
                'message' => $e->getMessage()
            ], $e->getCode());
        }
    }

    public function createOrUpdateDefaultStrategy(Request $request): JsonResponse
    {
        Validator::make($request->toArray(), [
            'company_id' => ['required', 'integer', 'exists:App\Models\Company,id'],
            'company_account_id' => ['required', 'integer'],
            'business_channel_id' => ['required', 'integer'],
            'originator_id' => ['required', 'integer'],
            'price' => ['required', 'numeric', 'min:0'],
        ])
        ->stopOnFirstFailure()
        ->validate();

        $authUser = Auth::user();

        try {
            DB::beginTransaction();

            $defaultStrategy = OptimalBlueDefaultStrategy::query()
                ->updateOrCreate(
                    [ 'company_id' => $request->company_id ],
                    array_merge($request->toArray(), ['updated_by' => $authUser->id])
                );

            if (!$defaultStrategy) {
                throw new Exception(
                    trans('messages.error.optimal_blue.default_strategy.not_found'),
                    JsonResponse::HTTP_UNPROCESSABLE_ENTITY
                );
            }

            DB::commit();
            return $this->success([
                'message' => trans('messages.success.update', [
                    'resource' => 'Default Strategy',
                ]),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->error([
                'message' => $e->getMessage()
            ], $e->getCode());
        }
    }
}
