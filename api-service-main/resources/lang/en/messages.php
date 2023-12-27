<?php

return [
    'success' => [
        'create' => 'The :resource was created.',
        'update' => 'The :resource was updated.',
        'delete' => 'The :resource has been deleted.',
        'archive' => 'The :resource has been archived.',
        'registration' => 'Congratulations! You are registered.',
        'email' => 'We sent you a verification email.',
        'generate' => 'The :resource has been generated.',
        'process' => 'The :resource was processed.',
        'verify' => 'Your email was verified.',
        'hubspot' => [
            'contact_verified' => 'You have been verified.',
            'company_verified' => 'Your company has been verified.',
        ],
        'dynamic' => ':beginning :resource :super :action',
    ],
    'error' => [
        'generic' => "We have encountered some issues upon processing your request. Please try again.",
        'email_taken' => 'The email was already taken.',
        'relationship' => [
            'update' => 'The :resource cannot be updated because it is associated with another record.',
            'delete' => 'The :resource cannot be deleted because it is associated with another record.',
        ],
        'not_found' => 'No :resource found.',
        'bad_request' => 'Bad Request.',
        'forbidden' => 'Forbidden.',
        'unauthorized' => 'Unauthorized.',
        'archived' => 'The :resource has been archived.',
        'is_active' => 'The :resource is already active.',
        'not_published' => 'The :resource is not yet published.',
        'invalid_url' => 'The URL is invalid.',
        'api_db_not_found' => "The :resource does not exist in Uplist's records or there might be other issues. Please contact your administrator.",
        'logo_not_found' => 'No company logo, please contact your company admin.',
        'optimal_blue' => [
            'default_strategy' => [
                'not_found' => 'No default strategy found. Please set a default strategy.',
            ],
            'strategy' => [
                'not_found' => 'No Strategy found. Please get latest strategies.',
            ],
        ],
        'hubspot' => [
            'invalid_billing_type' => "The 'Billing Type' property of this company  must be set to ':resource'. Please contact your administrator.",
            'is_paying_loan_officers' => "The 'Is company paying for Loan Officers' property of this company  must be set to 'Yes'. Please contact your administrator.",
            'property_not_found' => 'The :key has no :resource. Please contact your administrator.',
            'contact_already_used' => "Email address already exists. Please contact Uplist administrator.",
            'max_capacity' => 'The users have exceeded on the enterprise capacity. Please contact your administrator.',
            'failed_assoc' => 'The association between contact and company failed. Please contact your administrator.',
        ],
        'stripe' => [
            'session_expired' => 'Checkout session has expired.'
        ],
        'unauthenticated' => 'Your session has expired. Please sign in again to continue.',
        'email_not_found' => 'The email does not exist.',
        'exist' => 'The :resource already exists.',
        'required_field' => 'This field is required.',
        'max' => 'The :resource must not be greater than :max characters.',
        'valid_email' => 'The :resource must be a valid email address.',
        'user' => [
            'nmls_num' => 'The NMLS number must be a number.'
        ],
    ],
    'otp' => [
        'success' => 'Your One-Time Password (OTP) was sent.',
        'invalid' => 'Your One-Time Password (OTP) is invalid.',
        'expired' => 'Your One-Time Password (OTP) is expired.',
        'sms' => 'Do not disclose One-Time Password (OTP) to anyone. Your OTP is :code, It will expire in 5 minutes. If you did not request for an OTP, please call Uplist at :contact_number.',
    ],
    'get_payments' => [
        'no_results' => 'No results available for the selected options. You can try again using different options or contact us directly so we can help.',
        'higher_down_payment' => 'The down payment is higher than the pre-approved max down payment of :max_down_payment.',
        'higher_total_payment_and_hoa_dues' => 'The total payment + HOA dues is higher than the pre-approved max PITI of :max_qualifying_payment.',
    ],
    'loan_id' => [
        'invalid' => 'The Optimal Blue loan ID is invalid.',
        'state_license_not_exist' => [
            'title' => 'No license added for the selected Buyer',
            'message' => 'Please add a license for :state in My State Licenses page.',
        ],
    ],
    'resend_invitation_email' => [
        'success' => 'The invitation email has been sent.',
    ],
];
