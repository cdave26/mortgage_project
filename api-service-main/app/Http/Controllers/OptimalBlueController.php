<?php

namespace App\Http\Controllers;

use App\Enums\UserType;
use App\Facades\OptimalBlueService;
use App\Models\Company;
use App\Models\OptimalBlueStrategy;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class OptimalBlueController extends Controller
{
    public function getCompanyStrategies(int $companyId): JsonResponse
    {
        $userTypeId = Auth::user()->user_type_id;
        $allowed = [
            UserType::UPLIST_ADMIN->id(),
            UserType::COMPANY_ADMIN->id()
        ];

        if (!in_array($userTypeId, $allowed)) {
            throw new Exception(
                trans('messages.error.bad_request'),
                JsonResponse::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        try {
            DB::beginTransaction();
            $company = Company::query()->find($companyId);

            if(!$company) {
                throw new Exception(
                    trans('messages.error.not_found', [
                        'resource' => 'company'
                    ]),
                    JsonResponse::HTTP_UNPROCESSABLE_ENTITY
                );
            }

            // find OB account based on company name
            $account = OptimalBlueService::getAccountPerCompany($company->name);

            if(!$account) {
                throw new Exception(
                    trans('messages.error.not_found', [
                        'resource' => 'Optimal Blue account'
                    ]),
                    JsonResponse::HTTP_UNPROCESSABLE_ENTITY
                );
            }

            // fetch strategies from OB API
            $latestStrategies = OptimalBlueService::getCompanyStrategies($account['id']);

            /**
             * Save fetched data to save resource on refetching gain
             */
            $inserted = OptimalBlueStrategy::query()
                ->updateOrCreate(
                    [ 'company_id' => $company->id ],
                    [
                        'company_id' => $company->id,
                        'company_account_id' => $latestStrategies['index'],
                        'strategies_metadata' => json_encode($latestStrategies),
                        'updated_by' => Auth::id()
                    ]
                );
            
            if(!$inserted) {
                throw new Exception(
                    trans('messages.error.generic'),
                    JsonResponse::HTTP_UNPROCESSABLE_ENTITY
                );
            }

            DB::commit();
            return $this->success([
                'message' => trans('messages.success.dynamic', [
                    'beginning' => $userTypeId === UserType::UPLIST_ADMIN->id() ? 'The' : 'Your',
                    'resource' => 'latest strategies',
                    'super' => 'have been',
                    'action' => 'retrieved.',
                ]),
                'strategies' => $latestStrategies,
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->error([
                'message' => $e->getMessage()
            ], $e->getCode());
        }
    }
}
