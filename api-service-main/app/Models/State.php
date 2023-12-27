<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class State extends Model
{
    use HasFactory;
    protected $appends = ['full_state'];

    protected $fillable = [
        'name',
        'abbreviation',
        'default_disclaimer',
        'metadata'
    ];

    protected $casts = [
        'metadata' => 'array'
    ];

    public function licenses()
    {
        return $this->hasMany(License::class);
    }

    public function counties()
    {
        return $this->hasMany(County::class);
    }

    public function listings()
    {
        return $this->hasMany(Listing::class);
    }

    /**
     * transform state name with abbreviation
     *
     * @param  string  $value
     * @return string
     */
    public function getFullStateAttribute()
    {
        return $this->abbreviation . ' - ' . $this->name;
    }

    public function companyStateLicense(): HasOne
    {
        return $this->hasOne(CompanyStateLicense::class);
    }
}
