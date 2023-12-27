<?php

use App\Helpers\UplistDataMigration;

return new class extends UplistDataMigration
{
    public function __construct()
    {
        $this->file = database_path('migrations/data/2023_10_02_022659_direct_mortgage_loans.xlsx');

        $this->company = 'Direct Mortgage Loans, LLC';

        $this->companiesEndRow = 4;

        $this->companyStateLicensesEndRow = 4;

        $this->usersEndRow = 6;

        $this->licensesEndRow = 5;

        $this->listingsEndRow = 25;
    }
};
