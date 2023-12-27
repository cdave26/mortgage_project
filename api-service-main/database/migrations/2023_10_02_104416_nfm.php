<?php

use App\Enums\MortgageStatus;
use App\Enums\MortgageTitle;
use App\Helpers\StateMetadata;
use App\Helpers\UplistDataMigration;
use App\Models\Company;
use App\Models\PricingEngine;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

return new class extends UplistDataMigration
{
    public function __construct()
    {
        $this->file = database_path('migrations/data/2023_10_02_104416_nfm.xlsx');

        $this->company = 'NFM, Inc.';

        $this->companiesEndRow = 4;

        $this->companyStateLicensesEndRow = 5;

        $this->usersEndRow = 7;

        $this->licensesEndRow = 6;

        $this->listingsEndRow = 49;
    }
};
