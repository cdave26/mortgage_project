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
                    'id' => EnumsListingStatus::AGENT_DRAFT,
                    'description' => EnumsListingStatus::AGENT_DRAFT->description(),
                    'sequence' => 9,
                ]
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        ListingStatus::query()
            ->where('id', EnumsListingStatus::AGENT_DRAFT)
            ->forceDelete();
    }
};
