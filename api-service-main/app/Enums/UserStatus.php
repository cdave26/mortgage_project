<?php

namespace App\Enums;

enum UserStatus: string
{
    case ACTIVE = 'active';
    case ON_HOLD = 'on_hold';
    case ACTIVE_TRIAL = 'active_trial';
    case INACTIVE = 'inactive';

    public function description(): string
    {
        return match ($this)
        {
            self::ACTIVE => 'Active Paid',
            self::ON_HOLD => 'On Hold',
            self::ACTIVE_TRIAL => 'Active Trial',
            self::INACTIVE => 'Inactive'
        };
    }

    public function hubspotValue(): string
    {
        return match ($this)
        {
            self::ACTIVE => 'Active',
            self::ON_HOLD => 'On hold',
            self::ACTIVE_TRIAL => 'Trial',
            self::INACTIVE => 'Terminated'
        };
    }
}