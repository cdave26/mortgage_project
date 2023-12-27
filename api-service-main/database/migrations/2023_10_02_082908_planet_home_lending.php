<?php

use App\Helpers\UplistDataMigration;

return new class extends UplistDataMigration
{
    public function __construct()
    {
        $this->file = database_path('migrations/data/2023_10_02_082908_planet_home_lending.xlsx');

        $this->company = 'Planet Home Lending, LLC';

        $this->companiesEndRow = 4;

        $this->companyStateLicensesEndRow = 9;

        $this->usersEndRow = 7;

        $this->licensesEndRow = 14;

        $this->listingsEndRow = 75;
    }
};
