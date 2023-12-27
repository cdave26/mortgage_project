<?php

use App\Helpers\UplistDataMigration;

return new class extends UplistDataMigration
{
    public function __construct()
    {
        $this->file = database_path('migrations/data/2023_10_03_012002_lennar_mortgage.xlsx');

        $this->company = 'Lennar Mortgage';

        $this->companiesEndRow = 4;

        $this->companyStateLicensesEndRow = 4;

        $this->usersEndRow = 4;

        $this->licensesEndRow = 4;

        $this->listingsEndRow = 4;
    }
};
