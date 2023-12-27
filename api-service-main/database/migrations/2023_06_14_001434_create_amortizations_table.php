<?php

use App\Enums\LoanType;
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
        $loanTypes = [
            LoanType::CONFORMING->value,
            LoanType::NON_CONFORMING->value,
            LoanType::FHA->value,
            LoanType::VA->value,
            LoanType::CONVENTIONAL->value,
            LoanType::HELOC->value,
            LoanType::USDA_RURAL_HOUSING->value,
        ];

        Schema::create('amortizations', function (Blueprint $table) use ($loanTypes) {
            $table->id();
            $table->morphs('model');
            $table->string('search_id', 50);
            $table->integer('product_id');
            $table->integer('quote_number')->nullable();
            $table->enum('loan_type', $loanTypes);
            $table->integer('lock_period');
            $table->float('interest_rate', 6, 3);
            $table->float('annual_percentage_rate', 6, 3);
            $table->decimal('monthly_principal_interest', 13, 3);
            $table->decimal('mortgage_insurance', 13, 3);
            $table->decimal('insurance', 13, 3);
            $table->decimal('total_payment', 13, 3);
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('amortizations');
    }
};
