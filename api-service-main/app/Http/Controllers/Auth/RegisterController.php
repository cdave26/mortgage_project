<?php

namespace App\Http\Controllers\Auth;

use App\Enums\Hubspot;
use App\Enums\UserStatus;
use App\Enums\UserType as EnumsUserType;
use App\Facades\SendGridService;
use App\Helpers\HubspotHelper;
use App\Helpers\IDGenerator;
use App\Http\Controllers\Controller;
use App\Mail\Welcome;
use App\Models\Company;
use App\Models\PricingEngine;
use App\Models\User;
use App\Repositories\EmailRepository;
use App\Repositories\HubspotRepository;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class RegisterController extends Controller
{
    public function __construct(
        public EmailRepository $emailRepository,
        public Welcome $invitation,
    ) { }

    /**
     * Validate and create a newly registered user.
     *
     */
    public function create(Request $request): JsonResponse
    {
        $generator = new IDGenerator();
        $hubspotRepository = new HubspotRepository();
        $hubspotHelper = new HubspotHelper();

        $fields =  $request->validate([
            'company_id' => 'required|integer|exists:App\Models\Company,id',
            'first_name' => 'required|string|max:50',
            'last_name' => 'required|string|max:50',
            'user_type_id' => 'required|integer|exists:App\Models\UserType,id',
            'pricing_engine_id' => 'required|integer|exists:App\Models\PricingEngine,id',
            'job_title' => 'string|max:50|nullable',
            'mobile_number' => 'string|max:30|nullable',
            'nmls_num' => ['string', 'max:50', 'regex:/^[0-9]*$/i', 'nullable'],
            'email' => 'required|string|max:255|unique:users,email',
            'profile_logo' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'alternative_email' => 'nullable|string|max:50',
        ], [
            'company_id.required' =>  trans('messages.error.required_field'),
            'first_name.required' => trans('messages.error.required_field'),
            'first_name.max' =>  trans('messages.error.max', [
                'resource' => 'first name',
                'max' => 50
            ]),
            'last_name.required' => trans('messages.error.required_field'),
            'last_name.max' => trans('messages.error.max', [
                'resource' => 'last name',
                'max' => 50
            ]),
            'user_type_id.required' => trans('messages.error.required_field'),
            'pricing_engine_id.required' => trans('messages.error.required_field'),
            'job_title.required' => trans('messages.error.required_field'),
            'job_title.max' => trans('messages.error.max', [
                'resource' => 'job title',
                'max' => 50
            ]),
            'email.unique' => trans('messages.error.email_taken'),
            'email.regex' => trans('messages.error.valid_email', [
                'resource' => 'email'
            ]),
            'email.max' => trans('messages.error.max', [
                'resource' => 'email',
                'max' => 255
            ]),
            'email.required' => trans('messages.error.required_field'),
            'nmls_num.regex' => trans('messages.error.user.nmls_num'),
            'nmls_num.max' => trans('messages.error.max', [
                'resource' => 'NMLS number',
                'max' => 50
            ]),
            'alternative_email.max' => trans('messages.error.max', [
                'resource' => 'alternative email',
                'max' => 50
            ]),
        ]);

        try {
            DB::beginTransaction();

            $company = Company::query()->find($fields['company_id']);

            if (!$company || !$company->hubspot_company_id) {
                throw new Exception(
                    trans('messages.error.api_db_not_found', [
                        'resource' => 'company',
                    ]),
                    JsonResponse::HTTP_UNPROCESSABLE_ENTITY
                );
            }

            // checker if the user to be registered is Loan Officer
            $usersWithHubspot = [
                EnumsUserType::COMPANY_ADMIN->id(),
                EnumsUserType::LOAN_OFFICER->id()
            ];
            $userForHubspot = in_array($fields['user_type_id'], $usersWithHubspot);

            if ($userForHubspot) {
                $pricingEngine = PricingEngine::find($fields['pricing_engine_id']);

                $contactType = match((int) $fields['user_type_id']) {
                    EnumsUserType::COMPANY_ADMIN->id() => Hubspot::USER_TYPE_COMPANY_ADMIN,
                    EnumsUserType::LOAN_OFFICER->id() => Hubspot::USER_TYPE_LOAN_OFFICER,
                    default => Hubspot::USER_TYPE_LOAN_OFFICER
                };

                // create hubspot contact
                $hubspotContactInput = [
                    'firstname' => $fields['first_name'],
                    'lastname' => $fields['last_name'],
                    'email' => $fields['email'],
                    'pricing_engine' => $pricingEngine->name,
                    Hubspot::HUBSPOT_CONTACT_USER_STATUS_PROPERTY => UserStatus::ON_HOLD->hubspotValue(),
                    Hubspot::HUBSPOT_CONTACT_USER_TYPE => $contactType
                ];

                if(!empty($fields['mobile_number'])) {
                    $hubspotContactInput[Hubspot::HUBSPOT_CONTACT_MOBILE_NUMBER_PROPERTY] = $fields['mobile_number'];
                }

                if(!empty($request['nmls_num'])) {
                    $hubspotContactInput[Hubspot::HUBSPOT_CONTACT_NMLS_PROPERTY] = $request['nmls_num'];
                }

                if(!empty($request['job_title'])) {
                    $hubspotContactInput[Hubspot::HUBSPOT_CONTACT_JOB_TITLE_PROPERTY] = $request['job_title'];
                }

                $hubspotContact = $hubspotRepository->createHubspotContact($hubspotContactInput);

                $assocResponse = $hubspotRepository->associateHubspotContactAndCompany($hubspotContact["id"], $company->hubspot_company_id);

                if (!$assocResponse['success']) {
                    throw new Exception(
                        trans('messages.error.hubspot.failed_assoc'),
                        JsonResponse::HTTP_UNPROCESSABLE_ENTITY
                    );
                }
            }

            $randomPassword = generate_password();

            if ($request->alternative_email) {
                $alternativeEmail = filter_var($fields["alternative_email"], FILTER_VALIDATE_EMAIL);
                if ($alternativeEmail === false) {
                    $fields["alternative_email"] = null;
                }
            }

            $user = User::create([
                'username' => $fields['email'],
                'company_id' => $fields['company_id'],
                'first_name' => $fields['first_name'],
                'last_name' => $fields['last_name'],
                'user_type_id' => $fields['user_type_id'],
                'pricing_engine_id' => $fields['pricing_engine_id'],
                'job_title' => $fields['job_title'],
                'mobile_number' => $fields['mobile_number'],
                'nmls_num' => $fields['nmls_num'],
                'email' => $fields['email'],
                'user_status' => UserStatus::ON_HOLD->value,
                'password' => Hash::make($randomPassword),
                'first_time_login' => true,
                'profile_logo' => $request->file('profile_logo') ? Storage::put('profile_logo', $request->file('profile_logo')) : null,
                'alternative_email' => $fields['alternative_email']
            ]);

            if ($userForHubspot) {
                $user->hubspot_contact_id = $hubspotContact["id"];
            }

            $user->url_identifier = $generator->generateUrlIdentifier($user->id);
            $user->employee_id = $generator->generateEmployeeId($user);
            $user->save();

            $companyBillingType = Hubspot::HUBSPOT_COMPANY_BILLING_TYPE_INDIVIDUAL;

            if ($userForHubspot) {
                $hubspotCompany = $hubspotRepository->getHubspotCompany($company->hubspot_company_id);

                // check if the properties are available or not
                $companyBillingType = check_if_has_array_key($hubspotCompany['properties'], 'billing_type', Hubspot::HUBSPOT_COMPANY_BILLING_TYPE_INDIVIDUAL);
            }

            /**
             * check if the Loan Officer is under the company which is:
             * hubspot billing type = 'individual'
             * OR 
             * Type 2 account
             */
            if (
                $companyBillingType === Hubspot::HUBSPOT_COMPANY_BILLING_TYPE_INDIVIDUAL &&
                $userForHubspot
            ) {
                $url = '/pricing?res=checkout&enterpriseApp=true&companyId=' . $company->hubspot_company_id . '&contactId=' . $hubspotContact["id"];
                $this->emailRepository->sendStripeRedirectEmail($user, $url);
            } else {
                if ($userForHubspot && $company->name !== config('uplist.app_name')) {
                    // update active loan officers in hubspot per company
                    $hubspotHelper->updateHubspotActiveUsers($company);

                    $hubspotRepository->updateHubspotContact(
                        $hubspotContact["id"],
                        [
                            Hubspot::HUBSPOT_CONTACT_USER_STATUS_PROPERTY => UserStatus::ACTIVE->hubspotValue()
                        ]
                    );
                }

                $user->update([
                    'user_status' => UserStatus::ACTIVE,
                ]);

                $invitation = $this->invitation->__invoke([
                    ...$user->only(['email']),
                    'password' => $randomPassword,
                ]);

                SendGridService::send($invitation);
            }

            /**
             * Broadcast if authenticated
             */
            if (auth()->user()) {
                event(new \App\Events\RealTimeUpdateEvent(json_encode([
                    "type" => 'added-user',
                    'payload' => $user,
                    'whois' => auth()->user()->id,
                    'company_id' => auth()->user()->company_id,
                ])));
            }

            DB::commit();
            return $this->success([
                'message' => trans('messages.success.create', [
                    'resource' => 'user'
                ]),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->error([
                'message' => $e->getMessage()
            ], $e->getCode());
        }
    }
}
