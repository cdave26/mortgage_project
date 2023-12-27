<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Buyer extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'veterans_affairs' => 'boolean',
        'first_time_home_buyers' => 'boolean',
        'self_employed' => 'boolean',
        'created_at' => 'datetime:Y-m-d H:i:s',
        'updated_at' => 'datetime:Y-m-d H:i:s',
        'deleted_at' => 'datetime:Y-m-d H:i:s',
    ];

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'loan_id',
        'borrower_id',
        'loan_officer_id',
        'borrower_address',
        'borrower_city',
        'borrower_state_id',
        'borrower_zip',
        'co_borrower_first_name',
        'co_borrower_last_name',
        'co_borrower_email',
        'agent_first_name',
        'agent_last_name',
        'agent_email',
        'property_type_id',
        'occupancy_type_id',
        'unit_id',
        'property_state_id',
        'property_county_id',
        'credit_score_range_id',
        'debt_to_income_ratio',
        'veterans_affairs',
        'purchase_price',
        'max_qualifying_payment',
        'max_down_payment',
        'first_time_home_buyers',
        'default_down_payment_type',
        'default_down_payment_value',
        'homeowners_insurance',
        'self_employed',
        'code',
    ];

    public function borrower(): BelongsTo
    {
        return $this->belongsTo(User::class, 'borrower_id');
    }

    public function loanOfficer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'loan_officer_id');
    }

    public function borrowerState(): BelongsTo
    {
        return $this->belongsTo(State::class, 'borrower_state_id');
    }

    public function propertyType(): BelongsTo
    {
        return $this->belongsTo(PropertyType::class);
    }

    public function occupancyType(): BelongsTo
    {
        return $this->belongsTo(OccupancyType::class);
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    public function propertyState(): BelongsTo
    {
        return $this->belongsTo(State::class, 'property_state_id');
    }

    public function propertyCounty(): BelongsTo
    {
        return $this->belongsTo(County::class, 'property_county_id');
    }

    public function creditScoreRange(): BelongsTo
    {
        return $this->belongsTo(CreditScoreRange::class);
    }

    public function preApprovalRequest(): HasOne
    {
        return $this->hasOne(BuyersPreApprovalRequest::class);
    }

    public function amortizations(): MorphMany
    {
        return $this->morphMany(Amortization::class, 'model');
    }
}
