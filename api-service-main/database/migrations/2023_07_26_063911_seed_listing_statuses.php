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
        ListingStatus::insert([
            [
                'id' => EnumsListingStatus::PUBLISHED,
                'description' => EnumsListingStatus::PUBLISHED->description(),
                'sequence' => 1,
            ],
            [
                'id' => EnumsListingStatus::SALE_PENDING,
                'description' => EnumsListingStatus::SALE_PENDING->description(),
                'sequence' => 2,
            ],
            [
                'id' => EnumsListingStatus::LISTING_SOLD,
                'description' => EnumsListingStatus::LISTING_SOLD->description(),
                'sequence' => 3,
            ],
            [
                'id' => EnumsListingStatus::LISTING_CANCELLED,
                'description' => EnumsListingStatus::LISTING_CANCELLED->description(),
                'sequence' => 4,
            ],
            [
                'id' => EnumsListingStatus::DRAFT,
                'description' => EnumsListingStatus::DRAFT->description(),
                'sequence' => 5,
            ],
            [
                'id' => EnumsListingStatus::PENDING_REVIEW,
                'description' => EnumsListingStatus::PENDING_REVIEW->description(),
                'sequence' => 6,
            ],
            [
                'id' => EnumsListingStatus::ARCHIVED,
                'description' => EnumsListingStatus::ARCHIVED->description(),
                'sequence' => 7,
            ],
        ]);
    }
};
