<?php

use App\Models\Listing;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public array $listings = [
        204, 205, 206, 207, 208, 209, 210, 211, 212, 213,
        214, 215, 216, 217, 218, 219, 220, 221, 222, 223,
        224, 225, 226, 227, 228, 229, 230, 231, 232, 233,
        234, 235, 236, 237, 238, 239, 240, 241, 581, 584,
        586, 587, 615,
    ];

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('listings', function (Blueprint $table) {
            $table->after('company_id', function (Blueprint $table) {
                $table->foreignId('sub_company_id')
                    ->nullable()
                    ->constrained('companies');

                $table->boolean('from_sub_company')
                    ->default(false);
            });
        });

        $listings = Listing::all();

        $listings->map(function (Listing $listing) {
            $homeseed = 8;
            $listing->timestamps = false;

            if (in_array($listing->id, $this->listings)) {
                $listing->sub_company_id = $homeseed;
                $listing->from_sub_company = true;
            } else {
                $listing->sub_company_id = $listing->company_id;
            }

            $listing->saveQuietly();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('listings', function (Blueprint $table) {
            $table->dropForeign('listings_sub_company_id_foreign');
            $table->dropColumn(['sub_company_id', 'from_sub_company']);
        });
    }
};
