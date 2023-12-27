<?php

use App\Helpers\UplistDataMigration;

return new class extends UplistDataMigration
{
    public function __construct()
    {
        $this->file = database_path('migrations/data/2023_10_02_005912_revolution_mortgage.xlsx');

        $this->company = 'Revolution Mortgage';

        $this->companiesEndRow = 4;

        $this->companyStateLicensesEndRow = 47;

        $this->usersEndRow = 41;

        $this->licensesEndRow = 98;

        $this->listingsEndRow = 99;
    }
};
