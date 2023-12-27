<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserType extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'name',
    ];

    const UPLIST_ADMIN = 'uplist_admin';
    const COMPANY_ADMIN = 'company_admin';
    const LOAN_OFFICER = 'loan_officer';

    public function users()
    {
        return $this->hasMany(User::class);
    }
}
