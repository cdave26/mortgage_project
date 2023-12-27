<?php

namespace App\Enums;

enum CreditScoreRange: string
{
    case FROM_780_TO_850 = '780,850';
    case FROM_760_TO_779 = '760,779';
    case FROM_740_TO_759 = '740,759';
    case FROM_720_TO_739 = '720,739';
    case FROM_700_TO_719 = '700,719';
    case FROM_680_TO_699 = '680,699';
    case FROM_660_TO_679 = '660,679';
    case FROM_640_TO_659 = '640,659';
    case FROM_620_TO_639 = '620,639';
    case FROM_600_TO_619 = '600,619';
    case FROM_580_TO_599 = '580,599';
    case FROM_400_TO_579 = '400,579';

    public function description(): string
    {
        return match ($this)
        {
            self::FROM_780_TO_850 => '780 or higher',
            self::FROM_760_TO_779 => '760 - 779',
            self::FROM_740_TO_759 => '740 - 759',
            self::FROM_720_TO_739 => '720 - 739',
            self::FROM_700_TO_719 => '700 - 719',
            self::FROM_680_TO_699 => '680 - 699',
            self::FROM_660_TO_679 => '660 - 679',
            self::FROM_640_TO_659 => '640 - 659',
            self::FROM_620_TO_639 => '620 - 639',
            self::FROM_600_TO_619 => '600 - 619',
            self::FROM_580_TO_599 => '580 - 599',
            self::FROM_400_TO_579 => '579 or less',
        };
    }
}
