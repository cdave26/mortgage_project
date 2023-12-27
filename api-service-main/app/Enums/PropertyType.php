<?php

namespace App\Enums;

enum PropertyType: string
{
    case SINGLE_FAMILY = 'SingleFamily';
    case CONDO = 'Condo';
    case PUD = 'PUD';
    case TOWNHOUSE = 'Townhouse';
    case DETACHED_CONDO = 'DetachedCondo';
    case NON_WARRANTABLE_CONDO = 'NonWarrantableCondo';
    case MANUFACTURED_SINGLE_WIDE = 'ManufacturedSingleWide';
    case MANUFACTURED_DOUBLE_WIDE = 'ManufacturedDoubleWide';

    public function description(): string
    {
        return match ($this)
        {
            self::SINGLE_FAMILY => 'Single Family',
            self::CONDO => 'Condo',
            self::PUD => 'PUD',
            self::TOWNHOUSE => 'Townhouse',
            self::DETACHED_CONDO => 'Detached Condo',
            self::NON_WARRANTABLE_CONDO => 'Non-Warrantable Condo',
            self::MANUFACTURED_SINGLE_WIDE => 'Manufactured Home - Single',
            self::MANUFACTURED_DOUBLE_WIDE => 'Manufactured Home - Double',
        };
    }
}
