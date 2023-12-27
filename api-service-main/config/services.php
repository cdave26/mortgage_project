<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'mailgun' => [
        'domain' => env('MAILGUN_DOMAIN'),
        'secret' => env('MAILGUN_SECRET'),
        'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
        'scheme' => 'https',
    ],

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'stripe' => [
        'key' => env('STRIPE_KEY'),
        'secret' => env('STRIPE_SECRET'),
        'version' => env('STRIPE_API_VERSION'),
    ],

    'sendgrid' => [
        'key' => env('SENDGRID_API_KEY'),
        'stripe_redirect_template' => env('SENDGRID_STRIPE_REDIRECT_TEMPLATE'),
        'welcome_template' => env('SENDGRID_WELCOME_TEMPLATE'),
        'success_checkout_template' => env('SENDGRID_SUCCESS_CHECKOUT_TEMPLATE'),
        'otp_template' => env('SENDGRID_OTP_TEMPLATE'),
        'verification_template' => env('SENDGRID_VERIFICATION_TEMPLATE'),
        'request_uplist_property' => env('SENDGRID_REQUEST_UPLIST_PROPERTY'),
        'loan_officer_company_change_notif' => env('SENDGRID_LO_CHANGE_COMPANY_NOTIF'),
        'borrower_invitation' => env('SENDGRID_BORROWER_INVITATION'),
        'buyers_pre_approval_request_letter' => env('SENDGRID_BUYERS_PRE_APPROVAL_REQUEST_LETTER'),
        'contact_request' => env('SENDGRID_CONTACT_REQUEST'),
        'admin_report_template' => env('SENDGRID_ADMIN_REPORT_TEMPLATE'),
        'default_company_logo' => env('SENDGRID_DEFAULT_COMPANY_LOGO'),
        'quick_quote_inquiry' => env('SENDGRID_QUICK_QUOTE_INQUIRY'),
        'agent_listing_notification' => env('SENDGRID_AGENT_LISTING_NOTIFICATION'),
        'agent_listing_inquiry' => env('SENDGRID_AGENT_LISTING_INQUIRY'),
    ],

    'hubspot' => [
        'key' => env('HUBSPOT_ACCESS_TOKEN'),
    ],

    'optimal_blue' => [
        'key' => env('OPTIMAL_BLUE_CLIENT_ID'),
        'secret' => env('OPTIMAL_BLUE_CLIENT_SECRET'),
        'grant_type' => env('OPTIMAL_BLUE_GRANT_TYPE'),
        'resource' => env('OPTIMAL_BLUE_RESOURCE'),
        'default_price' => env('OPTIMAL_BLUE_DEFAULT_PRICE'),
    ],

    'essent' => [
        'api_key' => env('ESSENT_API_KEY'),
    ],

    'messaging' => env('MESSAGING_SERVICE'),

    'twilio' => [
        'account_sid' => env('TWILIO_ACCOUNT_SID'),
        'auth_token' => env('TWILIO_AUTH_TOKEN'),
        'phone_number' => env('TWILIO_PHONE_NUMBER'),
    ],

    'aws' => [
        'key' => env('AWS_ACCESS_KEY'),
        'secret' => env('AWS_ACCESS_SECRET'),
        'region' => env('AWS_REGION'),
    ],

    'pdf_co' => [
        'api_key' => env('PDFCO_API_KEY'),
    ],

    'recaptcha' => [
        'secret' => env('RECAPTCHA_SECRET_KEY'),
    ],

];
