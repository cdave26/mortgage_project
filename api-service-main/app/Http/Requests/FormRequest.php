<?php

namespace App\Http\Requests;

class FormRequest extends \Illuminate\Foundation\Http\FormRequest
{
    /**
     * Indicates whether validation should stop after the first rule failure.
     *
     * @var bool
     */
    protected $stopOnFirstFailure = true;
}
