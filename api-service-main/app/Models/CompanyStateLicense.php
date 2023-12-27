<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CompanyStateLicense extends Model
{
    use HasFactory;
    use SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string, JSON>
     */

    protected $fillable = [
        'company_id',
        'has_company_msa',
        'state_id',
        'state_metadata',
        'license',
        'deleted_at',
        'deleted_by',

    ];

    protected $casts = [
        'state_metadata' => 'array'
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function state()
    {
        return $this->belongsTo(State::class);
    }
}
