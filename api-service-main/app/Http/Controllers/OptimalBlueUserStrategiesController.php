<?php

namespace App\Http\Controllers;

use App\Enums\UserType;
use App\Models\Company;
use App\Models\OptimalBlueStrategy;
use App\Models\OptimalBlueUserStrategy;
use App\Models\User;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class OptimalBlueUserStrategiesController extends Controller
{
    private function allowedAccess()
    {
        return [
            UserType::UPLIST_ADMIN->id(),
            UserType::COMPANY_ADMIN->id()
        ];
    }

    public function getAll(string $page, string $limit, Request $request): JsonResponse
    {
        $search = $request->search;
        $searchUserType = $request->searchUserType;
        $sortBy = $request->sortBy;
        $order = $request->order;
        $companyId = $request->companyId;

        $authUser = Auth::user();
        $userTypeId = $authUser->user_type_id;

        if (!in_array($userTypeId, $this->allowedAccess())) {
            throw new Exception(
                trans('messages.error.bad_request'),
                JsonResponse::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        try {
            $company = Company::query()->find($companyId);

            if(!$company) {
                throw new Exception(
                    trans('messages.error.not_found', [
                        'resource' => 'company'
                    ]),
                    JsonResponse::HTTP_UNPROCESSABLE_ENTITY
                );
            }

            // check if there is an existing strategy saved
            $latestStrategy = OptimalBlueStrategy::query()
                ->where('company_id', $companyId)
                ->first();

            if(!$latestStrategy) {
                throw new Exception(
                    trans('messages.error.optimal_blue.strategy.not_found'),
                    JsonResponse::HTTP_UNPROCESSABLE_ENTITY
                );
            }

            $usersStrategy = User::query()
                ->with(['userType', 'optimalBlueStrategy'])
                ->select([
                    'users.id',
                    'company_id',
                    'first_name',
                    'last_name',
                    'email',
                    'user_type_id',
                    'ut.name as user_type_name' 
                ])
                ->leftJoin('user_types as ut', 'ut.id', '=', 'users.user_type_id')                
                ->where('company_id', $companyId)
                ->whereIn('user_type_id', [
                    UserType::UPLIST_ADMIN->id(),
                    UserType::COMPANY_ADMIN->id(),
                    UserType::LOAN_OFFICER->id(),
                ]);

            if(!empty($search) || $search === '0') {
                $usersStrategy->where(function ($builder) use ($search) {
                    $builder->where('first_name', 'like', '%' . $search . '%');
                    $builder->Orwhere('last_name', 'like', '%' . $search . '%');
                });
            }

            if(!empty($searchUserType)) {
                $usersStrategy->where('user_type_id', (int) $searchUserType);
            }

            if(!empty($sortBy) && !empty($order)) {
                if($sortBy === 'name') {
                    $usersStrategy->orderByRaw("LOWER(CONCAT(first_name, ' ', last_name)) $order");
                } else if($sortBy === 'role') {
                    $usersStrategy->orderByRaw("LOWER(user_type_name) $order");
                } else {
                    $usersStrategy->orderBy($sortBy, $order);
                }
            }

            return $this->success([
                'users_strategy' => $usersStrategy->paginate($limit, ['*'], 'page', $page),
            ]);
        } catch (Exception $e) {
            return $this->error([
                'message' => $e->getMessage()
            ], $e->getCode());
        }
    }

    public function getCompanyStrategy(Request $request): JsonResponse
    {
        $authUser = Auth::user();
        $userTypeId = $authUser->user_type_id;
        $companyId = $request->companyId;

        if (!in_array($userTypeId, $this->allowedAccess())) {
            throw new Exception(
                trans('messages.error.bad_request'),
                JsonResponse::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        try {
            $company = Company::query()->find($request->companyId);

            if(!$company) {
                throw new Exception(
                    trans('messages.error.not_found', [
                        'resource' => 'company'
                    ]),
                    JsonResponse::HTTP_UNPROCESSABLE_ENTITY
                );
            }

            $latestStrategy = OptimalBlueStrategy::query()
                ->where('company_id', $companyId)
                ->first();

            if(!$latestStrategy) {
                throw new Exception(
                    trans('messages.error.optimal_blue.strategy.not_found'),
                    JsonResponse::HTTP_UNPROCESSABLE_ENTITY
                );
            }

            return $this->success([
                'strategies' => $latestStrategy
            ]);
        } catch (Exception $e) {
            return $this->error([
                'message' => $e->getMessage()
            ], $e->getCode());
        }
    }

    public function getUserStrategy(int $id): JsonResponse
    {
        $userTypeId = Auth::user()->user_type_id;

        if (!in_array($userTypeId, $this->allowedAccess())) {
            throw new Exception(
                trans('messages.error.bad_request'),
                JsonResponse::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        try {
            $strategy = OptimalBlueUserStrategy::query()->find($id);

            if(!$strategy) {
                throw new Exception(
                    trans('messages.error.not_found', [
                        'resource' => 'user strategy'
                    ]),
                    JsonResponse::HTTP_UNPROCESSABLE_ENTITY
                );
            }

            return $this->success([
                'strategy' => $strategy,
            ]);
        } catch (Exception $e) {
            return $this->error([
                'message' => $e->getMessage()
            ], $e->getCode());
        }
    }

    public function createOrUpdateUserStrategy(int $id, Request $request): JsonResponse
    {
        Validator::make($request->toArray(), [
            'company_id' => ['required', 'integer', 'exists:App\Models\Company,id'],
            'company_account_id' => ['required', 'integer'],
            'business_channel_id' => ['required', 'integer'],
            'originator_id' => ['required', 'integer'],
            'price' => ['required', 'numeric', 'min:0' ],
        ])
        ->stopOnFirstFailure()
        ->validate();

        $userTypeId = Auth::user()->user_type_id;
        $type = $request->type;
        $companyId = $request->company_id;

        if (
            !in_array($userTypeId, $this->allowedAccess())
            || empty($type)
            || !in_array($type, ['strategy', 'userId'])
        ) {
            throw new Exception(
                trans('messages.error.bad_request'),
                JsonResponse::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        $checker = ['id' => $id];
        $defaultPayload = ['updated_by' => Auth::id()];

        if($type === 'userId') {
            $user = User::query()
                ->where('id', $id)
                ->where('company_id', $companyId)
                ->first();

            if(!$user) {
                throw new Exception(
                    trans('messages.error.not_found', [
                        'resource' => 'user'
                    ]),
                    JsonResponse::HTTP_UNPROCESSABLE_ENTITY
                );
            }

            $checker = ['user_id' => $id, 'company_id' => $companyId];
            $defaultPayload = array_merge($defaultPayload, $checker);
        }

        try {
            DB::beginTransaction();
            OptimalBlueUserStrategy::query()->updateOrCreate(
                $checker,
                array_merge($request->toArray(), $defaultPayload)
            );

            DB::commit();
            return $this->success([
                'message' => trans('messages.success.update', [
                    'resource' => 'user',
                ]),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->error([
                'success' => false,
                'message' => $e->getMessage()
            ], $e->getCode());
        }
    }

    public function massUpdateUsersStrategy(Request $request): JsonResponse
    {
        Validator::make($request->toArray(), [
            'company_id' => ['required', 'integer', 'exists:App\Models\Company,id'],
            'user_ids' => ['required', 'array'],
            'company_account_id' => ['required', 'integer'],
            'business_channel_id' => ['required', 'integer'],
            'originator_id' => ['required', 'integer'],
            'price' => ['required', 'numeric', 'min:0'],
        ])
        ->stopOnFirstFailure()
        ->validate();

        $userTypeId = Auth::user()->user_type_id;
        $companyId = $request->company_id;

        if (!in_array($userTypeId, $this->allowedAccess())) {
            throw new Exception(
                trans('messages.error.bad_request'),
                JsonResponse::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        $fields = $request->toArray();

        $inputFields = [
            'company_id' => $companyId,
            'company_account_id' => $fields['company_account_id'],
            'business_channel_id' => $fields['business_channel_id'],
            'originator_id' => $fields['originator_id'],
            'price' => $fields['price'],
            'updated_by' => Auth::id()
        ];

        try {
            DB::beginTransaction();

            foreach($fields['user_ids'] as $userId) {
                $checker = ['user_id' => $userId, 'company_id' => $companyId];
                OptimalBlueUserStrategy::query()->updateOrCreate(
                    $checker,
                    array_merge($inputFields, $checker)
                );
            }

            DB::commit();
            return $this->success([
                'message' => trans('messages.success.dynamic', [
                    'beginning' => 'The',
                    'resource' => 'users',
                    'super' => 'were',
                    'action' => 'updated.',
                ]),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->error([
                'success' => false,
                'message' => $e->getMessage()
            ], $e->getCode());
        }
    }
}
