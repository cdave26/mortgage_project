<?php

use App\Helpers\UplistDataMigration;

return new class extends UplistDataMigration
{
    public function __construct()
    {
        $this->file = database_path('migrations/data/2023_10_02_114359_momentum_loans.xlsx');

        $this->company = 'Momentum Home Loans';

        $this->companiesEndRow = 4;

        $this->companyStateLicensesEndRow = 16;

        $this->usersEndRow = 17;

        $this->licensesEndRow = 26;

        $this->listingsEndRow = 75;
    }
};
