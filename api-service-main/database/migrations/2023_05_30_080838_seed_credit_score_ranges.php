<?php

use App\Enums\CreditScoreRange as CreditScoreRangeEnum;
use App\Models\CreditScoreRange;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        CreditScoreRange::insert([
            [
                'id' => CreditScoreRangeEnum::FROM_780_TO_850,
                'description' => CreditScoreRangeEnum::FROM_780_TO_850->description(),
                'sequence' => 1,
            ],
            [
                'id' => CreditScoreRangeEnum::FROM_760_TO_779,
                'description' => CreditScoreRangeEnum::FROM_760_TO_779->description(),
                'sequence' => 2,
            ],
            [
                'id' => CreditScoreRangeEnum::FROM_740_TO_759,
                'description' => CreditScoreRangeEnum::FROM_740_TO_759->description(),
                'sequence' => 3,
            ],
            [
                'id' => CreditScoreRangeEnum::FROM_720_TO_739,
                'description' => CreditScoreRangeEnum::FROM_720_TO_739->description(),
                'sequence' => 4,
            ],
            [
                'id' => CreditScoreRangeEnum::FROM_700_TO_719,
                'description' => CreditScoreRangeEnum::FROM_700_TO_719->description(),
                'sequence' => 5,
            ],
            [
                'id' => CreditScoreRangeEnum::FROM_680_TO_699,
                'description' => CreditScoreRangeEnum::FROM_680_TO_699->description(),
                'sequence' => 6,
            ],
            [
                'id' => CreditScoreRangeEnum::FROM_660_TO_679,
                'description' => CreditScoreRangeEnum::FROM_660_TO_679->description(),
                'sequence' => 7,
            ],
            [
                'id' => CreditScoreRangeEnum::FROM_640_TO_659,
                'description' => CreditScoreRangeEnum::FROM_640_TO_659->description(),
                'sequence' => 8,
            ],
            [
                'id' => CreditScoreRangeEnum::FROM_620_TO_639,
                'description' => CreditScoreRangeEnum::FROM_620_TO_639->description(),
                'sequence' => 9,
            ],
            [
                'id' => CreditScoreRangeEnum::FROM_600_TO_619,
                'description' => CreditScoreRangeEnum::FROM_600_TO_619->description(),
                'sequence' => 10,
            ],
            [
                'id' => CreditScoreRangeEnum::FROM_580_TO_599,
                'description' => CreditScoreRangeEnum::FROM_580_TO_599->description(),
                'sequence' => 11,
            ],
            [
                'id' => CreditScoreRangeEnum::FROM_400_TO_579,
                'description' => CreditScoreRangeEnum::FROM_400_TO_579->description(),
                'sequence' => 12,
            ],
        ]);
    }
};
