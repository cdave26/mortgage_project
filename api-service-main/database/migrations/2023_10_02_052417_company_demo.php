<?php

use App\Helpers\UplistDataMigration;

return new class extends UplistDataMigration
{
    public function __construct()
    {
        $this->file = database_path('migrations/data/2023_10_02_052417_company_demo.xlsx');

        $this->company = 'Your Company';

        $this->companiesEndRow = 4;

        $this->companyStateLicensesEndRow = 20;

        $this->usersEndRow = 7;

        $this->licensesEndRow = 21;

        $this->listingsEndRow = 20;
    }
};
