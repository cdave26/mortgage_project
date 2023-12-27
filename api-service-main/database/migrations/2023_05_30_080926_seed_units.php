<?php

use App\Enums\Unit as UnitEnum;
use App\Models\Unit;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Unit::insert([
            [
                'id' => UnitEnum::ONE,
                'description' => UnitEnum::ONE->description(),
                'sequence' => 1,
            ],
            [
                'id' => UnitEnum::TWO,
                'description' => UnitEnum::TWO->description(),
                'sequence' => 2,
            ],
            [
                'id' => UnitEnum::THREE,
                'description' => UnitEnum::THREE->description(),
                'sequence' => 3,
            ],
            [
                'id' => UnitEnum::FOUR,
                'description' => UnitEnum::FOUR->description(),
                'sequence' => 4,
            ],
        ]);
    }
};
