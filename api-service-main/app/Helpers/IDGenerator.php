<?php

namespace App\Helpers;

use App\Models\Company;
use App\Models\User;

class IDGenerator
{
    /**
     * Generate Unique ID for the employee
     * @param App\Models\User $user
     * 
     * @return string Employee ID per company
     */
    public function generateEmployeeId($user)
    {
        $usersCount = User::query()->where('company_id', $user->company_id)->count();
        $company = Company::query()->find($user->company_id);
        
        $name = str_replace(' ', '', $company->name);
        $splittedCompanyName = str_split($name, 3);
        $paddedUsersCount = str_pad($usersCount, 4, '0', STR_PAD_LEFT);

        return strtoupper($splittedCompanyName[0]) . $company->id . $paddedUsersCount;
    }

    /**
     * Generate URL Identifier for each user
     * @param int $userId
     * 
     * @return string URL identifier per user
     */
    public function generateUrlIdentifier($userId)
    {
        return 'us1' . str_pad($userId, 6, '0', STR_PAD_LEFT);
    }
}