<?php

namespace App\Enums;

enum UserType: string
{
    case UPLIST_ADMIN = 'uplist_admin';
    case COMPANY_ADMIN = 'company_admin';
    case LOAN_OFFICER = 'loan_officer';
    case BUYER = 'buyer';

    public function id(): int
    {
        return match ($this)
        {
            self::UPLIST_ADMIN => 1,
            self::COMPANY_ADMIN => 2,
            self::LOAN_OFFICER => 3,
            self::BUYER => 4,
        };
    }
}
