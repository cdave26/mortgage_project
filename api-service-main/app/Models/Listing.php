<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Listing extends Model
{
    use HasFactory;
    use SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'company_id',
        'sub_company_id',
        'user_license_id',
        'state_id',
        'county_id',
        'mls_number',
        'mls_link',
        'page_link',
        'page_design',
        'flyer_id',
        'listing_agent_name',
        'listing_agent_email',
        'property_address',
        'property_apt_suite',
        'property_city',
        'property_zip',
        'property_type',
        'units_count',
        'property_value',
        'seller_credits',
        'credit_verified_by',
        'default_down_payment',
        'loan_amount',
        'hoa_dues',
        'property_taxes',
        'homeowners_insurance',
        'usda_lookup',
        'fha_condo_lookup',
        'va_condo_lookup',
        'listing_status',
        'deleted_by',
        'pub_page_web_views'
    ];

    protected $casts = [
        'usda_lookup' => 'boolean',
        'va_condo_lookup' => 'boolean',
        'fha_condo_lookup' => 'boolean'
    ];

    public function license()
    {
        return $this->belongsTo(License::class, 'user_license_id');
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function subCompany()
    {
        return $this->belongsTo(Company::class, 'sub_company_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function state()
    {
        return $this->belongsTo(State::class);
    }

    public function county()
    {
        return $this->belongsTo(County::class);
    }

    public function flyer()
    {
        return $this->belongsTo(Flyer::class);
    }

    public function generatedFlyers()
    {
        return $this->hasMany(generatedFlyers::class);
    }

    public function propertyType()
    {
        return $this->belongsTo(PropertyType::class, 'property_type');
    }

    public function unitsCount()
    {
        return $this->belongsTo(Unit::class, 'units_count');
    }
}
