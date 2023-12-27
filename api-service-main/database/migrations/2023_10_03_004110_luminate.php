<?php

use App\Helpers\UplistDataMigration;

return new class extends UplistDataMigration
{
    public function __construct()
    {
        $this->file = database_path('migrations/data/2023_10_03_004110_luminate.xlsx');

        $this->company = 'Luminate Home Loans, Inc.';

        $this->companiesEndRow = 4;

        $this->companyStateLicensesEndRow = 6;

        $this->usersEndRow = 5;

        $this->licensesEndRow = 7;

        $this->listingsEndRow = 5;
    }
};
