<?php

use App\Models\State;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        State::query()
            ->where(['name' => 'Texas'])
            ->update([
                "disclosure" => json_encode([
                    "default" => "Texas Mortgage {licensee_registrant} under NMLS ID number - {company_nmls_id}. {mlo_name} is licensed as a Mortgage Loan Originator under NMLS ID number - {mlo_nmls_id}.",
                    "additional" => "",
                ]),
            ]);
    }
};
