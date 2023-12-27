<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Amortization extends Model
{
    use HasFactory;

    /**
     * The name of the "updated at" column.
     *
     * @var string|null
     */
    const UPDATED_AT = null;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'model_type',
        'model_id',
        'search_id',
        'product_id',
        'quote_number',
        'loan_type',
        'lock_period',
        'interest_rate',
        'annual_percentage_rate',
        'monthly_principal_interest',
        'mortgage_insurance',
        'insurance',
        'total_payment',
    ];
}
