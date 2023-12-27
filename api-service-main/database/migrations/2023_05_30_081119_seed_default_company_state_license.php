<?php

use App\Models\Company;
use App\Models\CompanyStateLicense;
use App\Models\State;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        

        $state = State::where('name', 'Delaware')->first();
        $company = Company::where('id', 1)->first();

        $stateLicense = [
            [
                "license" => "uplist-state-license",
                "state_id" => $state->id,
                "company_id" => $company->id,
                "state_metadata" => json_encode([]),
            ],

        ];

        CompanyStateLicense::insert($stateLicense);
    }
};
