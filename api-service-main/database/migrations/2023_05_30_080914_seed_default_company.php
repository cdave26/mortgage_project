<?php

use App\Enums\PricingEngine as EnumsPricingEngine;
use App\Models\Company;
use App\Models\PricingEngine;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        
        $uplistPricingEngine = PricingEngine::where('name', EnumsPricingEngine::OPTIMAL_BLUE)->first();
        $company = [
            [
                "pricing_engine_id" => $uplistPricingEngine->id,
                "name" => "Uplist",
                "has_company_msa" => true,
                "address" => "uplist address",
                "city" => "uplist city",
                "state" => "uplist state",
                "zip" => "uplist zip",
                "company_privacy_policy_URL" => "https://getuplist.com/privacy-policy",
                "company_terms_of_tervice_URL" => "https://getuplist.com/terms-of-service",
                "company_nmls_number" => "uplist nmls number",
                "company_mobile_number" => "uplist mobile number",
            ]
        ];

        Company::insert($company);
    }
};
