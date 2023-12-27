<?php

use App\Enums\DownPaymentType;
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
        $downPaymentTypes = [
            DownPaymentType::PERCENTAGE->value,
            DownPaymentType::DOLLAR->value,
        ];

        Schema::create('buyers', function (Blueprint $table) use ($downPaymentTypes) {
            $table->id();
            $table->foreignId('borrower_id')->constrained('users');
            $table->foreignId('loan_officer_id')->constrained('users');
            $table->string('borrower_address');
            $table->string('borrower_city');
            $table->foreignId('borrower_state_id')->constrained('states');
            $table->integer('borrower_zip');
            $table->string('co_borrower_first_name', 50)->nullable();
            $table->string('co_borrower_last_name', 50)->nullable();
            $table->string('co_borrower_email')->nullable();
            $table->string('agent_first_name', 50);
            $table->string('agent_last_name', 50);
            $table->string('agent_email');
            $table->string('property_type_id', 50);
            $table->string('occupancy_type_id', 50);
            $table->string('unit_id', 50);
            $table->foreignId('property_state_id')->constrained('states');
            $table->foreignId('property_county_id')->constrained('counties');
            $table->string('credit_score_range_id', 50);
            $table->float('debt_to_income_ratio', 6, 3);
            $table->boolean('veterans_affairs');
            $table->decimal('max_qualifying_payment', 13, 3);
            $table->decimal('max_down_payment', 13, 3);
            $table->boolean('first_time_home_buyers');
            $table->enum('default_down_payment_type', $downPaymentTypes);
            $table->decimal('default_down_payment_value', 13, 3);
            $table->decimal('homeowners_insurance', 13, 3);
            $table->boolean('self_employed');
            $table->string('code', 15)->unique();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent();
            $table->softDeletes();

            $table->foreign('unit_id')
                ->references('id')
                ->on('units');

            $table->foreign('property_type_id')
                ->references('id')
                ->on('property_types');

            $table->foreign('occupancy_type_id')
                ->references('id')
                ->on('occupancy_types');

            $table->foreign('credit_score_range_id')
                ->references('id')
                ->on('credit_score_ranges');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('buyers');
    }
};
