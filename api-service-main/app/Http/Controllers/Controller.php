<?php

namespace App\Http\Controllers;

use App\Enums\Hubspot;
use App\Models\Company;
use App\Models\PricingEngine;
use Carbon\Carbon;
use Exception;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller as BaseController;

class Controller extends BaseController
{
    use AuthorizesRequests, ValidatesRequests;

    /**
     * Return success response with the data
     *
     * @param $data
     * @param int $code
     * @return \Illuminate\Http\JsonResponse
     */
    public function success($data, $code = 200): JsonResponse
    {
        return response()->json($data, $code);
    }

    /**
     * Return failed response with the message
     *
     * @param $data
     * @param $code
     * @return \Illuminate\Http\JsonResponse
     */
    public function error($data, $code): JsonResponse
    {
        // check if error code is 0 or string
        if(($code === 0 || is_string($code))) {
            $code = JsonResponse::HTTP_UNPROCESSABLE_ENTITY;
            $data['message'] = trans('messages.error.generic');
        }

        return response()->json($data, $code);
    }

    /**
     * Checks if the required columns in uplist DB is available in Hubspot's contact
     * 
     * @return Exception
     */
    public function checkHubspotContactProperties($hubspotContact)
    {
        $hubspotProperties = [
            'email',
            // Hubspot::HUBSPOT_CONTACT_MOBILE_NUMBER_PROPERTY,
            // Hubspot::HUBSPOT_CONTACT_NMLS_PROPERTY,
            // Hubspot::HUBSPOT_CONTACT_JOB_TITLE_PROPERTY,
            Hubspot::HUBSPOT_CONTACT_USER_TYPE,
            Hubspot::HUBSPOT_CONTACT_USER_STATUS_PROPERTY,
        ];

        $fields = [
            'email' => 'email address',
            // Hubspot::HUBSPOT_CONTACT_MOBILE_NUMBER_PROPERTY => 'Phone Number',
            // Hubspot::HUBSPOT_CONTACT_NMLS_PROPERTY => 'NMLS#',
            // Hubspot::HUBSPOT_CONTACT_JOB_TITLE_PROPERTY => 'Job Title',
            Hubspot::HUBSPOT_CONTACT_USER_TYPE => 'user type',
            Hubspot::HUBSPOT_CONTACT_USER_STATUS_PROPERTY => 'user status',
        ];

        foreach($hubspotProperties as $key) {
            $checker = check_if_has_array_key($hubspotContact['properties'], $key, null);
            if(!$checker) {
                throw new Exception(
                    trans('messages.error.hubspot.property_not_found', [
                        'key' => 'contact',
                        'resource' => $fields[$key],
                    ]),
                    JsonResponse::HTTP_UNPROCESSABLE_ENTITY
                );
            }
        }
    }

    /**
     * Checks if the required columns in uplist DB is available in Hubspot's contact
     * 
     * @return Exception
     */
    public function checkHubspotCompanyProperties($hubspotCompany)
    {
        $hubspotProperties = [
            Hubspot::HUBSPOT_COMPANY_PRIVACY_POLICY_URL,
            Hubspot::HUBSPOT_COMPANY_PHONE,
            'address',
            'city',
            'state',
            'zip',
            Hubspot::HUBSPOT_COMPANY_NMLS_NUM
        ];

        $fields = [
            Hubspot::HUBSPOT_COMPANY_PRIVACY_POLICY_URL => 'privacy policy URL',
            Hubspot::HUBSPOT_COMPANY_PHONE => 'company mobile number',
            'address' => 'address',
            'city' => 'city',
            'state' => 'state',
            'zip' => 'zip',
            Hubspot::HUBSPOT_COMPANY_NMLS_NUM => 'company NMLS#'
        ];

        foreach($hubspotProperties as $key) {
            $checker = check_if_has_array_key($hubspotCompany['properties'], $key, null);
            if(!$checker) {
                throw new Exception(
                    trans('messages.error.hubspot.property_not_found', [
                        'key' => 'company',
                        'resource' => $fields[$key],
                    ]),
                    JsonResponse::HTTP_UNPROCESSABLE_ENTITY
                );
            }
        }
    }

    /**
     * Check company if existed on Uplist Company DB. Create record if none
     * 
     * @param Array $company
     * @param String $hubspotCompanyId
     * 
     * @return App\Models\Company
     */
    public function createCompany($company, $hubspotCompanyId)
    {
        $this->checkHubspotCompanyProperties($company);

        // check if the properties are available or not
        $billingType = check_if_has_array_key($company['properties'], 'billing_type', Hubspot::HUBSPOT_COMPANY_BILLING_TYPE_INDIVIDUAL);
        $maxEnterpriseUsers = check_if_has_array_key($company['properties'], 'enterprise_max_users', 0);
        $hubspotContactPricingEngine = check_if_has_array_key($company['properties'], 'pricing_engine', "Optimal Blue");
        $hubspotCompanyBackgroundColor = check_if_has_array_key($company['properties'], 'header_background_color', "#0662C7");
        $hubspotCompanytextColor = check_if_has_array_key($company['properties'], 'header_text_color', "#fff");
        $hubspotCompanyTOS = check_if_has_array_key($company['properties'], Hubspot::HUBSPOT_COMPANY_TERMS_OF_SERVICE_URL, null);
        $hubspotCompanyPhone = $company['properties'][Hubspot::HUBSPOT_COMPANY_PHONE];

        $uplistPricingEngine = PricingEngine::query()->where('name', $hubspotContactPricingEngine)->first();
        $companyDetails = Company::firstOrCreate(
            ['hubspot_company_id' => $hubspotCompanyId],
            [
                'name' => $company['properties']['name'],
                'address' => $company['properties']['address'],
                'city' => $company['properties']['city'],
                'state' => $company['properties']['state'],
                'zip' => $company['properties']['zip'],
                'is_enterprise' => $billingType === Hubspot::HUBSPOT_COMPANY_BILLING_TYPE_ENTERPRISE,
                'enterprise_max_user' => $maxEnterpriseUsers,
                'hubspot_company_id' => $hubspotCompanyId,
                'company_nmls_number' => $company['properties'][Hubspot::HUBSPOT_COMPANY_NMLS_NUM],
                'header_background_color' => $hubspotCompanyBackgroundColor,
                'header_text_color' => $hubspotCompanytextColor,
                'company_privacy_policy_URL' => $company['properties'][Hubspot::HUBSPOT_COMPANY_PRIVACY_POLICY_URL],
                'company_terms_of_tervice_URL' => $hubspotCompanyTOS,
                'pricing_engine_id' => $uplistPricingEngine->id,
                'company_mobile_number' => format_phone_number($hubspotCompanyPhone),
            ]
        );

        return $companyDetails;
    }

    public function getSubscriptionExpirationData()
    {
        // check if the current day false on the start of month
        if (Carbon::now()->equalTo(Carbon::now()->startOfMonth())) {
            return Carbon::now()->addYear()->subMonth()->lastOfMonth();
        }

        return Carbon::now()->addYear()->lastOfMonth();
    }
}
