<?php

use App\Models\PricingEngine;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $pricingEngines = [
            [
                'name' => 'Optimal Blue'
            ],
            [
                'name' => 'EPPS'
            ],
            [
                'name' => 'Lender Price'
            ],
            [
                'name' => 'Loan Sifter'
            ],
            [
                'name' => 'Mortech'
            ],
            [
                'name' => 'Open Close'
            ],
            [
                'name' => 'Polly'
            ],
            [
                'name' => 'Other'
            ],
        ];

        PricingEngine::insert($pricingEngines);
    }
};
