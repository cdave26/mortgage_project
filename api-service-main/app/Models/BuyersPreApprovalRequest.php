<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BuyersPreApprovalRequest extends Model
{
    use HasFactory;

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'veterans_affairs_approved' => 'boolean',
        'first_time_home_buyers_approved' => 'boolean',
        'created_at' => 'datetime:Y-m-d H:i:s',
        'updated_at' => 'datetime:Y-m-d H:i:s',
    ];

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'buyer_id',
        'price',
        'down_payment_type',
        'down_payment',
        'loan_amount',
        'tax',
        'seller_credit',
        'homeowners_association_fee',
        'veterans_affairs_approved',
        'first_time_home_buyers_approved',
        'address',
        'city',
        'zip',
        'property_type_id',
        'county_id',
        'occupancy_type_id',
        'credit_score_range_id',
        'veterans_affairs',
    ];

    public function buyer(): BelongsTo
    {
        return $this->belongsTo(Buyer::class);
    }

    public function county(): BelongsTo
    {
        return $this->belongsTo(County::class);
    }

    public function propertyType(): BelongsTo
    {
        return $this->belongsTo(PropertyType::class);
    }

    public function occupancyType(): BelongsTo
    {
        return $this->belongsTo(OccupancyType::class);
    }

    public function creditScoreRange(): BelongsTo
    {
        return $this->belongsTo(CreditScoreRange::class);
    }
}
