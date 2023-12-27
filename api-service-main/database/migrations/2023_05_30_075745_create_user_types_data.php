<?php

use App\Models\UserType;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        UserType::insert([
            [ 'name' => 'uplist_admin' ],
            [ 'name' => 'company_admin' ],
            [ 'name' => 'loan_officer' ],
            [ 'name' => 'buyer' ]
        ]);
    }
};
