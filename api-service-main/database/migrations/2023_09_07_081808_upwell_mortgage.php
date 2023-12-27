<?php

use App\Helpers\UplistDataMigration;

return new class extends UplistDataMigration
{
    public function __construct()
    {
        $this->file = database_path('migrations/data/2023_09_07_081808_upwell_mortgage_hotfix.xlsx');

        $this->company = 'Upwell Mortgage, Inc.';

        $this->companiesEndRow = 4;

        $this->companyStateLicensesEndRow = 9;

        $this->usersEndRow = 12;

        $this->licensesEndRow = 21;

        $this->listingsEndRow = 51;
    }
};
