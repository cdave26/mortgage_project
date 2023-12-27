<?php

use App\Models\State;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $defaultDisclosure = "{mlo_name} is licensed as a Mortgage Loan Originator by the state of {state_name} under NMLS ID number - {mlo_nmls_id}.";
        
        $states = [
            [
              "name" => "Alabama",
              "abbreviation" => "AL",
              "disclosure" => json_encode([
                "default" => $defaultDisclosure,
                "additional" => "",
              ]),
              "licensing_information" => json_encode([
                "default" => "Alabama {licensee_broker} Licensee under license number - {state_license_number}.",
                "additional" => "",
              ]),
              "additional_required_disclosures" => null,
              "metadata" => null
            ],
            [
              "name" => "Alaska",
              "abbreviation" => "AK",
              "disclosure" => json_encode([
                "default" => $defaultDisclosure,
                "additional" => "",
              ]),
              "licensing_information" => json_encode([
                "default" => "Alaska {lender_broker} Licensee under license number - {state_license_number}.",
                "additional" => "Alaska Lender under registration number - {company_nmls_id}.",
              ]),
              "additional_required_disclosures" => null,
              "metadata" => null
            ],
            [
              "name" => "Arizona",
              "abbreviation" => "AZ",
              "disclosure" => json_encode([
                "default" => "Arizona {banker_broker} Licensee under license number - {state_license_number} and NMLS ID number - {company_nmls_id}. Licensed to do business as {company_name} at {company_address}. {mlo_name} is licensed as a Mortgage Loan Originator under NMLS ID number - {mlo_nmls_id}.",
                "additional" => "",
              ]),
              "licensing_information" => json_encode([
                "default" => "Arizona {banker_broker} Licensee under license number - {state_license_number}. Licensed to do business as {company_name} at {company_address}.",
                "additional" => "Arizona Lender registrant under registration number - {company_nmls_id}. Registered to do business as {company_name} at {company_address}.",
              ]),
              "additional_required_disclosures" => null,
              "metadata" => json_encode([
                "mortgage_banker_broker" => [
                  "banker" => ["full_title" => "Banker", "value" => "", "disclaimer" => ""],
                  "broker" => ["full_title" => "Broker", "value" => "", "disclaimer" => ""],
                ],
                "branch_address" => [
                  "branch_address" => ["full_title" => "Branch Address", "value" => "", "disclaimer" => ""],
                  "branch_city" => ["full_title" => "City", "value" => "", "disclaimer" => ""],
                  "branch_zip" => ["full_title" => "Zip", "value" => "", "disclaimer" => ""]
                ]
              ]),
            ],
            [
              "name" => "Arkansas",
              "abbreviation" => "AR",
              "disclosure" => json_encode([
                "default" => "Arkansas {banker_broker_servicer} Licensee under NMLS ID number - {company_nmls_id}. {company_name} at {company_address} {company_mobile_number}. {mlo_name} is licensed as a Mortgage Loan Originator under NMLS ID number - {mlo_nmls_id}.",
                "additional" => "",
              ]),
              "licensing_information" => json_encode([
                "default" => "Arkansas {banker_broker_servicer} Licensee under license number - {state_license_number}. {company_name} at {company_address} {company_mobile_number}.",
                "additional" => "",
              ]),
              "additional_required_disclosures" => null,
              "metadata" => json_encode([
                "mortgage_banker_broker_servicer" => [
                  "banker" => ["full_title" => "Banker", "value" => "", "disclaimer" => ""],
                  "broker" => ["full_title" => "Broker", "value" => "", "disclaimer" => ""],
                  "banker_broker_servicer" => ["full_title" => "Banker, Broker, and Servicer", "value" => "", "disclaimer" => ""]
                ],
                "branch_address" => [
                  "branch_address" => ["full_title" => "Branch Address", "value" => "", "disclaimer" => ""],
                  "branch_city" => ["full_title" => "City", "value" => "", "disclaimer" => ""],
                  "branch_zip" => ["full_title" => "Zip", "value" => "", "disclaimer" => ""]
                ]
              ])
            ],
            [
              "name" => "California",
              "abbreviation" => "CA",
              "disclosure" => json_encode([
                "default" => "California: Licensed by the {department_choice} under NMLS ID number - {company_nmls_id}. {mlo_name} is licensed as a Mortgage Loan Originator under NMLS ID number - {mlo_nmls_id}",
                "additional" => "",
              ]),
              "licensing_information" => json_encode([
                "default" => "California: Licensed by the {department_choice} under state license number - {state_license_number}.",
                "additional" => "",
              ]),
              "additional_required_disclosures" => null,
              "metadata" => json_encode([
                "financial_california_law" => [
                  "full_title" => "Financial Protection and Innovation under the California Financing Law",
                  "value" => "",
                  "disclaimer" => ""
                ],
                "mortgage_lending_act" => [
                  "full_title" => "Financial Protection and Innovation under the California Residential Mortgage Lending Act",
                  "value" => "",
                  "disclaimer" => ""
                ],
                "dept_real_estate" => [
                  "full_title" => "Real Estate under the Department of Real Estate",
                  "value" => "",
                  "disclaimer" => ""
                ],
              ])
            ],
            [
              "name" => "Colorado",
              "abbreviation" => "CO",
              "disclosure" => json_encode([
                "default" => "{company_name} has a Colorado Mortgage Company Registration and is regulated by the Division of Real Estate. {mlo_name} is a Mortgage Loan Originator under NMLS ID Number - {mlo_nmls_id} {company_mlo_mobile}",
                "additional" => "",
              ]),
              "licensing_information" => json_encode([
                "default" => "Colorado Mortgage Company Registration and Regulated by the Division of Real Estate.",
                "additional" => "",
              ]),
              "additional_required_disclosures" => null,
              "metadata" => null
            ],
            [
              "name" => "Connecticut",
              "abbreviation" => "CT",
              "disclosure" => json_encode([
                "default" => "Connecticut Mortgage {lender_broker} Licensee under license number - {state_license_number}.",
                "additional" => "MORTGAGE BROKER ONLY, NOT A MORTGAGE LENDER OR CORRESPONDENT LENDER.",
              ]),
              "licensing_information" => json_encode([
                "default" => "Connecticut Mortgage {lender_broker} Licensee under license number - {state_license_number}.",
                "additional" => "",
              ]),
              "additional_required_disclosures" => null,
              "metadata" => json_encode([
                "mortgage_lender_broker" => [
                  "lender" => ["full_title" => "Lender", "value" => "", "disclaimer" => ""],
                  "broker" => ["full_title" => "Broker", "value" => "", "disclaimer" => ""],
                ],
                
              ])
            ],
            [
              "name" => "Delaware",
              "abbreviation" => "DE",
              "disclosure" => json_encode([
                "default" => "Delaware Licensed {lender_broker} under NMLS ID number - {company_nmls_id}. {company_name} is licensed by the Delaware State Bank Commissioner to engage in business in this State. {mlo_name} is licensed as a Mortgage Loan Originator under NMLS ID number - {mlo_nmls_id}.",
                "additional" => "",
              ]),
              "licensing_information" => json_encode([
                "default" => "Delaware Licensed {lender_broker} under license number - {state_license_number}. {company_name} is licensed by the Delaware State Bank Commissioner to engage in business in this State.",
                "additional" => "",
              ]),
              "additional_required_disclosures" => null,
              "metadata" => json_encode([
                "mortgage_lender_broker" => [
                  "lender" => ["full_title" => "Lender", "value" => "", "disclaimer" => ""],
                  "broker" => ["full_title" => "Broker", "value" => "", "disclaimer" => ""],
                ],
                
              ])
            ],
            [
              "name" => "District Of Columbia",
              "abbreviation" => "DC",
              "disclosure" => json_encode([
                "default" => $defaultDisclosure,
                "additional" => "",
              ]),
              "licensing_information" => json_encode([
                "default" => "District of Columbia Licensed {lender_broker_dual} under license number - {state_license_number}. ",
                "additional" => "",
              ]),
              "additional_required_disclosures" => null,
              "metadata" => null
            ],
            [
              "name" => "Florida",
              "abbreviation" => "FL",
              "disclosure" => json_encode([
                "default" => $defaultDisclosure,
                "additional" => "",
              ]),
              "licensing_information" => json_encode([
                "default" => "Florida Mortgage {lender_broker} Licensee under license number - {state_license_number}.",
                "additional" => "",
              ]),
              "additional_required_disclosures" => null,
              "metadata" => null
            ],
            [
              "name" => "Georgia",
              "abbreviation" => "GA",
              "disclosure" => json_encode([
                "default" => "Georgia Residential Mortgage Licensee to do business as a {lender_broker} under {licensee_registration_number} number - {state_license_number} and NMLS ID number - {company_nmls_id}. Licensed to do business as {company_name}, {company_address}. {mlo_name} is licensed as a Mortgage Loan Originator under license number - {mlo_state_license_number} and NMLS ID number - {mlo_nmls_id} at {mlo_address}.",
                "additional" => "",
              ]),
              "licensing_information" => json_encode([
                "default" => "Georgia Residential Mortgage Licensee doing business as a {lender_broker} under {licensee_registration_number} number - {state_license_number}. Licensed to do business as {company_name}, {company_address}.",
                "additional" => "",
              ]),
              "additional_required_disclosures" => null,
              "metadata" => json_encode([
                "mortgage_lender_broker" => [
                  "lender" => ["full_title" => "Lender", "value" => "", "disclaimer" => ""],
                  "broker" => ["full_title" => "Broker", "value" => "", "disclaimer" => ""],
                ],
                "licensee_registrant" => [
                  "licensee" => ["full_title" => "Licensee", "value" => "", "disclaimer" => ""],
                  "registrant" => ["full_title" => "Registrant", "value" => "", "disclaimer" => ""],
                ],
                "branch_address" => [
                  "branch_address" => ["full_title" => "Branch Address", "value" => "", "disclaimer" => ""],
                  "branch_city" => ["full_title" => "City", "value" => "", "disclaimer" => ""],
                  "branch_zip" => ["full_title" => "Zip", "value" => "", "disclaimer" => ""]
                ],
              ]),
            ],
            [
              "name" => "Hawaii",
              "abbreviation" => "HI",
              "disclosure" => json_encode([
                "default" => $defaultDisclosure,
                "additional" => "",
              ]),
              "licensing_information" => json_encode([
                "default" => "Hawaii {company_name} under license number - {state_license_number}. ",
                "additional" => "",
              ]),
              "additional_required_disclosures" => null,
              "metadata" => null
            ],
            [
              "name" => "Idaho",
              "abbreviation" => "ID",
              "disclosure" => json_encode([
                "default" => $defaultDisclosure,
                "additional" => "",
              ]),
              "licensing_information" => json_encode([
                "default" => "Idaho {lender_broker} Licensee under license number - {state_license_number}. Licensed to do business as {company_name}.",
                "additional" => "",
              ]),
              "additional_required_disclosures" => null,
              "metadata" => null
            ],
            [
              "name" => "Illinois",
              "abbreviation" => "IL",
              "disclosure" => json_encode([
                "default" => "Illinois Residential Mortgage Licensee under NMLS ID number - {company_nmls_id}. {mlo_name} is licensed as a Mortgage Loan Originator under NMLS ID number - {mlo_nmls_id}.",
                "additional" => "",
              ]),
              "licensing_information" => json_encode([
                "default" => "Illinois Residential Mortgage Licensee under license number - {state_license_number}. See additional disclosure regarding the IL Community Reinvestment Act below under “Additional State Specific Required Disclosures”.",
                "additional" => "",
              ]),
              "additional_required_disclosures" => json_encode([
                "default" => "STATE OF ILLINOIS COMMUNITY REINVESTMENT NOTICE\n
                The Department of Financial and Professional Regulation (Department) evaluates our performance in meeting the financial services needs of this community, including the needs of low-income to moderate-income households. The Department takes this evaluation into account when deciding on certain applications submitted by us for approval by the Department. Your involvement is encouraged. You may obtain a copy of our evaluation. You may also submit signed, written comments about our performance in meeting community financial services needs to the Department.\n\n
                
                Illinois Department of Financial and Professional Regulations\n
                James R. Thompson Center\n
                DFPR-Residential Mortgage Banking\n
                100 W. Randolph, 9th Floor\n
                Chicago, Illinois 60601\n
                (844) 768-1713\n
                License #: {state_license_number}
                ",
                "additional" => ""
              ]),
              "metadata" => null
            ],
            [
              "name" => "Indiana",
              "abbreviation" => "IN",
              "disclosure" => json_encode([
                "default" => $defaultDisclosure,
                "additional" => "",
              ]),
              "licensing_information" => json_encode([
                "default" => "Indiana {lender_broker} Licensee under the {dfi_secstate} under license number - {state_license_number}.",
                "additional" => "",
              ]),
              "additional_required_disclosures" => null,
              "metadata" => null
            ],
            [
              "name" => "Iowa",
              "abbreviation" => "IA",
              "disclosure" => json_encode([
                "default" => $defaultDisclosure,
                "additional" => "",
              ]),
              "licensing_information" => json_encode([
                "default" => "Iowa {banker_registrant_broker_mlc} {licensee_registrant} under license number - {state_license_number}.",
                "additional" => "",
              ]),
              "additional_required_disclosures" => null,
              "metadata" => null
            ],
            [
              "name" => "Kansas",
              "abbreviation" => "KS",
              "disclosure" => json_encode([
                "default" => $defaultDisclosure,
                "additional" => "",
              ]),
              "licensing_information" => json_encode([
                "default" => json_encode([
                  "default" => "Kansas {mc_sl} Licensee under license number - {state_license_number}. ",
                  "additional" => "Kansas Mortgage Company Licensee under license number - {state_license_number} and a Supervised Loan Licensee under license number - {state_license_number}. ",
                ]),
                "additional" => "",
              ]),
              "additional_required_disclosures" => null,
              "metadata" => null
            ],
            [
              "name" => "Kentucky",
              "abbreviation" => "KY",
              "disclosure" => json_encode([
                "default" => $defaultDisclosure,
                "additional" => "",
              ]),
              "licensing_information" => json_encode([
                "default" => "Kentucky Mortgage {company_banker} Licensee under license number - {state_license_number}.",
                "additional" => "",
              ]),
              "additional_required_disclosures" => null,
              "metadata" => null
            ],
            [
              "name" => "Louisiana",
              "abbreviation" => "LA",
              "disclosure" => json_encode([
                "default" => $defaultDisclosure,
                "additional" => "",
              ]),
              "licensing_information" => json_encode([
                "default" => "Louisiana {mortgage_lending_licensed_lender} Licensee.",
                "additional" => "",
              ]),
              "additional_required_disclosures" => null,
              "metadata" => null
            ],
            [
              "name" => "Maine",
              "abbreviation" => "ME",
              "disclosure" => json_encode([
                "default" => $defaultDisclosure,
                "additional" => "",
              ]),
              "licensing_information" => json_encode([
                "default" => "Maine {lender_broker} Licensee under license number - {state_license_number}.",
                "additional" => "",
              ]),
              "additional_required_disclosures" => null,
              "metadata" => null
            ],
            [
              "name" => "Maryland",
              "abbreviation" => "MD",
              "disclosure" => json_encode([
                "default" => "{mlo_name} is licensed as a Mortgage Loan Originator by the state of Maryland under NMLS ID number - {mlo_nmls_id}. Doing business as {company_name}.",
                "additional" => "",
              ]),
              "licensing_information" => json_encode([
                "default" => "Maryland {lender_consumer_loan} Licensee under license number - {state_license_number}. Doing business as {company_name} is located at {company_address}.",
                "additional" => "",
              ]),
              "additional_required_disclosures" => null,
              "metadata" => null
            ],
            [
              "name" => "Massachusetts",
              "abbreviation" => "MA",
              "disclosure" => json_encode([
                "default" => "{mlo_name} is licensed as a Massachusetts Mortgage Loan Originator under NMLS ID number - {mlo_nmls_id} and license number - {mlo_state_license_number}. Massachusetts Mortgage {lender_broker} Licensee under license number - {state_license_number} and NMLS ID number - {company_nmls_id}.",
                "additional" => "We arrange but do not make loans.",
              ]),
              "licensing_information" => json_encode([
                "default" => "Massachusetts Mortgage {lender_broker} Licensee under license number - {state_license_number}.",
                "additional" => "We arrange but do not make loans.",
              ]),
              "additional_required_disclosures" => null,
              "metadata" => json_encode([
                "mortgage_lender_broker" => [
                  "lender" => ["full_title" => "Lender", "value" => "", "disclaimer" => ""],
                  "broker" => ["full_title" => "Broker", "value" => "", "disclaimer" => ""],
                ],
                
              ])
            ],
            [
              "name" => "Michigan",
              "abbreviation" => "MI",
              "disclosure" => json_encode([
                "default" => $defaultDisclosure,
                "additional" => "",
              ]),
              "licensing_information" => json_encode([
                "default" => "Michigan (Insert 1st Mortgage Broker and Lender Licensee; 1st Mortgage Broker and Lender Registrant; 1st Mortgage Broker Licensee; 1st Mortgage Broker Registrant; 1st Mortgage Broker, Lender, and Servicer Licensee; 1st Mortgage Broker, Lender, and Servicer Registrant; 2nd Mortgage Broker and Lender Licensee; 2nd Mortgage Broker and Lender Registrant; 2nd Mortgage Broker Licensee; 2nd Mortgage Broker Registrant; 2nd Mortgage Broker, Lender, and Servicer Licensee; or,  2nd Mortgage Broker, Lender, and Servicer Registrant) under (insert license or registration) number - {state_license_number}.",
                "additional" => "",
              ]),
              "additional_required_disclosures" => null,
              "metadata" => null
            ],
            [
              "name" => "Minnesota",
              "abbreviation" => "MN",
              "disclosure" => json_encode([
                "default" => $defaultDisclosure,
                "additional" => "",
              ]),
              "licensing_information" => json_encode([
                "default" => "Minnesota {originator_company} Licensee under license number - {state_license_number}. ",
                "additional" => "",
              ]),
              "additional_required_disclosures" => null,
              "metadata" => null
            ],
            [
              "name" => "Mississippi",
              "abbreviation" => "MS",
              "disclosure" => json_encode([
                "default" => $defaultDisclosure,
                "additional" => "",
              ]),
              "licensing_information" => json_encode([
                "default" => "Mississippi Mortgage {lender_broker} Licensee under license number - {company_nmls_id}. {company_name}, {company_address}. Licensed by the Mississippi Department of Banking and Consumer Finance.",
                "additional" => "",
              ]),
              "additional_required_disclosures" => null,
              "metadata" => null
            ],
            [
              "name" => "Missouri",
              "abbreviation" => "MO",
              "disclosure" => json_encode([
                "default" => "{mlo_name} is licensed as a Mortgage Loan Originator under NMLS ID number - {mlo_nmls_id}. {company_name} is a Missouri Mortgage Company Licensee under NMLS ID number - {company_nmls_id}.",
                "additional" => "",
              ]),
              "licensing_information" => json_encode([
                "default" => "Missouri Mortgage Company Licensee under license number - {state_license_number}.",
                "additional" => "",
              ]),
              "additional_required_disclosures" => null,
              "metadata" => null
            ],
            [
              "name" => "Montana",
              "abbreviation" => "MT",
              "disclosure" => json_encode([
                "default" => "{mlo_name} is licensed as a Mortgage Loan Originator under NMLS ID number - {mlo_nmls_id}. Montana Mortgage {lender_broker} Licensee under license number - {state_license_number} and NMLS ID number - {company_nmls_id}.",
                "additional" => "",
              ]),
              "licensing_information" => json_encode([
                "default" => "Montana Mortgage {lender_broker} Licensee under license number - {state_license_number} and NMLS ID number - {company_nmls_id}.",
                "additional" => "",
              ]),
              "additional_required_disclosures" => null,
              "metadata" => json_encode([
                "mortgage_lender_broker" => [
                  "lender" => ["full_title" => "Lender", "value" => "", "disclaimer" => ""],
                  "broker" => ["full_title" => "Broker", "value" => "", "disclaimer" => ""],
                ]
              ])
            ],
            [
              "name" => "Nebraska",
              "abbreviation" => "NE",
              "disclosure" => json_encode([
                "default" => "{mlo_name} is licensed as a Mortgage Loan Originator under NMLS ID number - {mlo_nmls_id}. {company_name} is a Nebraska Mortgage Banker {licensee_registrant} under NMLS ID number - {company_nmls_id}.",
                "additional" => "",
              ]),
              "licensing_information" => json_encode([
                "default" => "Nebraska Mortgage Banker {licensee_registrant}.",
                "additional" => "",
              ]),
              "additional_required_disclosures" => null,
              "metadata" => json_encode([
                "licensee_registrant" => [
                  "licensee" => ["full_title" => "Licensee", "value" => "", "disclaimer" => ""],
                  "registrant" => ["full_title" => "Registrant", "value" => "", "disclaimer" => ""],
                ]
              ])
            ],
            [
              "name" => "Nevada",
              "abbreviation" => "NV",
              "disclosure" => json_encode([
                "default" => "{mlo_name} is licensed as a Mortgage Loan Originator under NMLS ID number - {mlo_nmls_id}. {mlo_name} {mlo_address}, {mlo_mobile_number}. {company_name} is a Nevada Mortgage Company Licensee under NMLS ID number - {company_nmls_id}. {company_name}, {company_address}, {company_mobile_number}.",
                "additional" => "",
              ]),
              "licensing_information" => json_encode([
                "default" => "Nevada Mortgage Company Licensee under license number - {state_license_number}. {company_name}, {company_address}, {company_mobile_number}.",
                "additional" => "",
              ]),
              "additional_required_disclosures" => null,
              "metadata" => json_encode([
                "branch_address" => [
                  "branch_address" => ["full_title" => "Branch Address", "value" => "", "disclaimer" => ""],
                  "branch_city" => ["full_title" => "City", "value" => "", "disclaimer" => ""],
                  "branch_zip" => ["full_title" => "Zip", "value" => "", "disclaimer" => ""]
                ]
              ])
            ],
            [
              "name" => "New Hampshire",
              "abbreviation" => "NH",
              "disclosure" => json_encode([
                "default" => $defaultDisclosure,
                "additional" => "",
              ]),
              "licensing_information" => json_encode([
                "default" => "New Hampshire Mortgage {banker_broker} Licensee under license number - {state_license_number}.",
                "additional" => "",
              ]),
              "additional_required_disclosures" => null,
              "metadata" => null
            ],
            [
              "name" => "New Jersey",
              "abbreviation" => "NJ",
              "disclosure" => json_encode([
                "default" => "{mlo_name} is licensed as a Mortgage Loan Originator under NMLS ID number - {mlo_nmls_id}. {company_name} is a New Jersey {lender_broker_depository} {licensee_registrant} under NMLS ID number - {company_nmls_id}. {company_name} is {licensee_registrant} by the New Jersey Department of Banking & Insurance.",
                "additional" => "",
              ]),
              "licensing_information" => json_encode([
                "default" => "New Jersey {lender_broker_depository} {licensee_registrant} under {licensee_registration_number} number - {state_license_number}. {company_name} is {licensee_registrant} by the New Jersey Department of Banking & Insurance.",
                "additional" => "",
              ]),
              "additional_required_disclosures" => null,
              "metadata" => json_encode([
                "mortgage_lender_broker_depository" => [
                  "mortgage_lender" => ["full_title" => "Residential Mortgage Lender", "value" => "", "disclaimer" => ""],
                  "mortgage_broker" => ["full_title" => "Residential Mortgage Broker", "value" => "", "disclaimer" => ""],
                  "depository" => ["full_title" => "Registered Depository", "value" => "", "disclaimer" => ""],
                ],
                "licensee_registrant" => [
                  "licensee" => ["full_title" => "Licensee", "value" => "", "disclaimer" => ""],
                  "registrant" => ["full_title" => "Registrant", "value" => "", "disclaimer" => ""],
                ]
              ])
            ],
            [
              "name" => "New Mexico",
              "abbreviation" => "NM",
              "disclosure" => json_encode([
                "default" => $defaultDisclosure,
                "additional" => "",
              ]),
              "licensing_information" => json_encode([
                "default" => "New Mexico Mortgage Loan Company Licensee.",
                "additional" => "",
              ]),
              "additional_required_disclosures" => null,
              "metadata" => null
            ],
            [
              "name" => "New York",
              "abbreviation" => "NY",
              "disclosure" => json_encode([
                "default" => "{mlo_name} is licensed as a Mortgage Loan Originator under NMLS ID number - {mlo_nmls_id}. New York Mortgage {banker_broker} {licensee_registrant} under {licensee_registration_number} - {licensee_registration_number}, {company_name} {company_address}. {company_name} is a {banker_broker} - NYS Department of Financial Services.",
                "additional" => "",
              ]),
              "licensing_information" => json_encode([
                "default" => "New York Mortgage {banker_broker} {licensee_registrant} under {licensee_registration_number} - {licensee_registration_number}, {company_name} {company_address}. {company_name}  is a {banker_broker} - NYS Department of Financial Services. Note - if a banker refer to license if a broker refer to registration.",
                "additional" => "",
              ]),
              "additional_required_disclosures" => null,
              "metadata" => json_encode([
                "mortgage_banker_broker" => [
                  "banker" => ["full_title" => "Banker", "value" => "", "disclaimer" => ""],
                  "broker" => ["full_title" => "Broker", "value" => "", "disclaimer" => ""],
                ],
                "licensee_registrant" => [
                  "licensee" => ["full_title" => "Licensee", "value" => "", "disclaimer" => ""],
                  "registrant" => ["full_title" => "Registrant", "value" => "", "disclaimer" => ""],
                ]
              ])
            ],
            [
              "name" => "North Carolina",
              "abbreviation" => "NC",
              "disclosure" => json_encode([
                "default" => $defaultDisclosure,
                "additional" => "",
              ]),
              "licensing_information" => json_encode([
                "default" => "North Carolina Mortgage {lender_broker} Licensee under license number - {state_license_number}.",
                "additional" => "",
              ]),
              "additional_required_disclosures" => null,
              "metadata" => null
            ],
            [
              "name" => "North Dakota",
              "abbreviation" => "ND",
              "disclosure" => json_encode([
                "default" => $defaultDisclosure,
                "additional" => "",
              ]),
              "licensing_information" => json_encode([
                "default" => "North Dakota Money Broker Licensee under license number - {state_license_number}.",
                "additional" => "",
              ]),
              "additional_required_disclosures" => null,
              "metadata" => null
            ],
            [
              "name" => "Ohio",
              "abbreviation" => "OH",
              "disclosure" => json_encode([
                "default" => "{mlo_name} is licensed as a Mortgage Loan Originator under NMLS ID number - {mlo_nmls_id} and license number - {mlo_state_license_number}. {mlo_name} is located at {mlo_address}. {company_name} has an Ohio Residential Mortgage Lending Act Certificate of Registration under license number - {state_license_number} and NMLS ID number - {company_nmls_id}. {company_name} located at {company_address}.",
                "additional" => "",
              ]),
              "licensing_information" => json_encode([
                "default" => "{company_name} has an Ohio Residential Mortgage Lending Act Certificate of Registration under license number - {state_license_number} and NMLS ID number - {company_nmls_id}. {company_name} located at {company_address}.",
                "additional" => "",
              ]),
              "additional_required_disclosures" => null,
              "metadata" => json_encode([
                "branch_address" => [
                  "branch_address" => ["full_title" => "Branch Address", "value" => "", "disclaimer" => ""],
                  "branch_city" => ["full_title" => "City", "value" => "", "disclaimer" => ""],
                  "branch_zip" => ["full_title" => "Zip", "value" => "", "disclaimer" => ""]
                ]
              ])
            ],
            [
              "name" => "Oklahoma",
              "abbreviation" => "OK",
              "disclosure" => json_encode([
                "default" => $defaultDisclosure,
                "additional" => "",
              ]),
              "licensing_information" => json_encode([
                "default" => "Oklahoma Mortgage {lender_broker} Licensee under license number - {state_license_number}.",
                "additional" => "",
              ]),
              "additional_required_disclosures" => null,
              "metadata" => null
            ],
            [
              "name" => "Oregon",
              "abbreviation" => "OR",
              "disclosure" => json_encode([
                "default" => $defaultDisclosure,
                "additional" => "",
              ]),
              "licensing_information" => json_encode([
                "default" => "{company_name} is an Oregon {lender_finance} under license number - {state_license_number}. {company_name} is located at {company_street_address}.",
                "additional" => "",
              ]),
              "additional_required_disclosures" => null,
              "metadata" => null
            ],
            [
              "name" => "Pennsylvania",
              "abbreviation" => "PA",
              "disclosure" => json_encode([
                "default" => $defaultDisclosure,
                "additional" => "",
              ]),
              "licensing_information" => json_encode([
                "default" => "Pennsylvania Mortgage {lender_broker} Licensee under NMLS ID number - {company_nmls_id} and under license number - {state_license_number}.",
                "additional" => "",
              ]),
              "additional_required_disclosures" => null,
              "metadata" => null
            ],
            [
              "name" => "Puerto Rico",
              "abbreviation" => "PR",
              "disclosure" => json_encode([
                "default" => $defaultDisclosure,
                "additional" => "",
              ]),
              "licensing_information" => json_encode([
                "default" => "{company_name} is a Puerto Rico Mortgage {lender_broker}. ",
                "additional" => "",
              ]),
              "additional_required_disclosures" => null,
              "metadata" => null
            ],
            [
              "name" => "Rhode Island",
              "abbreviation" => "RI",
              "disclosure" => json_encode([
                "default" => "{mlo_name} is licensed as a Mortgage Loan Originator under NMLS ID number - {mlo_nmls_id} Rhode Island {lender_broker} Licensee under NMLS ID number - {company_nmls_id}.",
                "additional" => "",
              ]),
              "licensing_information" => json_encode([
                "default" => "Rhode Island {lender_broker} Licensee under license number - {state_license_number}. ",
                "additional" => "",
              ]),
              "additional_required_disclosures" => null,
              "metadata" => json_encode([
                "mortgage_lender_broker" => [
                  "lender" => ["full_title" => "Lender", "value" => "", "disclaimer" => ""],
                  "broker" => ["full_title" => "Broker", "value" => "", "disclaimer" => ""],
                ]
              ])
            ],
            [
              "name" => "South Carolina",
              "abbreviation" => "SC",
              "disclosure" => json_encode([
                "default" => "{mlo_name} is licensed as a Mortgage Loan Originator under NMLS ID number - {mlo_nmls_id}. South Carolina {servicer_lender_broker} Licensee under NMLS ID number - {company_nmls_id}.",
                "additional" => "",
              ]),
              "licensing_information" => json_encode([
                "default" => "South Carolina {servicer_lender_broker} Licensee under license number - {state_license_number} and under NMLS ID number - {company_nmls_id}. See the South Carolina Consumer Loan Disclosure below “Additional State Specific Required Disclosures”.",
                "additional" => "",
              ]),
              "additional_required_disclosures" => json_encode([
                "default" => "SOUTH CAROLINA CONSUMER LOANS\nYour Rights and Responsibilities brochure:\nhttps://dih4lvql8rjzt.cloudfront.net/cms/7d3ebf57-734f-4a75-8c5e-d0c15b5d1c23_sc-consumer-loans-your-rights-and-Responsibilities-brochure.pdf",
                "additional" => ""
              ]),
              "metadata" => json_encode([
                "mortgage_lender_supervised" => [
                  "mortgage_lender_servicer" => ["full_title" => "Mortgage Lender\Servicer", "value" => "", "disclaimer" => ""],
                  "supervised_lender_company" => ["full_title" => "Supervised Lender Company", "value" => "", "disclaimer" => ""],
                  "mortage_broker" => ["full_title" => "Mortgage Broker", "value" => "", "disclaimer" => ""]
                ]
              ])
            ],
            [
              "name" => "South Dakota",
              "abbreviation" => "SD",
              "disclosure" => json_encode([
                "default" => $defaultDisclosure,
                "additional" => "",
              ]),
              "licensing_information" => json_encode([
                "default" => "South Dakota Mortgage {lender_brokerage} Licensee under license number - {state_license_number}.",
                "additional" => "",
              ]),
              "additional_required_disclosures" => null,
              "metadata" => null
            ],
            [
              "name" => "Tennessee",
              "abbreviation" => "TN",
              "disclosure" => json_encode([
                "default" => $defaultDisclosure,
                "additional" => "",
              ]),
              "licensing_information" => json_encode([
                "default" => "Tennessee {licensee_registrant} under {licensee_registration} number - {state_license_number}.",
                "additional" => "",
              ]),
              "additional_required_disclosures" => null,
              "metadata" => null
            ],
            [
              "name" => "Texas",
              "abbreviation" => "TX",
              "disclosure" => json_encode([
                "default" => "Texas Mortgage {licensee_registrant} under NMLS ID number - {company_nmls_name}. {mlo_name} is licensed as a Mortgage Loan Originator under NMLS ID number - {mlo_mls_id}.",
                "additional" => "",
              ]),
              "licensing_information" => json_encode([
                "default" => "Texas Mortgage {licensee_registrant} under {licensee_registration_number} number - {state_license_number}. See the Texas Complaints Notice below under “Additional State Specific Required Disclosures”.",
                "additional" => "",
              ]),
              "additional_required_disclosures" => json_encode([
                "default" => "TEXAS COMPLAINTS NOTICE\nCONSUMERS WISHING TO FILE A COMPLAINT AGAINST A MORTGAGE COMPANY OR A LICENSED RESIDENTIAL MORTGAGE LOAN ORIGINATOR SHOULD COMPLETE AND SEND A COMPLAINT FORM TO THE TEXAS DEPARTMENT OF SAVINGS AND MORTGAGE LENDING, 2601 NORTH LAMAR, SUITE 201, AUSTIN, TEXAS 78705. COMPLAINT FORMS AND INSTRUCTIONS MAY BE OBTAINED FROM THE DEPARTMENT'S WEBSITE AT WWW.SML.TEXAS.GOV. A TOLL-FREE CONSUMER HOTLINE IS AVAILABLE AT 1-877-276-5550.\n
                THE DEPARTMENT MAINTAINS A RECOVERY FUND TO MAKE PAYMENTS OF CERTAIN ACTUAL OUT OF POCKET DAMAGES SUSTAINED BY BORROWERS CAUSED BY ACTS OF LICENSED MORTGAGE COMPANY RESIDENTIAL MORTGAGE LOAN ORIGINATORS. A WRITTEN APPLICATION FOR REIMBURSEMENT FROM THE RECOVERY FUND MUST BE FILED WITH AND INVESTIGATED BY THE DEPARTMENT PRIOR TO THE PAYMENT OF A CLAIM. FOR MORE INFORMATION ABOUT THE RECOVERY FUND, PLEASE CONSULT THE DEPARTMENT'S WEB SITE AT WWW.SML.TEXAS.GOV.",
                "additional" => "TEXAS COMPLAINTS NOTICE\nCONSUMERS WISHING TO FILE A COMPLAINT AGAINST A MORTGAGE BANKER OR A LICENSED MORTGAGE BANKER RESIDENTIAL MORTGAGE LOAN ORIGINATOR SHOULD COMPLETE AND SEND A COMPLAINT FORM TO THE TEXAS DEPARTMENT OF SAVINGS AND MORTGAGE LENDING, 2601 NORTH LAMAR, SUITE 201, AUSTIN, TEXAS 78705. COMPLAINT FORMS AND INSTRUCTIONS MAY BE OBTAINED FROM THE DEPARTMENT'S WEBSITE AT WWW.SML.TEXAS.GOV. A TOLL-FREE CONSUMER HOTLINE IS AVAILABLE AT 1-877-276-5550.\n
                THE DEPARTMENT MAINTAINS A RECOVERY FUND TO MAKE PAYMENTS OF CERTAIN ACTUAL OUT OF POCKET DAMAGES SUSTAINED BY BORROWERS CAUSED BY ACTS OF LICENSED MORTGAGE BANKER RESIDENTIAL MORTGAGE LOAN ORIGINATORS. A WRITTEN APPLICATION FOR REIMBURSEMENT FROM THE RECOVERY FUND MUST BE FILED WITH AND INVESTIGATED BY THE DEPARTMENT PRIOR TO THE PAYMENT OF A CLAIM. FOR MORE INFORMATION ABOUT THE RECOVERY FUND, PLEASE CONSULT THE DEPARTMENT'S WEB SITE AT WWW.SML.TEXAS.GOV."
              ]),
              "metadata" => json_encode([
                "licensee_registrant" => [
                  "licensee" => ["full_title" => "Licensee", "value" => "", "disclaimer" => ""],
                  "registrant" => ["full_title" => "Registrant", "value" => "", "disclaimer" => ""],
                ]
              ])
            ],
            [
              "name" => "Utah",
              "abbreviation" => "UT",
              "disclosure" => json_encode([
                "default" => $defaultDisclosure,
                "additional" => "",
              ]),
              "licensing_information" => json_encode([
                "default" => "Utah {notification_license} under {notification_license_number} number - {state_license_number}.",
                "additional" => "",
              ]),
              "additional_required_disclosures" => null,
              "metadata" => null
            ],
            [
              "name" => "Vermont",
              "abbreviation" => "VT",
              "disclosure" => json_encode([
                "default" => "{mlo_name} is licensed as a Mortgage Loan Originator under NMLS ID number - {mlo_nmls_id}. {mlo_name} is located at {mlo_address}. {company_name} is a Vermont {lender_broker} Licensee under NMLS ID number - {company_nmls_id}.",
                "additional" => "",
              ]),
              "licensing_information" => json_encode([
                "default" => "Vermont {lender_broker} Licensee under license number - {state_license_number}.",
                "additional" => "",
              ]),
              "additional_required_disclosures" => null,
              "metadata" => json_encode([
                "mortgage_lender_broker" => [
                  "lender" => ["full_title" => "Lender", "value" => "", "disclaimer" => ""],
                  "broker" => ["full_title" => "Broker", "value" => "", "disclaimer" => ""],
                ],
                "branch_address" => [
                  "branch_address" => ["full_title" => "Branch Address", "value" => "", "disclaimer" => ""],
                  "branch_city" => ["full_title" => "City", "value" => "", "disclaimer" => ""],
                  "branch_zip" => ["full_title" => "Zip", "value" => "", "disclaimer" => ""]
                ]
              ])
            ],
            [
              "name" => "Virgin Islands",
              "abbreviation" => "VI",
              "disclosure" => json_encode([
                "default" => $defaultDisclosure,
                "additional" => "",
              ]),
              "licensing_information" => json_encode([
                "default" => "Virgin Island Mortgage {lender_broker} Licensee.",
                "additional" => "",
              ]),
              "additional_required_disclosures" => null,
              "metadata" => null
            ],
            [
              "name" => "Virginia",
              "abbreviation" => "VA",
              "disclosure" => json_encode([
                "default" => "{mlo_name} is licensed as a Mortgage Loan Originator under NMLS ID# - {mlo_nmls_id} (www.nmlsconsumeraccess.org). Virginia Mortgage {lender_broker} Licensee under NMLS ID# - {company_nmls_id} (www.nmlsconsumeraccess.org) .",
                "additional" => "",
              ]),
              "licensing_information" => json_encode([
                "default" => "Virginia Mortgage {lender_broker} Licensee under license number - {state_license_number} and under NMLS ID# - {company_nmls_id} (www.nmlsconsumeraccess.org).",
                "additional" => "",
              ]),
              "additional_required_disclosures" => null,
              "metadata" => json_encode([
                "mortgage_lender_broker" => [
                  "lender" => ["full_title" => "Lender", "value" => "", "disclaimer" => ""],
                  "broker" => ["full_title" => "Broker", "value" => "", "disclaimer" => ""],
                ]
              ])
            ],
            [
              "name" => "Washington",
              "abbreviation" => "WA",
              "disclosure" => json_encode([
                "default" => $defaultDisclosure,
                "additional" => "",
              ]),
              "licensing_information" => json_encode([
                "default" => "Washington {loan_company_broker} Licensee as {company_name} under license number - {state_license_number}. ",
                "additional" => "",
              ]),
              "additional_required_disclosures" => null,
              "metadata" => null
            ],
            [
              "name" => "West Virginia",
              "abbreviation" => "WV",
              "disclosure" => json_encode([
                "default" => $defaultDisclosure,
                "additional" => "",
              ]),
              "licensing_information" => json_encode([
                "default" => "West Virginia Mortgage {lender_broker} Licensee under license number - {state_license_number}.",
                "additional" => "",
              ]),
              "additional_required_disclosures" => null,
              "metadata" => null
            ],
            [
              "name" => "Wisconsin",
              "abbreviation" => "WI",
              "disclosure" => json_encode([
                "default" => "{mlo_name} is licensed as a Mortgage Loan Originator under NMLS ID# - {mlo_nmls_id}. {company_name} is a Wisconsin Mortgage {banker_broker} Licensee under NMLS ID number - {company_nmls_id}.",
                "additional" => "",
              ]),
              "licensing_information" => json_encode([
                "default" => "Wisconsin Mortgage {banker_broker} Licensee under license number - {state_license_number} and under NMLS ID number - {company_nmls_id}.",
                "additional" => "",
              ]),
              "additional_required_disclosures" => null,
              "metadata" => json_encode([
                "mortgage_banker_broker" => [
                  "banker" => ["full_title" => "Banker", "value" => "", "disclaimer" => ""],
                  "broker" => ["full_title" => "Broker", "value" => "", "disclaimer" => ""],
                ],
              ])
            ],
            [
              "name" => "Wyoming",
              "abbreviation" => "WY",
              "disclosure" => json_encode([
                "default" => $defaultDisclosure,
                "additional" => "",
              ]),
              "licensing_information" => json_encode([
                "default" => "Wyoming Mortgage {lender_broker} Licensee under license number - {state_license_number}. ",
                "additional" => "",
              ]),
              "additional_required_disclosures" => null,
              "metadata" => null
            ]
          
        ];

        State::insert($states);
    }
};
