<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class GeneratedFlyer extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'generated_flyers';

    protected $fillable = [
        'user_id',
        'flyer_id',
        'generated_flyer',
        'created_at',
        'deleted_by',
        'listing_id',
        'company_id',
    ];

    public function listing()
    {
        return $this->belongsTo(Listing::class, 'listing_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function flyer()
    {
        return $this->belongsTo(Flyer::class);
    }
}
