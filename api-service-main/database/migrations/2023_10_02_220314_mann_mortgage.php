<?php

use App\Helpers\UplistDataMigration;

return new class extends UplistDataMigration
{
    public function __construct()
    {
        $this->file = database_path('migrations/data/2023_10_02_220314_mann_mortgage_hotfix.xlsx');

        $this->company = 'Mann Mortgage, LLC';

        $this->companiesEndRow = 4;

        $this->companyStateLicensesEndRow = 8;

        $this->usersEndRow = 16;

        $this->licensesEndRow = 20;

        $this->listingsEndRow = 125;
    }
};
