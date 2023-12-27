<?php

namespace App\Enums;

enum MortgageTitle: string
{
    case LENDER = 'Lender';
    case BROKER = 'Broker';
    case BANKER = 'Banker';
    case BANKER_BROKER_SERVICER = 'Banker, Broker, and Servicer';
    case DEPOSITORY = 'Depository';
    case SUPERVISED_LENDER_COMPANY = 'Supervised Lender Company';
    case RESIDENTIAL_MORTGAGE_LENDER = 'Residential Mortgage Lender';
    case RESIDENTIAL_MORTGAGE_BROKER = 'Residential Mortgage Broker';
    case REGISTERED_DEPOSITORY = 'Registered Depository';
    case MORTGAGE_BROKER = 'Mortgage Broker';
    case MORTGAGE_LENDER_SERVICER = 'Mortgage Lender/Servicer';
}
