<?php

namespace App\Enums;

enum OccupancyType: string
{
    case PRIMARY_RESIDENCE = 'PrimaryResidence';
    case SECOND_HOME = 'SecondHome';
    case INVESTMENT = 'InvestmentProperty';

    public function description(): string
    {
        return match ($this)
        {
            self::PRIMARY_RESIDENCE => 'Primary Residence',
            self::SECOND_HOME => 'Second Home',
            self::INVESTMENT => 'Investment',
        };
    }
}
