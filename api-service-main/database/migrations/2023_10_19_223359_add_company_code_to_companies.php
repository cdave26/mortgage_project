<?php

use App\Models\Company;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->after('pricing_engine_id', function (Blueprint $table) {
                $table->string('code', 50)->nullable();
            });
        });

        $codes = [
            'Uplist' => 'uplist',
            'Your Company' => 'your-company',
            'Planet Home Lending, LLC' => 'planet-home-lending',
            'NFM, Inc.' => 'nfm',
            'Mann Mortgage, LLC' => 'mann-mortgage',
            'Upwell Mortgage, Inc.' => 'upwell-mortgage',
            'GO Mortgage' => 'go-mortgage',
            'Fairway Independent Mortgage Corporation' => 'fairway-independent-mortgage-corporation',
            'First Community Mortgage, Inc.' => 'first-community-mortgage',
            'First Financial Mortgage' => 'first-financial-mortgage',
            'Revolution Mortgage' => 'revolution-mortgage',
            'Direct Mortgage Loans, LLC' => 'direct-mortgage-loans',
            'Homeseed Loans, a division of Mann Mortgage, LLC' => 'homeseed-loans',
            'Hometrust Mortgage Company' => 'hometrust-mortgage-company',
            'Lennar Mortgage' => 'lennar-mortgage',
            'Luminate Home Loans, Inc.' => 'luminate-home-loans',
            'Momentum Home Loans' => 'momentum-home-loans',
            'Enterprise Test Company' => 'enterprise-test-company',
            'Test 1.1' => 'test-1-1',
        ];

        foreach ($codes as $company => $code) {
            $company = Company::firstWhere('name', $company);

            if (is_null($company)) continue;

            $company->code = $code;
            $company->save();
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn('code');
        });
    }
};
