<?php

use App\Models\State;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $states = [
            [
              "name" => "Arizona",
              "disclosure" => json_encode([
                "default" => "Arizona Mortgage {banker_broker} Licensee under license number - {state_license_number} and NMLS ID number - {company_nmls_id}. Licensed to do business as {company_name} at {company_address}. {mlo_name} is licensed as a Mortgage Loan Originator under NMLS ID number - {mlo_nmls_id}.",
                "additional" => "",
              ]),
              "licensing_information" => json_encode([
                "default" => "Arizona Mortgage {banker_broker} Licensee under license number - {state_license_number}. Licensed to do business as {company_name} at {company_address}.",
                "additional" => "Arizona Lender registrant under registration number - {company_nmls_id}. Registered to do business as {company_name} at {company_address}.",
              ]),
            ],
            [
              "name" => "Arkansas",
              "disclosure" => json_encode([
                "default" => "Arkansas Mortgage {banker_broker_servicer} Licensee under NMLS ID number - {company_nmls_id}. {company_name} at {company_address} {company_mobile_number}. {mlo_name} is licensed as a Mortgage Loan Originator under NMLS ID number - {mlo_nmls_id}.",
                "additional" => "",
              ]),
              "licensing_information" => json_encode([
                "default" => "Arkansas Mortgage {banker_broker_servicer} Licensee under license number - {state_license_number}. {company_name} at {company_address} {company_mobile_number}.",
                "additional" => "",
              ]),
            ],
            [
              "name" => "Georgia",
              "disclosure" => json_encode([
                "default" => "Georgia Residential Mortgage Licensee to do business as a Mortgage {lender_broker} under {license_registration} number - {state_license_number} and NMLS ID number - {company_nmls_id}. Licensed to do business as {company_name}, {company_address}. {mlo_name} is licensed as a Mortgage Loan Originator under license number - {mlo_state_license_number} and NMLS ID number - {mlo_nmls_id} at {mlo_address}.",
                "additional" => "",
              ]),
              "licensing_information" => json_encode([
                "default" => "Georgia Residential Mortgage Licensee doing business as a Mortgage {lender_broker} under {license_registration} number - {state_license_number}. Licensed to do business as {company_name}, {company_address}.",
                "additional" => "",
              ]),
            ],
            [
              "name" => "New Jersey",
              "disclosure" => json_encode([
                "default" => "{mlo_name} is licensed as a Mortgage Loan Originator under NMLS ID number - {mlo_nmls_id}. {company_name} is a New Jersey {lender_broker_depository} {licensee_registrant} under NMLS ID number - {company_nmls_id}. {company_name} is {licensed_registered} by the New Jersey Department of Banking & Insurance.",
                "additional" => "",
              ]),
              "licensing_information" => json_encode([
                "default" => "New Jersey {lender_broker_depository} {licensee_registrant} under {license_registration} number - {state_license_number}. {company_name} is {licensed_registered} by the New Jersey Department of Banking & Insurance.",
                "additional" => "",
              ]),
            ],
            [
              "name" => "New York",
              "disclosure" => json_encode([
                "default" => "{mlo_name} is licensed as a Mortgage Loan Originator under NMLS ID number - {mlo_nmls_id}. New York Mortgage {banker_broker} {licensee_registrant} under {license_registration} - {state_license_number}, {company_name} {company_address}. {company_name} is a {banker_broker} - NYS Department of Financial Services.",
                "additional" => "",
              ]),
              "licensing_information" => json_encode([
                "default" => "New York Mortgage {banker_broker} {licensee_registrant} under {license_registration} - {state_license_number}, {company_name} {company_address}. {company_name} is a {banker_broker} - NYS Department of Financial Services. Note - if a banker refer to license if a broker refer to registration.",
                "additional" => "",
              ]),
            ],
            [
                "name" => "Texas",
                "licensing_information" => json_encode([
                  "default" => "Texas Mortgage {licensee_registrant} under {license_registration} number - {state_license_number}. See the Texas Complaints Notice below under “Additional State Specific Required Disclosures”.",
                  "additional" => "",
                ])
            ],
        ];

        foreach ($states as $state) {
            State::query()
                ->where(['name' => $state['name']])
                ->update($state);
        }        
    }
};
