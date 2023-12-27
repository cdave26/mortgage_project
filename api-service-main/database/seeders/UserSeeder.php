<?php

namespace Database\Seeders;

use App\Enums\PricingEngine as EnumsPricingEngine;
use App\Enums\UserStatus;
use App\Enums\UserType as EnumsUserType;
use App\Helpers\IDGenerator;
use App\Models\Company;
use App\Models\PricingEngine;
use App\Models\User;
use App\Models\UserType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $uplistAdmin = UserType::where('name', EnumsUserType::UPLIST_ADMIN)->first();
        $uplistCompany = Company::where('name', config('uplist.app_name'))->first();
        $uplistPricingEngine = PricingEngine::where('name', EnumsPricingEngine::OPTIMAL_BLUE)->first();
        $generator = new IDGenerator();

        $users = [
            [
                'first_name' => 'Lito',
                'last_name' => 'Dagodog',
                'email' => 'lito@lanexcorp.com',
                'job_title' => 'admin',
                'mobile_number' => '000 000 000',
                'nmls_num' => '123654',
                'username' => 'lito@lanexcorp.com',
                'password' => Hash::make("P@ssw0rd"),
                'user_type_id' => $uplistAdmin->id,
                'company_id' => $uplistCompany->id,
                'pricing_engine_id' => $uplistPricingEngine->id,
                'first_time_login' => true,
                'user_status' => UserStatus::ACTIVE->value
            ],
            [
                'first_name' => 'Al',
                'last_name' => 'Jabat',
                'email' => 'al.jabat@lanexcorp.com',
                'job_title' => 'admin',
                'mobile_number' => '000 000 000',
                'nmls_num' => '123654',
                'username' => 'al.jabat@lanexcorp.com',
                'password' => Hash::make("P@ssw0rd"),
                'user_type_id' => $uplistAdmin->id,
                'company_id' => $uplistCompany->id,
                'pricing_engine_id' => $uplistPricingEngine->id,
                'first_time_login' => true,
                'user_status' => UserStatus::ACTIVE->value
            ],
            [
                'first_name' => 'Elmer',
                'last_name' => 'Alluad',
                'email' => 'elmer.alluad@lanexcorp.com',
                'job_title' => 'admin',
                'mobile_number' => '001 000 000',
                'nmls_num' => '1236540',
                'username' => 'elmer.alluad@lanexcorp.com',
                'password' => Hash::make("P@ssw0rd"),
                'user_type_id' => $uplistAdmin->id,
                'company_id' => $uplistCompany->id,
                'pricing_engine_id' => $uplistPricingEngine->id,
                'first_time_login' => true,
                'user_status' => UserStatus::ACTIVE->value
            ],
            [
                'first_name' => 'Jude',
                'last_name' => 'Delos Santos',
                'email' => 'jude@lanexcorp.com',
                'job_title' => 'admin',
                'mobile_number' => '000 000 000',
                'nmls_num' => '123654',
                'username' => 'jude@lanexcorp.com',
                'password' => Hash::make("P@ssw0rd"),
                'user_type_id' => $uplistAdmin->id,
                'company_id' => $uplistCompany->id,
                'pricing_engine_id' => $uplistPricingEngine->id,
                'first_time_login' => true,
                'user_status' => UserStatus::ACTIVE->value
            ],
            [
                'first_name' => 'Keven',
                'last_name' => 'Cataluna',
                'email' => 'client.cataluna@lanexcorp.com',
                'job_title' => 'admin',
                'mobile_number' => '001 000 000',
                'nmls_num' => '1236540',
                'username' => 'client.cataluna@lanexcorp.com',
                'password' => Hash::make("P@ssw0rd"),
                'user_type_id' => $uplistAdmin->id,
                'company_id' => $uplistCompany->id,
                'pricing_engine_id' => $uplistPricingEngine->id,
                'first_time_login' => true,
                'user_status' => UserStatus::ACTIVE->value
            ],
            [
                'first_name' => 'Dave',
                'last_name' => 'Tampoy',
                'email' => 'carl.tampoy@lanexcorp.com',
                'job_title' => 'admin',
                'mobile_number' => '000 000 000',
                'nmls_num' => '123654',
                'username' => 'carl.tampoy@lanexcorp.com',
                'password' => Hash::make("P@ssw0rd"),
                'user_type_id' => $uplistAdmin->id,
                'company_id' => $uplistCompany->id,
                'pricing_engine_id' => $uplistPricingEngine->id,
                'first_time_login' => true,
                'user_status' => UserStatus::ACTIVE->value
            ],
        ];

        foreach ($users as $usr) {
            $res = User::create($usr);

            $res->url_identifier = $generator->generateUrlIdentifier($res->id);
            $res->employee_id = $generator->generateEmployeeId($res);
            $res->save();
        };
    }
}
