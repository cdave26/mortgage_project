<?php

namespace App\Models;

use App\Notifications\ResetPasswordNotification;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;
    use SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'employee_id',
        'first_name',
        'last_name',
        'email',
        'job_title',
        'username',
        'password',
        'mobile_number',
        'nmls_num',
        'url_identifier',
        'company_id',
        'user_type_id',
        'pricing_engine_id',
        'first_time_login',
        'last_time_login',
        'last_ip_login',
        'hubspot_contact_id',
        'deleted_by',
        'stripe_subscription_id',
        'stripe_customer_id',
        'stripe_invoice_status',
        'subscription_expired_at',
        'profile_logo',
        'custom_logo_flyers',
        'alternative_email',
        'iscomplete_onboarding',
        'user_status'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'last_time_login' => 'datetime',
    ];

    protected $with = [
        'userType',
        'company',
        'pricingEngine',
    ];

    public function userType()
    {
        return $this->belongsTo(UserType::class);
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function pricingEngine()
    {
        return $this->belongsTo(PricingEngine::class);
    }

    public function passwordOtps(): HasMany
    {
        return $this->hasMany(PasswordOtp::class);
    }

    public function sendPasswordResetNotification($token)
    {
        $this->notify(new ResetPasswordNotification($token));
    }

    public function listings(): HasMany
    {
        return $this->hasMany(Listing::class);
    }

    public function listingActivityLog()
    {
        return $this->belongsTo(listingActivityLog::class);
    }

    public function optimalBlueStrategy()
    {
        return $this->hasOne(OptimalBlueUserStrategy::class);
    }

    public function buyer(): HasOne
    {
        return $this->hasOne(Buyer::class, 'borrower_id');
    }

    public function getFullNameAttribute()
    {
        return "{$this->first_name} {$this->last_name}";
    }

    public function licenses(): HasMany
    {
        return $this->hasMany(License::class);
    }

    public function trustedDevices(): HasMany
    {
        return $this->hasMany(TrustedDevice::class);
    }

    public function userStatus(): BelongsTo
    {
        return $this->belongsTo(UserStatus::class, 'user_status');
    }

    public function generatedFlyers() : HasMany
    {
        return $this->hasMany(GeneratedFlyer::class);    
    }
}
