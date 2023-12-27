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
            ->where(['name' => 'South Carolina'])
            ->update([
                "metadata" => json_encode([
                    "mortgage_lender_supervised" => [
                      "mortgage_lender_servicer" => ["full_title" => "Mortgage Lender/Servicer", "value" => "", "disclaimer" => ""],
                      "supervised_lender_company" => ["full_title" => "Supervised Lender Company", "value" => "", "disclaimer" => ""],
                      "mortage_broker" => ["full_title" => "Mortgage Broker", "value" => "", "disclaimer" => ""]
                    ]
                ])
            ]);
    }
};
