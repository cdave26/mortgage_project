<?php

use App\Helpers\UplistDataMigration;

return new class extends UplistDataMigration
{
    public function __construct()
    {
        $this->file = database_path('migrations/data/2023_10_02_032523_first_community_mortgage.xlsx');

        $this->company = 'First Community Mortgage, Inc.';

        $this->companiesEndRow = 4;

        $this->companyStateLicensesEndRow = 23;

        $this->usersEndRow = 4;

        $this->licensesEndRow = 4;

        $this->listingsEndRow = 4;
    }
};
