<?php

use App\Helpers\UplistDataMigration;

return new class extends UplistDataMigration
{
    public function __construct()
    {
        $this->file = database_path('migrations/data/2023_10_02_054401_demo.xlsx');

        $this->company = 'GO Mortgage';

        $this->companiesEndRow = 4;

        $this->companyStateLicensesEndRow = 7;

        $this->usersEndRow = 6;

        $this->licensesEndRow = 7;

        $this->listingsEndRow = 7;
    }
};
