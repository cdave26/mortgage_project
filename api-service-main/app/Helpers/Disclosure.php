<?php

namespace App\Helpers;
use App\Models\Listing;
use Illuminate\Support\Str;
use App\Models\Company;
use App\Models\CompanyStateLicense;
use Illuminate\Support\Arr;
class Disclosure
{
    public function getDisclosure($listing_id, $user): array
    {
        $listing = Listing::findOrFail($listing_id);
        $companyNmlsNumber = $listing->user->company->company_nmls_number;
        $json = json_decode($listing->state->disclosure);
        $stateName = $listing->state->name;
        $stateId = $listing->state->id;
       // $stateLicense = $listing->state->companyStateLicense->license;
        $companyAddress =  $listing->company->address;
        $companyCity =  $listing->company->city;
        $companyState =  $listing->company->state;
        $companyZip =  $listing->company->zip;
        $companyId = $listing->user->company->id;

        $company = Company::find($companyId);

        $companyStateLicense = CompanyStateLicense::where('company_id', $companyId)
                                ->where('state_id', $stateId)
                                ->whereNull('deleted_at')
                                ->first();  

        if($companyStateLicense) {
            $stateMetadata = $companyStateLicense->state_metadata;
            $stateLicense = $companyStateLicense->license;
        }

        
        // todo: replace $listing->state->companyStateLicense with CompanyStateLicense query
        //$stateMetadata = $listing->state->companyStateLicense->state_metadata;
        $lender_broker = selected_options($stateMetadata, $stateName, 'lender_broker');
        $banker_broker = selected_options($stateMetadata, $stateName, 'banker_broker');
        $bankerBrokerServicer = selected_options($stateMetadata, $stateName, 'banker_broker_servicer');
        $licensedRegistered = selected_options($stateMetadata, $stateName, 'licensee_registrant');
        $licenseeRegistrant = selected_options($stateMetadata, $stateName, 'licensee_registrant');
        $servicerLenderBroker = selected_options($stateMetadata, $stateName, 'servicer_lender_broker');
        $lenderBrokerDepository = selected_options($stateMetadata, $stateName, 'lender_broker_depository');

        $branchAddress = '';
        $state = Arr::first($stateMetadata, function (array $data) use ($stateName) {
            return $data['name'] === $stateName;
        });

        $rawBranchAdress = Arr::first($state['validation'] ?? [], function ($validation) {
            return $validation['key'] === 'branch_address';
        });

        $branchAddressSelection = Arr::map($rawBranchAdress['selection'] ?? [], function ($selection) {
            return $selection['value'];
        });

        if($branchAddressSelection) {
            $branchAddress = $branchAddressSelection[0] . ' ' . $branchAddressSelection[1] . ', '. $branchAddressSelection[2];
        }

     //California Options
        $californiaOptionsString = '';
        if ($stateName === 'California') {
            $californiaOptions = selected_options($stateMetadata, $stateName, 'california_options');
            foreach ($californiaOptions as $option) {
                if (isset($option['full_title'])) {
                    if (!empty($californiaOptionsString)) {
                        $californiaOptionsString .= ', ';
                    }
                    $californiaOptionsString .= 'Department of ' . $option['full_title'];
                }
            }
             $californiaLoanOfficerNmlsNumber =  "$companyNmlsNumber and under state license number $stateLicense";
        }
        $licensedRegisteredData = head($licensedRegistered);
        $licensedRegistrationData = head($licensedRegistered);
        $lenderBrokerDepositoryData = head($lenderBrokerDepository);
        $servicerLenderBrokerData = head($servicerLenderBroker);
        $bankerBrokerServicerData = head($bankerBrokerServicer);
        
        if ($stateName === 'Texas') {
            $licenseeRegistrantData = head($licenseeRegistrant);
            if ($licenseeRegistrantData !== false) {
                $fullTitle = $licenseeRegistrantData['full_title'];

                if ($fullTitle === 'Registrant') {
                    $licenseeRegistrantData['full_title'] = 'Banker Registrant';
                } elseif ($fullTitle === 'Licensee') {
                    $licenseeRegistrantData['full_title'] = 'Company Licensee';
                }
            }
        }
        
        if ($stateName === 'New York') {
            $bankerBrokerData = head($banker_broker);
            if ($bankerBrokerData !== false) {
                $fullTitle = $bankerBrokerData['full_title'];

                if ($fullTitle === 'Banker') {
                    $bankerBrokerData['full_title'] = 'Licensed Mortgage Banker';
                } elseif ($fullTitle === 'Broker') {
                    $bankerBrokerData['full_title'] = 'Registered Mortgage Broker';
                }
            }
        }

        $companyFullAddress = $companyCity . ' ' . $companyAddress . ', ' . $companyState . ' ' . $companyZip ;
        $ohioAddress = $companyAddress . ' ' . $companyCity . ', ' . $companyState . ' ' . $companyZip ;
       
        if ($licensedRegisteredData !== false) {
            $fullTitle = $licensedRegisteredData['full_title'];

            if ($fullTitle === 'Registrant') {
                $licensedRegisteredData['full_title'] = 'Registered';
                $licensedRegistrationData['full_title'] = 'Registration';
            } elseif ($fullTitle === 'Licensee') {
                $licensedRegisteredData['full_title'] = 'Licensed';
                $licensedRegistrationData['full_title'] = 'License';
            }
       
            if ($stateName === 'New York') {
                if ($fullTitle === 'Registrant') {
                    $licensedRegistrationData['full_title'] = 'registration number';
                } elseif ($fullTitle === 'Licensee') {
                    $licensedRegistrationData['full_title'] = 'license number';
                }
            }
        }
        
        $disclosure = Str::swap([
            '{lender_broker}' => head($lender_broker)['full_title'] ?? '',
            '{banker_broker}' => ($stateName === 'New York') ? $bankerBrokerData['full_title'] ?? '' : head($banker_broker)['full_title'] ?? '',
            '{state_name}' => $stateName,
            '{company_nmls_id}' => ($stateName === 'California') ? $californiaLoanOfficerNmlsNumber ?? '' : $listing->user->company->company_nmls_number,
            '{company_name}' => $listing->user->company->name,
            '{mlo_name}' => $listing->user->full_name,
            '{mlo_nmls_id}' => $listing->user->nmls_num,
            '{state_license_number}' => $listing->state->companyStateLicense->license ?? '',
            '{license_registration}' => $licensedRegistrationData['full_title'] ?? '',
            '{company_address}' =>  ($stateName === 'Ohio' || 'Georgia') ? $ohioAddress ?? '' : $this->getCompanyFullAddress($listing) ?? '',
            '{department_choice}' => $californiaOptionsString,
            '{mlo_state_license_number}' => $listing->license->license ?? '',
            '{mlo_address}' =>  $branchAddress ?? '',
            '{servicer_lender_broker}' => $servicerLenderBrokerData['full_title'] ?? '',
            '{banker_broker_servicer}' => $bankerBrokerServicerData['full_title'] ?? '',
            '{company_mobile_number}' => format_phone_number($listing->user->mobile_number) ?? '',
            '{lender_broker_depository}' => $lenderBrokerDepositoryData['full_title'] ?? '',
            '{licensee_registrant}' => ($stateName === 'Texas') ? $licenseeRegistrantData['full_title'] ?? '' : head($licenseeRegistrant)['full_title'] ?? '',
            '{licensed_registered}' => $licensedRegisteredData['full_title'] ?? '',
            '{licensee_registration_number}' => $listing->state->companyStateLicense->license ?? '',
        ], $json?->default);

        if ($lender_broker !== false) {
            $fullTitle = head($lender_broker)['full_title'] ?? '';
            if ($fullTitle === 'Broker') {
                if ($stateName === 'Massachusetts') {
                    $disclosure .= "We arrange but do not make loans.";
                }else if($stateName === 'Connecticut'){
                    $disclosure .= "MORTGAGE BROKER ONLY, NOT A MORTGAGE LENDER OR CORRESPONDENT LENDER.";
                }
            } 
        }
  
        $disclosure = explode('.', $disclosure);

        if (count($disclosure) == 2) {
            $disc = explode(',', $disclosure[0]);

            unset($disclosure[0]);

            $disclosure = array_merge($disc, $disclosure);
        }
        return $disclosure;
    }

    private function getCompanyFullAddress($listing): string
    {
        return $listing->company->city . ' ' . $listing->company->address . ' ' . $listing->company->state . ' ' . $listing->company->zip;
    }
}