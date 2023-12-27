<?php

use App\Enums\Listing;
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
        $pageDesigns = [
            Listing::COMPANY_COLORS->value,
            Listing::FLYER_DESIGN->value,
        ];

        Schema::create('listings', function (Blueprint $table) use ($pageDesigns) {
            $table->id();
            $table->foreignId('user_id')->constrained('users');
            $table->foreignId('company_id')->constrained('companies');
            $table->foreignId('user_license_id')->constrained('licenses');
            $table->string('mls_number', 50);
            $table->string('mls_link')->nullable();
            $table->string('page_link')->nullable();
            $table->enum('page_design', $pageDesigns)->default(Listing::COMPANY_COLORS->value);
            $table->foreignId('flyer_id')->nullable()->constrained('flyers');
            $table->string('listing_agent_name', 50);
            $table->string('listing_agent_email', 50);
            $table->string('property_address', 50);
            $table->string('property_apt_suite', 100)->nullable();
            $table->string('property_city', 50);
            $table->string('property_zip', 30);
            $table->string('property_type', 50);
            $table->string('units_count', 50);
            $table->decimal('property_value', 13, 3);
            $table->decimal('seller_credits', 13, 3);
            $table->string('credit_verified_by', 50);
            $table->float('default_down_payment', 5, 2);
            $table->decimal('loan_amount', 13, 3)->nullable();
            $table->decimal('hoa_dues', 13, 3)->nullable();
            $table->decimal('property_taxes', 13, 3);
            $table->decimal('homeowners_insurance', 13, 3);
            $table->boolean('usda_lookup')->default(false);
            $table->boolean('fha_condo_lookup')->default(false);
            $table->boolean('va_condo_lookup')->default(false);
            $table->string('listing_status');
            $table->foreignId('deleted_by')->nullable()->constrained('users');
            $table->integer('pub_page_web_views')->default(0);
            $table->softDeletes();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('listings');
    }
};
