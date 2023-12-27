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

        Schema::table('buyers_pre_approval_requests', function (Blueprint $table) use ($downPaymentTypes) {
            $table->enum('down_payment_type', $downPaymentTypes)->after('price');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('buyers_pre_approval_requests', function (Blueprint $table) {
            $table->dropColumn('down_payment_type');
        });
    }
};
