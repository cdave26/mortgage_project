<?php

namespace App\Http\Controllers;

use App\Enums\UserStatus;
use App\Http\Requests\CheckUserRequest;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Arr;
use Illuminate\Http\Request;
class CheckUserController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(CheckUserRequest $request)
    {
        $data = $request->validated();

        $email = Arr::get($data, 'email');

        $companyId = Arr::get($data, 'company_id');

        $user = User::firstWhere(function (Builder $query) use ($email, $companyId) {
            $query->where('email', $email)
                ->whereIn('user_status', [
                    UserStatus::ACTIVE,
                    UserStatus::ACTIVE_TRIAL,
                ])
                ->when($companyId, function (Builder $query, int $companyId) {
                    $query->where('company_id', $companyId);
                });
        });

        if (is_null($user) || ($user->buyer && is_null($companyId))) {
            return $this->error([
                'message' => trans('messages.error.email_not_found'),
            ], JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
        }

        return $this->success(['message' => 'User found.']);
    }

    public function checkUser(Request $request)
    {
        $companyCode = $request['company_code'];
        $urlIdentifier = $request['url_identifier'];
        $nmlsId = $request['nmls_id'];

        if(empty($urlIdentifier) || empty($companyCode) || empty($nmlsId)) {
            return $this->error([
                'message' => trans('messages.error.forbidden'),
            ], JsonResponse::HTTP_FORBIDDEN);
        }

        $user = User::firstWhere(function (Builder $query) use ($urlIdentifier, $nmlsId) {
            $query->where('url_identifier', $urlIdentifier)
                ->where('nmls_num', $nmlsId)
                ->whereIn('user_status', [
                    UserStatus::ACTIVE,
                    UserStatus::ACTIVE_TRIAL,
                ])
                ->whereNull('deleted_at');
        });

        if(!$user || ($user->company->code !== $companyCode)) {
            return $this->error([
                'message' => trans('messages.error.forbidden'),
            ], JsonResponse::HTTP_FORBIDDEN);
        }

        $user->load([
            'company.companyStateLicenses' => function ($query) {
                $query->select(['id', 'company_id', 'state_id', 'license', 'state_metadata']);
            },
            'licenses' => function ($query) {
                $query->select(['id', 'user_id', 'state_id', 'license']);
            },
            'licenses.state' => function ($query) {
                $query->select(['id', 'name', 'abbreviation', 'disclosure']);
            },
        ]);

        return $this->success(['message' => 'User found.', 'user' => $user]);
    }
}
