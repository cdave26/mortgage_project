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
        Schema::table('listings', function (Blueprint $table) {
            $table->foreignId('state_id')
                ->after('user_license_id')
                ->constrained('states');

            $table->foreignId('county_id')
                ->after('state_id')
                ->constrained('counties');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('listings', function (Blueprint $table) {
            $table->dropForeign('listings_state_id_foreign');
            $table->dropColumn('state_id');
            
            $table->dropForeign('listings_county_id_foreign');
            $table->dropColumn('county_id');
        });
    }
};
