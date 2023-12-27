<?php

namespace App\Helpers;

use App\Enums\UserStatus;
use App\Enums\UserType;
use App\Models\User;

class UsersCount
{
    /**
     * Get the count of active loan officers per company
     * 
     * @param Int $companyId
     */
    public function getActiveLoanOfficersCountPerCompany($companyId)
    {
        $userCount = User::query()
            ->where('company_id', $companyId)
            ->whereNull('deleted_at')
            ->where(function ($query) {
                $query->where('user_type_id', UserType::COMPANY_ADMIN->id())
                    ->orWhere('user_type_id', UserType::LOAN_OFFICER->id());
            })
            ->where(function ($query) {
                $query->where('user_status', UserStatus::ACTIVE->value)
                    ->orWhere('user_status', UserStatus::ACTIVE_TRIAL->value);
            })
            ->count();

        return $userCount;
    }
}