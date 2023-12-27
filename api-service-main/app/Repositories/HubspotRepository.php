<?php

namespace App\Repositories;

use Exception;
use HubSpot\Factory;
use HubSpot\Client\Crm\Contacts\ApiException;
use HubSpot\Client\Crm\Contacts\Model\SimplePublicObjectInput;
use HubSpot\Client\Crm\Companies\Model\SimplePublicObjectInput as CompanySimplePublicObjectInput;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class HubspotRepository
{
    /**
     * Hubspot client
     *
     * @var $client
     */
    protected $client;

    protected $companyProperties = [
        'name,
        domain,
        city,
        state,
        zip,
        address,
        address2,
        billing_type,
        is_paying_for_loan_officers,
        enterprise_max_users,
        phone,
        company_nmls_,
        pricing_engine,
        header_text_color,
        header_background_color,
        terms_of_service_url,
        privacy_policy_url,
        active_users,
        number_of_loan_officers,
        contract_expiration_date,
        renewal_date
    '];

    protected $contactProperties = ['
        firstname,
        lastname,
        email,
        jobtitle,
        mobilephone,
        nmls,
        pricing_engine,
        uplist_user_status,
        uplist_user_type_2_
    '];

    /**
     * HubspotRepository constructor.
     *
     */
    public function __construct()
    {
        $this->client = Factory::createWithAccessToken(config('services.hubspot.key'));
    }

    private function contactBasicApi()
    {
        return $this->client->crm()->contacts()->basicApi();
    }

    private function companyBasicApi()
    {
        return $this->client->crm()->companies()->basicApi();
    }

    private function getError($exception, $message): Exception
    {
        Log::error($exception);

        $message = $message ?? trans('messages.error.generic');
        throw new Exception($message, JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
    }

    public function getHubspotContactList($limit, $lastId)
    {
        try {
            $apiResponse = $this->contactBasicApi()->getPage($limit, $lastId, $this->contactProperties, false);
              
            return $apiResponse;
        } catch (ApiException $e) {
            return $this->getError(
                $e,
                trans('messages.error.api_db_not_found', [
                    'resource' => 'contact',
                ])
            );
        }
    }

    public function getHubspotContact($hubspotContactId)
    {
        try {
            $apiResponse = $this->contactBasicApi()->getById($hubspotContactId, $this->contactProperties, false);

            return $apiResponse;
        } catch (ApiException $e) {
            return $this->getError(
                $e,
                trans('messages.error.api_db_not_found', [
                    'resource' => 'contact',
                ])
            );
        }
    }

    public function createHubspotContact($data)
    {
        $simplePublicObjectInput = new SimplePublicObjectInput([
            'properties' => $data,
        ]);

        try {
            $apiResponse = $this->contactBasicApi()->create($simplePublicObjectInput);

            return $apiResponse;
        } catch (ApiException $e) {
            return $this->getError($e, null);
        }
    }

    public function updateHubspotContact($contactId, $data)
    {
        $simplePublicObjectInput = new SimplePublicObjectInput([
            'properties' => $data,
        ]);

        try {
            $apiResponse = $this->contactBasicApi()->update($contactId, $simplePublicObjectInput);

            return $apiResponse;
        } catch (ApiException $e) {
            return $this->getError($e, null);
        }
    }

    public function getHubspotCompanyList($limit, $lastId)
    {
        try {
            $apiResponse = $this->companyBasicApi()->getPage($limit, $lastId, $this->companyProperties, false);

            return $apiResponse;
        } catch (ApiException $e) {
            return $this->getError(
                $e,
                trans('messages.error.api_db_not_found', [
                    'resource' => 'company',
                ])
            );
        }
    }

    public function getHubspotCompany($hubspotCompanyId)
    {
        try {
            $apiResponse = $this->companyBasicApi()->getById($hubspotCompanyId, $this->companyProperties, false);

            return $apiResponse;
        } catch (ApiException $e) {
            return $this->getError(
                $e,
                trans('messages.error.api_db_not_found', [
                    'resource' => 'company',
                ])
            );
        }
    }

    /**
     * TODO: STILL NEED TO TEST
     */
    public function createHubspotCompany($data)
    {
        $simplePublicObjectInput = new CompanySimplePublicObjectInput([
            'properties' => $data,
        ]);

        try {
            $apiResponse = $this->companyBasicApi()->create($simplePublicObjectInput);

            return $apiResponse;
        } catch (ApiException $e) {
            return $this->getError($e, null);
        }
    }

    public function updateHubspotCompany($companyId, $data)
    {
        $simplePublicObjectInput = new CompanySimplePublicObjectInput([
            'properties' => $data,
        ]);

        try {
            $apiResponse = $this->companyBasicApi()->update($companyId, $simplePublicObjectInput);

            return $apiResponse;
        } catch (ApiException $e) {
            return $this->getError($e, null);
        }
    }

    // todo: not yet tested
    public function batchAssocationHubspotContactAndCompany($hubspotContactIds, $hubspotCompanyId)
    {
        $curl = curl_init();
        $inputs = [];

        foreach($hubspotContactIds as $hubspotContactId) {
            $inputs[] = [
                "from" => [
                    "id" => $hubspotContactId
                ],
                "to" => [
                    "id" => $hubspotCompanyId
                ],
                "types" => array([
                    "associationCategory" => "HUBSPOT_DEFINED",
                    "associationTypeId" => 1
                ]) 
            ];
        }

        $postFields = json_encode([ "inputs" => $inputs ]);

        curl_setopt_array($curl, array(
            CURLOPT_URL => "https://api.hubapi.com/crm/v4/associations/contact/company/batch/create",
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => "",
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => "POST",
            CURLOPT_POSTFIELDS => $postFields,
            CURLOPT_HTTPHEADER => array(
                "accept: application/json",
                "authorization: Bearer " . config('services.hubspot.key'),
                "content-type: application/json"
            ),
        ));

        $response = curl_exec($curl);
        $err = curl_error($curl);

        curl_close($curl);

        if ($err) {
            return $this->getError($err, null);
        } else {
            return ['success' => true, 'data' => json_decode($response)];
        }
    }

    public function associateHubspotContactAndCompany($hubspotContactId, $hubspotCompanyId)
    {
        $curl = curl_init();
        $baseUrl = "https://api.hubapi.com/crm/v4/objects/contact/";

        curl_setopt_array($curl, array(
            CURLOPT_URL => $baseUrl . $hubspotContactId . "/associations/company/" . $hubspotCompanyId,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => "",
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => "PUT",
            CURLOPT_POSTFIELDS => "[{\"associationCategory\":\"HUBSPOT_DEFINED\",\"associationTypeId\":1}]",
            CURLOPT_HTTPHEADER => array(
              "accept: application/json",
              "authorization: Bearer " . config('services.hubspot.key'),
              "content-type: application/json"
            ),
        ));

        $response = curl_exec($curl);
        $err = curl_error($curl);

        curl_close($curl);

        if ($err) {
            return $this->getError($err, null);
        } else {
            return ['success' => true, 'message' => json_decode($response)];
        }
    }

    public function updateHubspotContactCompanyAssociation($hubspotContactId, $oldHubspotCompanyId, $newHubspotCompanyId)
    {
        $curl = curl_init();
        $baseUrl = "https://api.hubapi.com/crm/v4/objects/contact/";

        // delete previous association
        $deleted = $this->deleteHubspotContactCompanyAssociation($hubspotContactId, $oldHubspotCompanyId);

        if(!$deleted['success']) {
            return ['success' => false, 'message' => $deleted['message']];
        }

        curl_setopt_array($curl, array(
            CURLOPT_URL => $baseUrl . $hubspotContactId . "/associations/company/" . $newHubspotCompanyId,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => "",
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => "PUT",
            CURLOPT_POSTFIELDS => "[{\"associationCategory\":\"HUBSPOT_DEFINED\",\"associationTypeId\":1}]",
            CURLOPT_HTTPHEADER => array(
              "accept: application/json",
              "authorization: Bearer " . config('services.hubspot.key'),
              "content-type: application/json"
            ),
        ));

        $response = curl_exec($curl);
        $err = curl_error($curl);

        curl_close($curl);

        if ($err) {
            return $this->getError($err, null);
        } else {
            return ['success' => true, 'message' => json_decode($response)];
        }
    }

    public function deleteHubspotContactCompanyAssociation($hubspotContactId, $hubspotCompanyId)
    {
        $curl = curl_init();
        $baseUrl = "https://api.hubapi.com/crm/v4/objects/contact/";

        curl_setopt_array($curl, array(
            CURLOPT_URL => $baseUrl . $hubspotContactId . "/associations/company/" . $hubspotCompanyId,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => "",
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => "DELETE",
            CURLOPT_HTTPHEADER => array(
              "accept: application/json",
              "authorization: Bearer " . config('services.hubspot.key'),
              "content-type: application/json"
            ),
        ));

        $response = curl_exec($curl);
        $err = curl_error($curl);

        curl_close($curl);

        if ($err) {
            return $this->getError($err, null);
        } else {
            return ['success' => true, 'message' => json_decode($response)];
        }
    }

}