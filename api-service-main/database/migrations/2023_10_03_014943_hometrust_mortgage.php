<?php

use App\Helpers\UplistDataMigration;

return new class extends UplistDataMigration
{
    public function __construct()
    {
        $this->file = database_path('migrations/data/2023_10_03_014943_hometrust_mortgage.xlsx');

        $this->company = 'Hometrust Mortgage Company';

        $this->companiesEndRow = 4;

        $this->companyStateLicensesEndRow = 10;

        $this->usersEndRow = 7;

        $this->licensesEndRow = 12;

        $this->listingsEndRow = 17;
    }
};
