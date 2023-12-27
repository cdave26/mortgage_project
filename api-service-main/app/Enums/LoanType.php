<?php

namespace App\Enums;

enum LoanType: string
{
    case CONFORMING = 'Conforming';
    case NON_CONFORMING = 'NonConforming';
    case FHA = 'FHA';
    case VA = 'VA';
    case CONVENTIONAL = 'Conventional';
    case HELOC = 'HELOC';
    case USDA_RURAL_HOUSING = 'USDARuralHousing';
}
