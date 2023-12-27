<?php

use App\Enums\Flyer as EnumsFlyer;
use App\Models\Flyer;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Flyer::query()->update(['type' => EnumsFlyer::LISTING]);

        Flyer::insert([
            [
                'name' => 'marketing_lender',
                'image' => 'pdf_featured_images/marketing_lender.png',
                'pdf_name' => 'flyers_pdf/marketing_lender.pdf',
                'type' => EnumsFlyer::MARKETING
            ]
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $flyer = Flyer::where('name', 'marketing_lender')->first();
        $flyer->forceDelete();
    }
};
