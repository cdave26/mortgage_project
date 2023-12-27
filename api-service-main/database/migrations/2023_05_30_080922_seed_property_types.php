<?php

use App\Enums\PropertyType as PropertyTypeEnum;
use App\Models\PropertyType;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        PropertyType::insert([
            [
                'id' => PropertyTypeEnum::SINGLE_FAMILY,
                'description' => PropertyTypeEnum::SINGLE_FAMILY->description(),
                'sequence' => 1,
            ],
            [
                'id' => PropertyTypeEnum::CONDO,
                'description' => PropertyTypeEnum::CONDO->description(),
                'sequence' => 2,
            ],
            [
                'id' => PropertyTypeEnum::PUD,
                'description' => PropertyTypeEnum::PUD->description(),
                'sequence' => 3,
            ],
            [
                'id' => PropertyTypeEnum::TOWNHOUSE,
                'description' => PropertyTypeEnum::TOWNHOUSE->description(),
                'sequence' => 4,
            ],
            [
                'id' => PropertyTypeEnum::DETACHED_CONDO,
                'description' => PropertyTypeEnum::DETACHED_CONDO->description(),
                'sequence' => 5,
            ],
            [
                'id' => PropertyTypeEnum::NON_WARRANTABLE_CONDO,
                'description' => PropertyTypeEnum::NON_WARRANTABLE_CONDO->description(),
                'sequence' => 6,
            ],
            [
                'id' => PropertyTypeEnum::MANUFACTURED_SINGLE_WIDE,
                'description' => PropertyTypeEnum::MANUFACTURED_SINGLE_WIDE->description(),
                'sequence' => 7,
            ],
            [
                'id' => PropertyTypeEnum::MANUFACTURED_DOUBLE_WIDE,
                'description' => PropertyTypeEnum::MANUFACTURED_DOUBLE_WIDE->description(),
                'sequence' => 8,
            ],
        ]);
    }
};
