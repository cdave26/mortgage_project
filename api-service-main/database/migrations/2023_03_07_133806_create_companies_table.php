<?php

use App\Enums\Company;
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
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50);
            $table->boolean('has_company_msa')->default(false);
            $table->string('address', 50);
            $table->string('city', 30);
            $table->string('state', 30);
            $table->string('zip', 20);
            $table->enum('equal_housing', [Company::EQUAL_HOUSING_LENDER, Company::EQUAL_HOUSING_OPPORTUNITY])->default(Company::EQUAL_HOUSING_LENDER);
            $table->string('company_logo', 120)->nullable();
            $table->string('header_background_color', 20)->default("#0662C7");
            $table->string('header_text_color', 20)->default("#fff");
            $table->text('listing_disclaimer')->nullable();
            $table->boolean('is_enterprise')->default(false);
            $table->integer('enterprise_max_user')->nullable();
            $table->string('hubspot_company_id')->nullable();
            $table->foreignId('deleted_by')->nullable()->constrained('users');
            $table->softDeletes();
            $table->string('company_privacy_policy_URL', 120);
            $table->string('company_terms_of_tervice_URL', 120)->nullable();
            $table->string('company_nmls_number', 30);
            $table->string('company_mobile_number', 20);
            $table->text('additional_details')->nullable();
            $table->timestamp('expiration_date')->nullable();
            $table->timestamp('renewal_date')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent();
            $table->boolean('allow_access_to_buyer_app')->default(false);
            $table->boolean('allow_loan_officer_to_upload_logo')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('companies');
    }
};
