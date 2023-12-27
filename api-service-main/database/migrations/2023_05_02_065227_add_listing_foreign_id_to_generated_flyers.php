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
        Schema::table('generated_flyers', function (Blueprint $table) {
            $table->foreignId('listing_id')
                ->after('id')
                ->constrained('listings');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('generated_flyers', function (Blueprint $table) {
            $table->dropForeign('generated_flyers_listing_id_foreign');
            $table->dropColumn('listing_id');
        });
    }
};
