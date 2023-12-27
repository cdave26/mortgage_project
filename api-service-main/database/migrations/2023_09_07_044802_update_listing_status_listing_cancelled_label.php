<?php

use App\Enums\ListingStatus as EnumsListingStatus;
use App\Models\ListingStatus;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {

        ListingStatus::query()
            ->insert([
                [
                    'id' => EnumsListingStatus::LISTING_REMOVED,
                    'description' => EnumsListingStatus::LISTING_REMOVED->description(),
                    'sequence' => 4,
                ]
            ]);

        ListingStatus::query()
            ->where('id', EnumsListingStatus::LISTING_CANCELLED)
            ->update([
                'active' => false,
                'sequence' => 8
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        ListingStatus::query()
            ->where('id', EnumsListingStatus::LISTING_CANCELLED)
            ->update([
                'active' => true,
                'sequence' => 4
            ]);

        ListingStatus::query()
            ->where('id', EnumsListingStatus::LISTING_REMOVED)
            ->forceDelete();
    }
};
