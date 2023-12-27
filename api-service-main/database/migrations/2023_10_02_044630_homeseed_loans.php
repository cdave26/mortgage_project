<?php

use App\Helpers\UplistDataMigration;

return new class extends UplistDataMigration
{
    public function __construct()
    {
        $this->file = database_path('migrations/data/2023_10_02_044630_homeseed_loans.xlsx');

        $this->company = 'Homeseed Loans, a division of Mann Mortgage, LLC';

        $this->companiesEndRow = 4;

        $this->companyStateLicensesEndRow = 4;

        $this->usersEndRow = 5;

        $this->licensesEndRow = 4;

        $this->listingsEndRow = 41;
    }
};
