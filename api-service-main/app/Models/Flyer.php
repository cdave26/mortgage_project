<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Flyer extends Model
{
  use HasFactory;
  use SoftDeletes;

  protected $fillable = [
    'name',
    'image',
    'pdf_name',
    'type',
    'deleted_by',
  ];

  protected $with = [
    'user',
  ];

  public function user()
  {
    return $this->belongsTo(User::class);
  }
}
