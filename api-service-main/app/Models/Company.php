<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Company extends Model
{
    use HasFactory;
    use SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'code',
        'name',
        'has_company_msa',
        'address',
        'city',
        'state',
        'zip',
        'equal_housing',
        'company_logo',
        'header_background_color',
        'header_text_color',
        'listing_disclaimer',
        'is_enterprise',
        'enterprise_max_user',
        'hubspot_company_id',
        'company_privacy_policy_URL',
        'company_terms_of_tervice_URL',
        'company_nmls_number',
        'company_mobile_number',
        'additional_details',
        'pricing_engine_id',
        'expiration_date',
        'renewal_date',
        // 'allow_access_to_buyer_app', for future purpose
        'allow_loan_officer_to_upload_logo'
    ];

    protected $with = [
        'pricingEngine'
    ];

    public function pricingEngine()
    {
        return $this->belongsTo(PricingEngine::class);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function companyStateLicenses(): HasMany
    {
        return $this->hasMany(CompanyStateLicense::class);
    }

    public function listings()
    {
        return $this->hasMany(Listing::class);
    }
}
