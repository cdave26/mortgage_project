<?php

use App\Enums\PricingEngine as EnumsPricingEngine;
use App\Enums\UserStatus;
use App\Enums\UserType as EnumsUserType;
use App\Helpers\IDGenerator;
use App\Models\Company;
use App\Models\PricingEngine;
use App\Models\User;
use App\Models\UserType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Hash;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $uplistAdmin = UserType::where('name', EnumsUserType::UPLIST_ADMIN)->first();
        $uplistCompany = Company::where('name', config('uplist.app_name'))->first();
        $uplistPricingEngine = PricingEngine::where('name', EnumsPricingEngine::OPTIMAL_BLUE)->first();
        $generator = new IDGenerator();

        $users = [
            [
                'first_name' => config('uplist.app_name'),
                'last_name' => 'Admin',
                'email' => 'admin@uplist.co',
                'job_title' => 'admin',
                'mobile_number' => '000 000 000',
                'nmls_num' => '0000',
                'username' => 'admin@uplist.co',
                'password' => Hash::make("P@ssw0rd"),
                'user_type_id' => $uplistAdmin->id,
                'company_id' => $uplistCompany->id,
                'pricing_engine_id' => $uplistPricingEngine->id,
                'first_time_login' => true,
                'user_status' => UserStatus::ACTIVE->value
            ]
        ];

        foreach ($users as $usr) {
            $res = User::create($usr);

            $res->url_identifier = $generator->generateUrlIdentifier($res->id);
            $res->employee_id = $generator->generateEmployeeId($res);
            $res->save();
        };
    }
};
