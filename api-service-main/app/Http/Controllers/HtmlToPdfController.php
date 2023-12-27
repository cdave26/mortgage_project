<?php

namespace App\Http\Controllers;

use App\Enums\UserType;
use App\Http\Requests\HtmlToPdfRequest;
use App\Models\Flyer;
use App\Models\CompanyStateLicense;
use App\Models\State;
use App\Repositories\FlyerRepository;
use App\Services\Profiler;
use Dompdf\Dompdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\View;
use Carbon\Carbon;

class HtmlToPdfController extends Controller
{
    use Profiler;

    public function __construct(
        public FlyerRepository $repository,
    ) {
    }

    public function __invoke(HtmlToPdfRequest $request): JsonResponse
    {
        $data = $request->validated();

        $flyer = Flyer::find($data['flyer_id']);

        $template = implode('.', [
            'flyers', $flyer->name,
        ]);

        $profilePicture = null;
        // $profilePicture = resource_path('views/flyers/images/profile-image.jpeg');
        // $profilePicture = data_uri($profilePicture);

        $companyLogo = resource_path('views/flyers/images/Uplist_wordmark.png');
        $companyLogo = data_uri($companyLogo);

        $listingId = Arr::get($data, 'listing_id');

        $companyId = null;
        $stateId = null;
        $disclosure = null;
        $json = null;
        $stateMetadata = [];
        $stateLicense = null;
        $companyHousing = null;

        $mls_num = null;

        $customWidth =  625;
        $customHeight = 810;

        $customPaperSize = [
            0,
            0,
            $customWidth,
            $customHeight,
        ];

        // $this->start('query');
        switch ($data['source']) {
            case 'listing':
                $listing = DB::table('listings as l')
                    ->join('companies as co', 'co.id', '=', 'l.company_id')
                    ->join('users as u', 'u.id', '=', 'l.user_id')
                    ->join('states as s', 's.id', '=', 'l.state_id')
                    ->join('licenses as ls', 'ls.id', '=', 'l.user_license_id')
                    ->join('states as lss', 'lss.id', '=', 'ls.state_id')
                    ->where('l.id', $listingId)
                    ->selectRaw(<<<SELECT
                        l.*,
                        u.email,
                        u.alternative_email,
                        u.mobile_number,
                        u.url_identifier,
                        u.nmls_num,
                        u.profile_logo,
                        u.custom_logo_flyers,
                        u.job_title,
                        u.user_type_id,
                        u.employee_id,
                        co.allow_loan_officer_to_upload_logo,
                        co.name as company_name,
                        co.company_mobile_number,
                        co.header_background_color,
                        co.equal_housing,
                        co.company_nmls_number,
                        co.company_logo,
                        co.address as company_address,
                        co.city as company_city,
                        co.state as company_state,
                        co.zip as company_zip,
                        CONCAT(u.first_name, ' ', u.last_name) as loan_officer,
                        s.name as property_state,
                        s.abbreviation,
                        s.disclosure,
                        ls.license,
                        s.name as user_license_state
                    SELECT)
                    ->first();

                if (
                    $listing->allow_loan_officer_to_upload_logo && 
                    $listing->user_type_id === UserType::LOAN_OFFICER->id() &&
                    $listing->custom_logo_flyers && 
                    Storage::exists($listing->custom_logo_flyers)
                ) {
                    $companyLogo = Storage::url($listing->custom_logo_flyers);
                } elseif ($listing->company_logo && Storage::exists($listing->company_logo)) {
                    $companyLogo = Storage::url($listing->company_logo);
                } else {
                    return $this->error([
                        'message' => trans('messages.error.logo_not_found')
                    ], JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
                }

                if ($listing->profile_logo && Storage::exists($listing->profile_logo)) {
                    $profilePicture = Storage::url($listing->profile_logo);
                }

                $stateId = $listing->state_id;
                $companyId = $listing->company_id;

                $loanOfficerName = $listing->loan_officer;
                $loanOfficerEmployeeId = $listing->employee_id;
                $listingLoanOfficerId = $listing->user_id;
                $userUrlIdentifier = $listing->url_identifier;
                $loanOfficerNmlsNumber = $listing->nmls_num;
                $stateName = $listing->user_license_state;
                $loanOfficerEmail =  $listing->alternative_email ?: $listing->email;

                $companyAddress =  $listing->company_address;
                $companyCity =  $listing->company_city;
                $companyState =  $listing->company_state;
                $companyZip =  $listing->company_zip;
                $mls_num = $listing->mls_number;

                $companyNumber =  $listing->company_mobile_number;
                $companyHousing = $listing->equal_housing;
                $companyName = $listing->company_name;
                $companyNmlsNumber = $listing->company_nmls_number;
                $companyColor = $listing->header_background_color;
                $licenseNumber =  $listing->license;
                $mobileNumber = format_phone_number($listing->mobile_number);
                $jobTitle = $listing->job_title;

                $property = [
                    'address' => ucwords($listing->property_address),
                    'apt_suite' => $listing->property_apt_suite,
                    'city' => ucwords($listing->property_city),
                    'zip' => $listing->property_zip,
                    'state' => $listing->property_state,
                    'state_abbreviation' => $listing->abbreviation,
                ];

                $defaultDownPayment = $listing->default_down_payment;
                $down = (int)$listing->property_value * ((int)$defaultDownPayment / 100);
                $downPayment = currency_format($down, 0);
                $loanAmount = currency_format($listing->loan_amount, 0);
                $sellerCredits = currency_format($listing->seller_credits, 0);
                $propertyValue = currency_format($listing->property_value, 0);

                $json = json_decode($listing->disclosure);
                break;

            default:
                $user = Auth::user();
                $stateId = Arr::get($data, 'state_id');
                $companyId = $user->company_id;
                $company = DB::table('companies as c')
                    ->where('id', $companyId)
                    ->selectRaw(<<<SELECT
                        name,
                        address,
                        city,
                        state,
                        zip,
                        company_logo,
                        company_nmls_number,
                        equal_housing,
                        header_background_color,
                        company_mobile_number,
                        allow_loan_officer_to_upload_logo
                    SELECT)
                    ->first();

                if (
                    $company->allow_loan_officer_to_upload_logo &&
                    $user->user_type_id === UserType::LOAN_OFFICER->id() &&
                    $user->custom_logo_flyers && 
                    Storage::exists($user->custom_logo_flyers)
                ) {
                    $companyLogo = Storage::url($user->custom_logo_flyers);
                } elseif ($company->company_logo && Storage::exists($company->company_logo)) {
                    $companyLogo = Storage::url($company->company_logo);
                } else {
                    return $this->error([
                        'message' => trans('messages.error.logo_not_found')
                    ], JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
                }

                if ($user->profile_logo && Storage::exists($user->profile_logo)) {
                    $profilePicture = Storage::url($user->profile_logo);
                }

                $state = State::select(['name', 'disclosure'])->find($stateId);
                $userLicense = DB::table('licenses')
                    ->where('user_id', $user->id)
                    ->where('state_id', $stateId)
                    ->first();

                $stateName = $state->name;
                $companyAddress = $company->address;
                $companyCity = $company->city;
                $companyState = $company->state;
                $companyZip = $company->zip;
                $companyNmlsNumber = $company->company_nmls_number;
                $companyHousing = $company->equal_housing;
                $companyName = $company->name;
                $mobileNumber = format_phone_number($user->mobile_number);
                $licenseNumber = $userLicense->license;

                $loanOfficerName = implode(' ', [
                    $user->first_name,
                    $user->last_name,
                ]);

                $companyColor = $company->header_background_color;
                $loanOfficerEmployeeId = $user->employee_id;
                $loanOfficerEmail = $user->email;
                $loanOfficerNmlsNumber = $user->nmls_num;
                $jobTitle = $user->job_title;
                $listingLoanOfficerId = $user->id;
                $userUrlIdentifier = $user->url_identifier;
                $companyNumber = $company->company_mobile_number;

                $property = [
                    'address' => $stateName,
                ];

                $json = json_decode($state->disclosure);
                break;
        }
        // $this->stop('query');

        // $this->start('disclosure');
        $companyStateLicense = CompanyStateLicense::where('company_id', $companyId)
            ->where('state_id', $stateId)
            ->whereNull('deleted_at')
            ->first();

        if ($companyStateLicense) {
            $stateMetadata = $companyStateLicense->state_metadata;
            $stateLicense = $companyStateLicense->license;
        }

        $lenderBroker = selected_options($stateMetadata, $stateName, 'lender_broker');
        $bankerBroker = selected_options($stateMetadata, $stateName, 'banker_broker');
        $bankerBrokerServicer = selected_options($stateMetadata, $stateName, 'banker_broker_servicer');
        $licensedRegistered = selected_options($stateMetadata, $stateName, 'licensee_registrant');
        $licenseeRegistrant = selected_options($stateMetadata, $stateName, 'licensee_registrant');
        $servicerLenderBroker = selected_options($stateMetadata, $stateName, 'servicer_lender_broker');
        $lenderBrokerDepository = selected_options($stateMetadata, $stateName, 'lender_broker_depository');

        //branch address for {mlo_address}
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

        if ($branchAddressSelection) {
            $branchAddress = $branchAddressSelection[0] . ' ' . $branchAddressSelection[1] . ', ' . $branchAddressSelection[2];
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

        if ($stateName === 'California') {
            $californiaLoanOfficerNmlsNumber =  "$companyNmlsNumber and under state license number $stateLicense";
        }

        if ($stateName === 'New York') {
            $bankerBrokerData = head($bankerBroker);
            if ($bankerBrokerData !== false) {
                $fullTitle = $bankerBrokerData['full_title'];

                if ($fullTitle === 'Banker') {
                    $bankerBrokerData['full_title'] = 'Licensed Mortgage Banker';
                } elseif ($fullTitle === 'Broker') {
                    $bankerBrokerData['full_title'] = 'Registered Mortgage Broker';
                }
            }
        }

        $companyFullAddress = $companyCity . ' ' . $companyAddress . ', ' . $companyState . ' ' . $companyZip;
        $ohioAddress = $companyAddress . ' ' . $companyCity . ', ' . $companyState . ' ' . $companyZip;

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
            '{lender_broker}' => head($lenderBroker)['full_title'] ?? '',
            '{banker_broker}' => ($stateName === 'New York') ? $bankerBrokerData['full_title'] ?? '' : head($bankerBroker)['full_title'] ?? '',
            '{state_name}' => $stateName,
            '{company_nmls_id}' => ($stateName === 'California') ? $californiaLoanOfficerNmlsNumber ?? '' :  $companyNmlsNumber,
            '{company_name}' => $companyName,
            '{mlo_name}' => $loanOfficerName,
            '{company_mlo_mobile}' => $companyNumber,
            '{mlo_mobile_number}' => $mobileNumber,
            '{mlo_nmls_id}' => $loanOfficerNmlsNumber,
            '{state_license_number}' => $stateLicense ?? '',
            '{license_registration}' => $licensedRegistrationData['full_title'] ?? '',
            '{company_address}' => ($stateName === 'Ohio' || 'Georgia') ? $ohioAddress ?? '' : $companyFullAddress ?? '',
            '{department_choice}' => $californiaOptionsString,
            '{mlo_state_license_number}' => $licenseNumber ?? '',
            '{mlo_address}' =>  $branchAddress ?? '',
            '{servicer_lender_broker}' => $servicerLenderBrokerData['full_title'] ?? '',
            '{banker_broker_servicer}' => $bankerBrokerServicerData['full_title'] ?? '',
            '{company_mobile_number}' => $companyNumber ?? '',
            '{lender_broker_depository}' => $lenderBrokerDepositoryData['full_title'] ?? '',
            '{licensee_registrant}' => ($stateName === 'Texas') ? $licenseeRegistrantData['full_title'] ?? '' : head($licenseeRegistrant)['full_title'] ?? '',
            '{licensed_registered}' => $licensedRegisteredData['full_title'] ?? '',
            '{licensee_registration_number}' => $stateLicense ?? '',
        ], $json?->default);

        if ($lenderBroker !== false) {
            $fullTitle = head($lenderBroker)['full_title'] ?? '';
            if ($fullTitle === 'Broker') {
                if ($stateName === 'Massachusetts') {
                    $disclosure .= "<br>We arrange but do not make loans.";
                } else if ($stateName === 'Connecticut') {
                    $disclosure .= "<br>MORTGAGE BROKER ONLY, NOT A MORTGAGE LENDER OR CORRESPONDENT LENDER.";
                }
            }
        }

        $disclosure = str_replace('..', '.', $disclosure);
        // $this->stop('disclosure');

        $employeesWithCustomColors = ['MAN140016'];

        $viewData = [
            'source' => $data['source'],
            'color' => in_array($loanOfficerEmployeeId, $employeesWithCustomColors) ? '#000000': $companyColor,
            'company' => [
                'logo' => $companyLogo,
                'housing' => $companyHousing,
            ],
            'loan_officer' => [
                'profile_picture' => $profilePicture,
                'name' => $loanOfficerName,
                'email' => $loanOfficerEmail,
                'nmls_number' => $loanOfficerNmlsNumber,
                'job_title' => Str::title($jobTitle),
                'mobile_number' => $mobileNumber,
                'employee_id' => $loanOfficerEmployeeId,
            ],
            'property' => $property,
            'disclosure' => $disclosure,
            'qr_image' => $data['qr_image'] ?? null,
            'default_down_payment' => $defaultDownPayment ?? null,
            'downPayment' => $downPayment ?? null,
            'loan_amount' => $loanAmount ?? null,
            'seller_credit' => $sellerCredits ?? null,
            'property_value' => $propertyValue ?? null,
            'lender_broker' => $lenderBroker,
        ];

        if($data['source'] === 'listing') {
            $viewData = [
                ...$viewData,
                'listing' => [
                    'mls_number' => $mls_num,
                ]
            ];
        }

        // $this->start('view');
        $file = View::make($template, $viewData)->render();
        // $this->stop('view');

        // $this->start('generate');
        $tmp = sys_get_temp_dir();

        $dompdf = new Dompdf([
            'logOutputFile' => '',
            'isRemoteEnabled' => true,
            'fontDir' => $tmp,
            'fontCache' => $tmp,
            'tempDir' => $tmp,
            'chroot' => $tmp,
        ]);

        $dompdf->loadHtml($file);

        $dompdf->setPaper($customPaperSize);

        $dompdf->render();

        $content = $dompdf->output();

        $timeStamp = Carbon::now()->timestamp;

        if ($request->query('source') === 'listing') {
            $path = implode([
                    'generated_pdf/', $userUrlIdentifier, '-', 'mls', $mls_num, '-', 'flyer-', $flyer->name, '-', $listingId, '-', $timeStamp, '.pdf',
            ]);
        }else{
             $path = implode([
                    'generated_pdf/', $userUrlIdentifier, '-', 'flyer-', $flyer->name, '-', $timeStamp, '.pdf',
            ]);
        }
     
        // $this->stop('generate');

        // $this->start('storage');
        Storage::put($path, $content);
        // $this->stop('storage');

        // $this->start('insert');
        if ($request->query('source') === 'listing') {
            $this->repository->doSaveGeneratedFlyer([
                'user_id' => $listingLoanOfficerId,
                'flyer_id' => $data['flyer_id'],
                'generated_flyer' => $path,
                'listing_id' => $listingId,
                'company_id' => $companyId,
            ]);
        }
        // $this->stop('insert');

        return $this->success([
            'message' => trans('messages.success.dynamic', [
                'beginning' => 'Your',
                'resource' => 'flyer',
                'super' => 'was',
                'action' => 'created!',
            ]),
            'url' => $path,
        ]);
    }
}
