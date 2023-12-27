<?php

use App\Enums\OccupancyType as OccupancyTypeEnum;
use App\Models\OccupancyType;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        OccupancyType::insert([
            [
                'id' => OccupancyTypeEnum::PRIMARY_RESIDENCE,
                'description' => OccupancyTypeEnum::PRIMARY_RESIDENCE->description(),
            ],
            [
                'id' => OccupancyTypeEnum::SECOND_HOME,
                'description' => OccupancyTypeEnum::SECOND_HOME->description(),
            ],
            [
                'id' => OccupancyTypeEnum::INVESTMENT,
                'description' => OccupancyTypeEnum::INVESTMENT->description(),
            ],
        ]);
    }
};
