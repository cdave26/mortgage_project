<?php

use App\Enums\Flyer;
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
        $flyerTypes = [
            Flyer::LISTING,
            flyer::MARKETING,
        ];

        Schema::table('flyers', function (Blueprint $table) use ($flyerTypes) {
            $table->enum('type', $flyerTypes)
                ->after('pdf_name')
                ->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('flyers', function (Blueprint $table) {
            $table->dropColumn(('type'));
        });
    }
};
