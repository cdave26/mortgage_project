<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Uplist Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for Uplis services that will
    | be used in this application. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'app_name' => env('APP_NAME'),
    'app_env' => env('APP_ENV'),
    'client_app_url' => env('FRONTEND_URL'),
    'admin_email' => env('ADMIN_EMAIL'),
    'admin_name' => env('ADMIN_NAME'),
    'flyer_assets_url' => env('FLYER_ASSETS_URL'),

    /*
    |--------------------------------------------------------------------------
    | Expiration Minutes
    |--------------------------------------------------------------------------
    |
    | This value controls the number of minutes until an issued token will be
    | considered expired. If this value is null, personal access tokens do
    | not expire. This won't tweak the lifetime of first-party sessions.
    |
    */

    'expiration' => [
        'otp' => env('OTP_EXPIRATION', 5),
        'trust_this_device' => env('TRUST_THIS_DEVICE_EXPIRATION', 20160), // 14 days
    ],

];
