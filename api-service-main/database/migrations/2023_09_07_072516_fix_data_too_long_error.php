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
        Schema::table('companies', function (Blueprint $table) {
            $table->text('company_privacy_policy_URL')->change();
        });

        Schema::table('listings', function (Blueprint $table) {
            $table->text('mls_link')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->string('company_privacy_policy_URL', 120)->change();
        });

        Schema::table('listings', function (Blueprint $table) {
            $table->string('mls_link')->nullable()->change();
        });
    }
};
