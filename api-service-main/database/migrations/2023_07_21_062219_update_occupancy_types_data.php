<?php

use App\Enums\OccupancyType as EnumsOccupancyType;
use App\Models\OccupancyType;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $types = [
            [
                'id' => EnumsOccupancyType::PRIMARY_RESIDENCE,
                'sequence' => 1
            ],
            [
                'id' => EnumsOccupancyType::SECOND_HOME,
                'sequence' => 2
            ],
            [
                'id' => EnumsOccupancyType::INVESTMENT,
                'sequence' => 3
            ],
        ];

        foreach ($types as $type) {
            OccupancyType::where('id', $type['id'])
                ->update([ 'sequence' => $type['sequence'] ]);
        };
    }
};
