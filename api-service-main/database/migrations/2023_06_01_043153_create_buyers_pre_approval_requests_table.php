<?php

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
        Schema::create('buyers_pre_approval_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('buyer_id')->constrained('buyers');
            $table->decimal('price', 13, 3);
            $table->decimal('down_payment', 13, 3);
            $table->decimal('loan_amount', 13, 3);
            $table->decimal('tax', 13, 3);
            $table->decimal('seller_credit', 13, 3);
            $table->decimal('homeowners_association_fee', 13, 3);
            $table->string('address');
            $table->string('city');
            $table->integer('zip');
            $table->foreignId('county_id')->constrained('counties');
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('buyers_pre_approval_requests');
    }
};
