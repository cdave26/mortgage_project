<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array<int, string>
     */
    protected $except = [
        'stripe/*',
        'http://localhost:3000',
        'https://stg.uplist.lanexus.com:3000',
        'api/forgot-password',
        'api/login',
    ];
}
