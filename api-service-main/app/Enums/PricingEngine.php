<?php

namespace App\Enums;

enum PricingEngine: string
{
    case OPTIMAL_BLUE = 'Optimal Blue';
    case EPPS = 'EPPS';
    case LENDER_PRICE = 'Lender Price';
    case LOAN_SIFTER = 'Loan Sifter';
    case MORTECH = 'Mortech';
    case OPEN_CLOSE = 'Open Close';
    case POLLY = 'Polly';
}
