<?php

namespace App\Enums;

enum Hubspot: string
{
    const HUBSPOT_COMPANY_NMLS_NUM = 'company_nmls_';
    const HUBSPOT_COMPANY_BILLING_TYPE_ENTERPRISE = 'Enterprise';
    const HUBSPOT_COMPANY_BILLING_TYPE_INDIVIDUAL = 'Individual';
    const HUBSPOT_COMPANY_IS_PAYING_FOR_LO = 'is_paying_for_loan_officers';
    const HUBSPOT_COMPANY_CONTRACT_EXPIRY_DATE = 'contract_expiration_date';
    const HUBSPOT_COMPANY_RENEWAL_DATE = 'renewal_date';
    const HUBSPOT_COMPANY_PRIVACY_POLICY_URL = 'privacy_policy_url';
    const HUBSPOT_COMPANY_TERMS_OF_SERVICE_URL = 'terms_of_service_url';
    const HUBSPOT_COMPANY_PHONE = 'phone';

    const HUBSPOT_CONTACT_NMLS_PROPERTY = 'nmls';
    const HUBSPOT_CONTACT_JOB_TITLE_PROPERTY = 'jobtitle';
    const HUBSPOT_CONTACT_USER_TYPE = 'uplist_user_type_2_';
    const HUBSPOT_CONTACT_MOBILE_NUMBER_PROPERTY = 'mobilephone';
    const HUBSPOT_CONTACT_USER_STATUS_PROPERTY = 'uplist_user_status';

    const USER_TYPE_COMPANY_ADMIN = 'Company_Admin';
    const USER_TYPE_LOAN_OFFICER = 'Loan_Officer';
}
