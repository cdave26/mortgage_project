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
        Schema::table('buyers', function (Blueprint $table) {
            $table->string('agent_first_name', 50)->nullable()->change();
            $table->string('agent_last_name', 50)->nullable()->change();
            $table->string('agent_email')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('buyers', function (Blueprint $table) {
            $table->string('agent_first_name', 50)->change();
            $table->string('agent_last_name', 50)->change();
            $table->string('agent_email')->change();
        });
    }
};
