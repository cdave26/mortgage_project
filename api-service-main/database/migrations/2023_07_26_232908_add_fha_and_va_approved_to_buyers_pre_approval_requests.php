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
        Schema::table('buyers_pre_approval_requests', function (Blueprint $table) {
            $table->after('homeowners_association_fee', function (Blueprint $table) {
                $table->boolean('veterans_affairs_approved')->default(false);
                $table->boolean('first_time_home_buyers_approved')->default(false);
            });
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('buyers_pre_approval_requests', function (Blueprint $table) {
            $table->dropColumn([
                'veterans_affairs_approved',
                'first_time_home_buyers_approved',
            ]);
        });
    }
};
