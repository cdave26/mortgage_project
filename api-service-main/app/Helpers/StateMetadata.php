<?php

namespace App\Helpers;

use App\Enums\CaliforniaLegislative;
use App\Enums\MortgageStatus;
use App\Enums\MortgageTitle;

class StateMetadata
{
    public static function arizona(
        MortgageTitle $title,
        string $address,
        string $city,
        int $zip,
    ): array {
        return [
            'name' => 'Arizona',
            'validation' => [
                [
                    'name' => 'Mortgage (Banker or Broker)',
                    'key' => 'banker_broker',
                    'selection' => [
                        [
                            'full_title' => 'Banker',
                            'value' => 'Banker',
                            'checked' => $title === MortgageTitle::BANKER,
                        ],
                        [
                            'full_title' => 'Broker',
                            'value' => 'Broker',
                            'checked' => $title === MortgageTitle::BROKER,
                        ],
                    ],
                ],
                [
                    'name' => 'Branch Address',
                    'key' => 'branch_address',
                    'selection' => [
                        [
                            'full_title' => 'Address',
                            'value' => $address,
                        ],
                        [
                            'full_title' => 'City',
                            'value' => $city,
                        ],
                        [
                            'full_title' => 'Zip',
                            'value' => $zip,
                        ],
                    ],
                ],
            ],
            'disclaimer' => '',
        ];
    }

    public static function arkansas(
        MortgageTitle $title,
        string $address,
        string $city,
        int $zip,
    ): array {
        return [
            'name' => 'Arkansas',
            'validation' => [
                [
                    'name' => 'Mortgage (Banker or Broker, and Servicer)',
                    'key' => 'banker_broker_servicer',
                    'selection' => [
                        [
                            'full_title' => 'Banker',
                            'value' => 'Banker',
                            'checked' => $title === MortgageTitle::BANKER,
                        ],
                        [
                            'full_title' => 'Broker',
                            'value' => 'Broker',
                            'checked' => $title === MortgageTitle::BROKER,
                        ],
                        [
                            'full_title' => 'Banker, Broker, and Servicer',
                            'value' => 'Banker, Broker, and Servicer',
                            'checked' => $title === MortgageTitle::BANKER_BROKER_SERVICER,
                        ],
                    ],
                ],
                [
                    'name' => 'Branch Address',
                    'key' => 'branch_address',
                    'selection' => [
                        [
                            'full_title' => 'Address',
                            'value' => $address,
                        ],
                        [
                            'full_title' => 'City',
                            'value' => $city,
                        ],
                        [
                            'full_title' => 'Zip',
                            'value' => $zip,
                        ],
                    ],
                ],
            ],
            'disclaimer' => '',
        ];
    }

    public static function california(string $option): array
    {
        return [
            'name' => 'California',
            'validation' => [
                [
                    'name' => 'Licensed by the California Department of',
                    'key' => 'california_options',
                    'selection' => [
                        [
                            'full_title' => 'Financial Protection and Innovation under the California Financing Law',
                            'value' => 'Financial california law',
                            'checked' => CaliforniaLegislative::FINANCIAL_CALIFORNIA_LAW->value === $option,
                        ],
                        [
                            'full_title' => 'Financial Protection and Innovation under the California Residential Mortgage Lending Act',
                            'value' => 'Mortgage lending act',
                            'checked' => CaliforniaLegislative::MORTGAGE_LENDING_ACT->value === $option,
                        ],
                        [
                            'full_title' => 'Real Estate under the Department of Real Estate',
                            'value' => 'Dept real estate',
                            'checked' => CaliforniaLegislative::DEPT_REAL_ESTATE->value === $option,
                        ],
                    ],
                ],
            ],
            'disclaimer' => '',
        ];
    }

    public static function connecticut(MortgageTitle $title): array
    {
        return [
            'name' => 'Connecticut',
            'validation' => [
                [
                    'name' => 'Mortgage (Lender or Broker)',
                    'key' => 'lender_broker',
                    'selection' => [
                        [
                            'full_title' => 'Lender',
                            'value' => 'Lender',
                            'checked' => $title === MortgageTitle::LENDER,
                        ],
                        [
                            'full_title' => 'Broker',
                            'value' => 'Broker',
                            'checked' => $title === MortgageTitle::BROKER,
                        ],
                    ],
                ],
            ],
            'disclaimer' => '',
        ];
    }

    public static function delaware(MortgageTitle $title): array
    {
        return [
            'name' => 'Delaware',
            'validation' => [
                [
                    'name' => 'Mortgage (Lender or Broker)',
                    'key' => 'lender_broker',
                    'selection' => [
                        [
                            'full_title' => 'Lender',
                            'value' => 'Lender',
                            'checked' => $title === MortgageTitle::LENDER,
                        ],
                        [
                            'full_title' => 'Broker',
                            'value' => 'Broker',
                            'checked' => $title === MortgageTitle::BROKER,
                        ],
                    ],
                ],
            ],
            'disclaimer' => '',
        ];
    }

    public static function georgia(
        MortgageTitle $title,
        MortgageStatus $status,
        string $address,
        string $city,
        int $zip,
    ): array {
        return [
            'name' => 'Georgia',
            'validation' => [
                [
                    'name' => 'Mortgage (Lender or Broker)',
                    'key' => 'lender_broker',
                    'selection' => [
                        [
                            'full_title' => 'Lender',
                            'value' => 'Lender',
                            'checked' => $title === MortgageTitle::LENDER,
                        ],
                        [
                            'full_title' => 'Broker',
                            'value' => 'Broker',
                            'checked' => $title === MortgageTitle::BROKER,
                        ],
                    ],
                ],
                [
                    'name' => 'Licensee or Registrant',
                    'key' => 'licensee_registrant',
                    'selection' => [
                        [
                            'full_title' => 'Licensee',
                            'value' => 'Licensee',
                            'checked' => $status === MortgageStatus::LICENSEE,
                        ],
                        [
                            'full_title' => 'Registrant',
                            'value' => 'Registrant',
                            'checked' => $status === MortgageStatus::REGISTRANT,
                        ],
                    ],
                ],
                [
                    'name' => 'Branch Address',
                    'key' => 'branch_address',
                    'selection' => [
                        [
                            'full_title' => 'Address',
                            'value' => $address,
                        ],
                        [
                            'full_title' => 'City',
                            'value' => $city,
                        ],
                        [
                            'full_title' => 'Zip',
                            'value' => $zip,
                        ],
                    ],
                ],
            ],
            'disclaimer' => '',
        ];
    }

    public static function massachusetts(MortgageTitle $title): array
    {
        return [
            'name' => 'Massachusetts',
            'validation' => [
                [
                    'name' => 'Mortgage (Lender or Broker)',
                    'key' => 'lender_broker',
                    'selection' => [
                        [
                            'full_title' => 'Lender',
                            'value' => 'Lender',
                            'checked' => $title === MortgageTitle::LENDER,
                        ],
                        [
                            'full_title' => 'Broker',
                            'value' => 'Broker',
                            'checked' => $title === MortgageTitle::BROKER,
                        ],
                    ],
                ],
            ],
            'disclaimer' => '',
        ];
    }

    public static function montana(MortgageTitle $title): array
    {
        return [
            'name' => 'Montana',
            'validation' => [
                [
                    'name' => 'Mortgage (Lender or Broker)',
                    'key' => 'lender_broker',
                    'selection' => [
                        [
                            'full_title' => 'Lender',
                            'value' => 'Lender',
                            'checked' => $title === MortgageTitle::LENDER,
                        ],
                        [
                            'full_title' => 'Broker',
                            'value' => 'Broker',
                            'checked' => $title === MortgageTitle::BROKER,
                        ],
                    ],
                ],
            ],
            'disclaimer' => '',
        ];
    }

    public static function nebraska(MortgageStatus $status): array
    {
        return [
            'name' => 'Nebraska',
            'validation' => [
                [
                    'name' => 'Licensee or Registrant',
                    'key' => 'licensee_registrant',
                    'selection' => [
                        [
                            'full_title' => 'Licensee',
                            'value' => 'Licensee',
                            'checked' => $status === MortgageStatus::LICENSEE,
                        ],
                        [
                            'full_title' => 'Registrant',
                            'value' => 'Registrant',
                            'checked' => $status === MortgageStatus::REGISTRANT,
                        ],
                    ],
                ],
            ],
            'disclaimer' => '',
        ];
    }

    public static function nevada(string $address, string $city, int $zip): array
    {
        return [
            'name' => 'Nevada',
            'validation' => [
                [
                    'name' => 'Branch Address',
                    'key' => 'branch_address',
                    'selection' => [
                        [
                            'full_title' => 'Address',
                            'value' => $address,
                        ],
                        [
                            'full_title' => 'City',
                            'value' => $city,
                        ],
                        [
                            'full_title' => 'Zip',
                            'value' => $zip,
                        ],
                    ],
                ],
            ],
            'disclaimer' => '',
        ];
    }

    public static function newJersey(MortgageTitle $title, MortgageStatus $status): array
    {
        return [
            'name' => 'New Jersey',
            'validation' => [
                [
                    'name' => 'Mortgage (Lender or Broker or Depository)',
                    'key' => 'lender_broker_depository',
                    'selection' => [
                        [
                            'full_title' => 'Residential Mortgage Lender',
                            'value' => 'Residential Mortgage Lender',
                            'checked' => $title === MortgageTitle::RESIDENTIAL_MORTGAGE_LENDER,
                        ],
                        [
                            'full_title' => 'Residential Mortgage Broker',
                            'value' => 'Residential Mortgage Broker',
                            'checked' => $title === MortgageTitle::RESIDENTIAL_MORTGAGE_BROKER,
                        ],
                        [
                            'full_title' => 'Registered Depository',
                            'value' => 'Registered Depository',
                            'checked' => $title === MortgageTitle::REGISTERED_DEPOSITORY,
                        ],
                    ],
                ],
                [
                    'name' => 'Licensee or Registrant',
                    'key' => 'licensee_registrant',
                    'selection' => [
                        [
                            'full_title' => 'Licensee',
                            'value' => 'Licensee',
                            'checked' => $status === MortgageStatus::LICENSEE,
                        ],
                        [
                            'full_title' => 'Registrant',
                            'value' => 'Registrant',
                            'checked' => $status === MortgageStatus::REGISTRANT,
                        ],
                    ],
                ],
            ],
            'disclaimer' => '',
        ];
    }

    public static function newYork(MortgageTitle $title, MortgageStatus $status): array
    {
        return [
            'name' => 'New York',
            'validation' => [
                [
                    'name' => 'Mortgage (Banker or Broker)',
                    'key' => 'banker_broker',
                    'selection' => [
                        [
                            'full_title' => 'Banker',
                            'value' => 'Banker',
                            'checked' => $title === MortgageTitle::BANKER,
                        ],
                        [
                            'full_title' => 'Broker',
                            'value' => 'Broker',
                            'checked' => $title === MortgageTitle::BROKER,
                        ],
                    ],
                ],
                [
                    'name' => 'Licensee or Registrant',
                    'key' => 'licensee_registrant',
                    'selection' => [
                        [
                        'full_title' => 'Licensee',
                        'value' => 'Licensee',
                        'checked' => $status === MortgageStatus::LICENSEE,
                        ],
                        [
                        'full_title' => 'Registrant',
                        'value' => 'Registrant',
                        'checked' => $status === MortgageStatus::REGISTRANT,
                        ],
                    ],
                ],
            ],
            'disclaimer' => '',
        ];
    }

    public static function ohio(string $address, string $city, int $zip): array
    {
        return [
            'name' => 'Ohio',
            'validation' => [
                [
                    'name' => 'Branch Address',
                    'key' => 'branch_address',
                    'selection' => [
                        [
                            'full_title' => 'Address',
                            'value' => $address,
                        ],
                        [
                            'full_title' => 'City',
                            'value' => $city,
                        ],
                        [
                            'full_title' => 'Zip',
                            'value' => $zip,
                        ],
                    ],
                ],
            ],
            'disclaimer' => '',
        ];
    }

    public static function rhodeIsland(MortgageTitle $title): array
    {
        return [
            'name' => 'Rhode Island',
            'validation' => [
                [
                    'name' => 'Mortgage (Lender or Broker)',
                    'key' => 'lender_broker',
                    'selection' => [
                        [
                            'full_title' => 'Lender',
                            'value' => 'Lender',
                            'checked' => $title === MortgageTitle::LENDER,
                        ],
                        [
                            'full_title' => 'Broker',
                            'value' => 'Broker',
                            'checked' => $title === MortgageTitle::BROKER,
                        ],
                    ],
                ],
            ],
            'disclaimer' => '',
        ];
    }

    public static function southCarolina(MortgageTitle $title): array
    {
        return [
            'name' => 'South Carolina',
            'validation' => [
                [
                    'name' => 'Mortgage (Lender or Supervised Lender or Broker)',
                    'key' => 'servicer_lender_broker',
                    'selection' => [
                        [
                            'full_title' => 'Mortgage Lender/Servicer',
                            'value' => 'Mortgage Lender/Servicer',
                            'checked' => $title === MortgageTitle::MORTGAGE_LENDER_SERVICER,
                        ],
                        [
                            'full_title' => 'Supervised Lender Company',
                            'value' => 'Supervised Lender Company',
                            'checked' => $title === MortgageTitle::SUPERVISED_LENDER_COMPANY,
                        ],
                        [
                            'full_title' => 'Mortgage Broker',
                            'value' => 'Mortgage Broker',
                            'checked' => $title === MortgageTitle::MORTGAGE_BROKER,
                        ],
                    ],
                ],
            ],
            'disclaimer' => '',
        ];
    }

    public static function texas(MortgageStatus $status): array
    {
        return [
            'name' => 'Texas',
            'validation' => [
                [
                    'name' => 'Licensee or Registrant',
                    'key' => 'licensee_registrant',
                    'selection' => [
                        [
                            'full_title' => 'Licensee',
                            'value' => 'Licensee',
                            'checked' => $status === MortgageStatus::LICENSEE,
                        ],
                        [
                            'full_title' => 'Registrant',
                            'value' => 'Registrant',
                            'checked' => $status === MortgageStatus::REGISTRANT,
                        ],
                    ],
                ],
            ],
            'disclaimer' => '',
        ];
    }

    public static function vermont(
        MortgageTitle $title,
        string $address,
        string $city,
        int $zip,
    ): array {
        return [
            'name' => 'Vermont',
            'validation' => [
                [
                    'name' => 'Mortgage (Lender or Broker)',
                    'key' => 'lender_broker',
                    'selection' => [
                        [
                            'full_title' => 'Lender',
                            'value' => 'Lender',
                            'checked' => $title === MortgageTitle::LENDER,
                        ],
                        [
                            'full_title' => 'Broker',
                            'value' => 'Broker',
                            'checked' => $title === MortgageTitle::BROKER,
                        ],
                    ],
                ],
                [
                    'name' => 'Branch Address',
                    'key' => 'branch_address',
                    'selection' => [
                        [
                            'full_title' => 'Address',
                            'value' => $address,
                        ],
                        [
                            'full_title' => 'City',
                            'value' => $city,
                        ],
                        [
                            'full_title' => 'Zip',
                            'value' => $zip,
                        ],
                    ],
                ],
            ],
            'disclaimer' => '',
        ];
    }

    public static function virginia(MortgageTitle $title): array
    {
        return [
            'name' => 'Virginia',
            'validation' => [
                [
                    'name' => 'Mortgage (Lender or Broker)',
                    'key' => 'lender_broker',
                    'selection' => [
                        [
                            'full_title' => 'Lender',
                            'value' => 'Lender',
                            'checked' => $title === MortgageTitle::LENDER,
                        ],
                        [
                            'full_title' => 'Broker',
                            'value' => 'Broker',
                            'checked' => $title === MortgageTitle::BROKER,
                        ],
                    ],
                ],
            ],
            'disclaimer' => '',
        ];
    }

    public static function wisconsin(MortgageTitle $title): array
    {
        return [
            'name' => 'Wisconsin',
            'validation' => [
                [
                    'name' => 'Mortgage (Banker or Broker)',
                    'key' => 'banker_broker',
                    'selection' => [
                        [
                            'full_title' => 'Banker',
                            'value' => 'Banker',
                            'checked' => $title === MortgageTitle::BANKER,
                        ],
                        [
                            'full_title' => 'Broker',
                            'value' => 'Broker',
                            'checked' => $title === MortgageTitle::BROKER,
                        ],
                    ],
                ],
            ],
            'disclaimer' => '',
        ];
    }
}
