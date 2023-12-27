<?php

use App\Helpers\UplistDataMigration;

return new class extends UplistDataMigration
{
    public function __construct()
    {
        $this->file = database_path('migrations/data/2023_10_02_025725_fairway_independent_mortgage_corporation.xlsx');

        $this->company = 'Fairway Independent Mortgage Corporation';

        $this->companiesEndRow = 4;

        $this->companyStateLicensesEndRow = 5;

        $this->usersEndRow = 7;

        $this->licensesEndRow = 7;

        $this->listingsEndRow = 9;
    }
};
