<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string, JSON>
     */
    protected $fillable = [
        'user_id',
        'model_name',
        'model_id',
        'column_name',
        'listing_id',
        'operation',
        'original_data',
        'updated_data'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
