<?php

use App\Helpers\UplistDataMigration;

return new class extends UplistDataMigration
{
    public function __construct()
    {
        $this->file = database_path('migrations/data/2023_10_02_034936_first_financial_mortgage.xlsx');

        $this->company = 'First Financial Mortgage';

        $this->companiesEndRow = 4;

        $this->companyStateLicensesEndRow = 4;

        $this->usersEndRow = 11;

        $this->licensesEndRow = 11;

        $this->listingsEndRow = 33;
    }
};
