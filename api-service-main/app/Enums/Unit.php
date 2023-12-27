<?php

namespace App\Enums;

enum Unit: string
{
    case ONE = 'OneUnit';
    case TWO = 'TwoUnits';
    case THREE = 'ThreeUnits';
    case FOUR = 'FourUnits';

    public function description(): string
    {
        return match ($this)
        {
            self::ONE => 'One Unit',
            self::TWO => 'Two Units',
            self::THREE => 'Three Units',
            self::FOUR => 'Four Units',
        };
    }
}
