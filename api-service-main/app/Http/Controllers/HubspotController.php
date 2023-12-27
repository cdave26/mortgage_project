<?php

namespace App\Http\Controllers;

use App\Enums\Hubspot;
use App\Enums\UserStatus as EnumsUserStatus;
use App\Enums\UserType as EnumsUserType;
use App\Facades\SendGridService;
use App\Helpers\HubspotHelper;
use App\Helpers\IDGenerator;
use App\Mail\Welcome;
use App\Models\Company;
use App\Models\PricingEngine;
use App\Models\User;
use App\Models\UserStatus;
use App\Models\UserType;
use App\Repositories\EmailRepository;
use App\Repositories\HubspotRepository;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;

class HubspotController extends Controller
{
    public function __construct(
        public EmailRepository $emailRepository,
        public HubspotRepository $hubspotRepository,
        public IDGenerator $idGenerator,
        public HubspotHelper $hubspotHelper,
        public Welcome $invitation,
    ) { }

    public function getContact(Request $request): JsonResponse
    {
        $this->validate($request, [
            'contact_id' => 'required|string'
        ]);

        try {
            $hubspotContact = $this->hubspotRepository->getHubspotContact($request->contact_id);

            $this->checkHubspotContactProperties($hubspotContact);

            if ($request->has('enterprise_app')) {
                if (!$request->enterprise_app) {
                    throw new Exception(
                        trans('messages.error.bad_request'),
                        JsonResponse::HTTP_UNPROCESSABLE_ENTITY
                    );
                }

                $user = User::query()
                    ->where('hubspot_contact_id', $request->contact_id)
                    ->first();

                if (!$user) {
                    throw new Exception(
                        trans('messages.error.not_found', [
                            'resource' => 'user',
                        ]),
                        JsonResponse::HTTP_UNPROCESSABLE_ENTITY
                    );
                }

                if (
                    in_array($user->user_status, [
                        EnumsUserStatus::ACTIVE,
                        EnumsUserStatus::ACTIVE_TRIAL
                    ])
                ) {
                    throw new Exception(
                        trans('messages.error.is_active', [
                            'resource' => 'user',
                        ]),
                        JsonResponse::HTTP_UNPROCESSABLE_ENTITY
                    );
                }

                return $this->success([
                    'message' => trans('messages.success.hubspot.contact_verified'),
                    'hubspot_contact' => $hubspotContact["properties"]
                ]);
            }

            $user = User::query()
                ->where('email', $hubspotContact["properties"]["email"])
                ->orWhere('hubspot_contact_id', $request->contact_id)
                ->first();

            if ($user) {
                throw new Exception(
                    trans('messages.error.hubspot.contact_already_used'),
                    JsonResponse::HTTP_UNPROCESSABLE_ENTITY
                );
            }

            return $this->success([
                'message' => trans('messages.success.hubspot.contact_verified'),
                'hubspot_contact' => $hubspotContact["properties"]
            ]);
        } catch (Exception $e) {
            return $this->error([
                'message' => $e->getMessage()
            ], $e->getCode());
        }
    }

    /**
     * MAXIMUM LIMIT PER REQUEST = 100
     */
    public function getHubspotCompanyList(int $limit): JsonResponse
    {
        $hubspotCompanies = [];
        $lastId = '';

        try {
            // fetch all in a loop in case hubspot companies exceed 100
            do {
                $hubspotCompanyList = $this->hubspotRepository->getHubspotCompanyList($limit, $lastId);
                $results = $hubspotCompanyList->getResults();
                $paging = $hubspotCompanyList->getPaging();

                $hubspotCompanies = [
                    ...$hubspotCompanies,
                    ...$results
                ];

                if($paging) {
                    $lastId = $paging['next']['after'];
                } else {
                    $lastId = '';
                }
            } while ($lastId !== '');

            $company =  DB::table('companies')
                ->select(['hubspot_company_id'])
                ->get()
                ->toArray();

            $mappedAppCompanies = Arr::map($company, function ($com) {
                return $com->hubspot_company_id;
            });

            $filteredResults = Arr::where($hubspotCompanies, function ($comp) use ($mappedAppCompanies) {
                return !in_array($comp['id'], $mappedAppCompanies);
            });

            return $this->success([
                'hubspot_company_list' =>  [
                    'results' =>  [...$filteredResults],
                ]
            ]);
        } catch (Exception $e) {
            return $this->error([
                'message' => $e->getMessage()
            ], $e->getCode());
        }
    }

    public function getCompany(Request $request): JsonResponse
    {
        Validator::make($request->toArray(), [
            'company_id' => ['required', 'string'],
            'billing_type' => ['required', 'string', 'in:' . implode(",", [Str::lower(Hubspot::HUBSPOT_COMPANY_BILLING_TYPE_INDIVIDUAL), Str::lower(Hubspot::HUBSPOT_COMPANY_BILLING_TYPE_ENTERPRISE)])]
        ])
        ->stopOnFirstFailure()
        ->validate();

        try {
            $hubspotCompanyId = $request->company_id;

            $company = Company::query()
                ->where('hubspot_company_id', $hubspotCompanyId)
                ->first();

            if (!$company) {
                throw new Exception(
                    trans('messages.error.api_db_not_found', [
                        'resource' => 'company',
                    ]),
                    JsonResponse::HTTP_UNPROCESSABLE_ENTITY
                );
            }

            $hubspotCompany = $this->hubspotRepository->getHubspotCompany($hubspotCompanyId);

            $this->checkHubspotCompanyProperties($hubspotCompany);

            /**
             * perform checking of billing type per company
             */
            $billingType = check_if_has_array_key($hubspotCompany['properties'], 'billing_type', Hubspot::HUBSPOT_COMPANY_BILLING_TYPE_INDIVIDUAL);
            $isPayingLoanOfficers = check_if_has_array_key($hubspotCompany['properties'], Hubspot::HUBSPOT_COMPANY_IS_PAYING_FOR_LO, false);

            if ($request->billing_type === Hubspot::HUBSPOT_COMPANY_BILLING_TYPE_ENTERPRISE) {
                if ($billingType === Hubspot::HUBSPOT_COMPANY_BILLING_TYPE_INDIVIDUAL) {
                    throw new Exception(
                        trans('messages.error.hubspot.invalid_billing_type', [
                            'resource' => 'Enterprise',
                        ]),
                        JsonResponse::HTTP_UNPROCESSABLE_ENTITY
                    );
                }

                if ($isPayingLoanOfficers === "false") {
                    throw new Exception(
                        trans('messages.error.hubspot.is_paying_loan_officers'),
                        JsonResponse::HTTP_UNPROCESSABLE_ENTITY
                    );
                }
            }

            if (
                $request->billing_type === Hubspot::HUBSPOT_COMPANY_BILLING_TYPE_INDIVIDUAL &&
                $billingType === Hubspot::HUBSPOT_COMPANY_BILLING_TYPE_ENTERPRISE
            ) {
                throw new Exception(
                    trans('messages.error.hubspot.invalid_billing_type', [
                        'resource' => 'Individual',
                    ]),
                    JsonResponse::HTTP_UNPROCESSABLE_ENTITY
                );
            }

            return $this->success([
                'message' => trans('messages.success.hubspot.company_verified'),
                'hubspot_company' => $hubspotCompany["properties"]
            ]);
        } catch (Exception $e) {
            return $this->error([
                'message' => $e->getMessage()
            ], $e->getCode());
        }
    }

    /**
     * FOR TYPE 1 OF STRIPE PAYMENT INTEGRATION FLOW
     * 
     * HubSpot Companies must have the following properties and data:
     * Billing Type = "enterprise"
     * Is paying loan officers = "true"
     * 
     */
    public function processHubspotContact(Request $request): JsonResponse
    {
        Validator::make($request->toArray(), [
            'contact_id' => ['required'],
            'company_id' => ['required'],
        ])
        ->stopOnFirstFailure()
        ->validate();

        DB::beginTransaction();
        try {
            $hubspotCompany = $this->hubspotRepository->getHubspotCompany($request->company_id);
            $hubspotContact = $this->hubspotRepository->getHubspotContact($request->contact_id);

            $this->checkHubspotContactProperties($hubspotContact);

            // check if the properties are available or not
            $billingType = check_if_has_array_key($hubspotCompany['properties'], 'billing_type', Hubspot::HUBSPOT_COMPANY_BILLING_TYPE_INDIVIDUAL);
            $isPayingLoanOfficers = check_if_has_array_key($hubspotCompany['properties'], Hubspot::HUBSPOT_COMPANY_IS_PAYING_FOR_LO, "false");

            if ($billingType !== Hubspot::HUBSPOT_COMPANY_BILLING_TYPE_ENTERPRISE) {
                throw new Exception(
                    trans('messages.error.hubspot.invalid_billing_type', [
                        'resource' => 'Enterprise',
                    ]),
                    JsonResponse::HTTP_UNPROCESSABLE_ENTITY
                );
            }

            if ($isPayingLoanOfficers !== "true") {
                throw new Exception(
                    trans('messages.error.hubspot.is_paying_loan_officers'),
                    JsonResponse::HTTP_UNPROCESSABLE_ENTITY
                );
            }

            $contactNmls = check_if_has_array_key($hubspotContact['properties'], Hubspot::HUBSPOT_CONTACT_NMLS_PROPERTY, null);
            $jobTitle = check_if_has_array_key($hubspotContact['properties'], Hubspot::HUBSPOT_CONTACT_JOB_TITLE_PROPERTY, null);
            $hubspotUserType = check_if_has_array_key($hubspotContact['properties'], Hubspot::HUBSPOT_CONTACT_USER_TYPE, Hubspot::USER_TYPE_LOAN_OFFICER);
            $hubspotContactPricingEngine = check_if_has_array_key($hubspotContact['properties'], 'pricing_engine', "Optimal Blue");
            $mobileNumber = check_if_has_array_key($hubspotContact['properties'], Hubspot::HUBSPOT_CONTACT_MOBILE_NUMBER_PROPERTY, null);
            $hubspotUserStatus = $hubspotContact['properties'][Hubspot::HUBSPOT_CONTACT_USER_STATUS_PROPERTY];

            // find or create a new company record
            $enterpriseCompany = $this->createCompany($hubspotCompany, $request->company_id);

            $uplistPricingEngine = PricingEngine::query()
                ->where('name', $hubspotContactPricingEngine)
                ->first();

            $userStatus = UserStatus::query()
                ->where('hubspot_value', $hubspotUserStatus)
                ->first();

            $randomPassword = generate_password();

            $userTypeId = match($hubspotUserType) {
                Hubspot::USER_TYPE_COMPANY_ADMIN => EnumsUserType::COMPANY_ADMIN->id(),
                Hubspot::USER_TYPE_LOAN_OFFICER => EnumsUserType::LOAN_OFFICER->id(),
                default => EnumsUserType::LOAN_OFFICER->id()
            };

            $user = User::query()->create([
                'first_name' => $hubspotContact['properties']['firstname'],
                'last_name' => $hubspotContact['properties']['lastname'],
                'email' => $hubspotContact['properties']['email'],
                'username' => $hubspotContact['properties']['email'],
                'job_title' => $jobTitle,
                'mobile_number' => format_phone_number($mobileNumber),
                'nmls_num' => $contactNmls,
                'password' => Hash::make($randomPassword),
                'user_type_id' => $userTypeId,
                'pricing_engine_id' => $uplistPricingEngine->id,
                'company_id' => $enterpriseCompany->id,
                'first_time_login' => true,
                'user_status' => $userStatus->id,
                'hubspot_contact_id' => $request->contact_id
            ]);

            $user->url_identifier = $this->idGenerator->generateUrlIdentifier($user->id);
            $user->employee_id = $this->idGenerator->generateEmployeeId($user);
            $user->save();

            // associate Hubspot user and company
            $this->hubspotRepository->associateHubspotContactAndCompany($hubspotContact["id"], $request->company_id);

            // update count of active loan officers in hubspot per company
            $this->hubspotHelper->updateHubspotActiveUsers($enterpriseCompany);

            $invitation = $this->invitation->__invoke([
                ...$user->only(['email']),
                'password' => $randomPassword,
            ]);

            SendGridService::send($invitation);

            DB::commit();

            return $this->success([
                'message' => trans('messages.success.process', [
                    'resource' => 'contact',
                ]),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->error([
                'message' => $e->getMessage()
            ], $e->getCode());
        }
    }

    /**
     * FOR TYPE 3 OF STRIPE PAYMENT INTEGRATION FLOW
     */
    public function processHubspotWithoutContact(Request $request): JsonResponse
    {
        $stripe = new \Stripe\StripeClient(config('services.stripe.secret'));

        Validator::make($request->toArray(), [
            'session_id' => 'required',
            'company_id' => ['required', 'string'],
            'pricing_engine_id' => [
                'required',
                'integer',
                'exists:App\Models\PricingEngine,id'
            ],
            'first_name' => ['required', 'string', 'max:50'],
            'last_name' => ['required', 'string', 'max:50'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique(User::class),
            ],
            'mobile_number' => ['nullable', 'string', 'max:30'],
            'job_title' => ['nullable', 'string', 'max:50'],
            'nmls_num' => ['nullable', 'string', 'max:50', 'regex:/^[0-9]*$/i'],
        ])
        ->stopOnFirstFailure()
        ->validate();

        DB::beginTransaction();
        try {
            $session = $stripe->checkout->sessions->retrieve($request->session_id);

            if (!$session || $session->status === "expired") {
                throw new Exception(
                    trans('messages.error.hubspot.session_expired'),
                    JsonResponse::HTTP_UNPROCESSABLE_ENTITY
                );
            }

            $userTypeLoanOfficer = UserType::query()->where('name', EnumsUserType::LOAN_OFFICER)->first();
            $pricingEngineId = PricingEngine::query()->find($request->pricing_engine_id);

            $hubspotCompany = $this->hubspotRepository->getHubspotCompany($request->company_id);

            $enterpriseCompany = $this->createCompany($hubspotCompany, $request->company_id);

            $contactType = match($userTypeLoanOfficer->id) {
                EnumsUserType::COMPANY_ADMIN->id() => Hubspot::USER_TYPE_COMPANY_ADMIN,
                EnumsUserType::LOAN_OFFICER->id() => Hubspot::USER_TYPE_LOAN_OFFICER,
                default => Hubspot::USER_TYPE_LOAN_OFFICER,
            };

            // create hubspot contact
            $hubspotContactInput = [
                'firstname' => $request['first_name'],
                'lastname' => $request['last_name'],
                'email' => $request['email'],
                'pricing_engine' => $pricingEngineId->name,
                Hubspot::HUBSPOT_CONTACT_USER_STATUS_PROPERTY => EnumsUserStatus::ACTIVE->hubspotValue(),
                Hubspot::HUBSPOT_CONTACT_USER_TYPE => $contactType,
            ];

            if(!empty($request['mobile_number'])) {
                $hubspotContactInput[Hubspot::HUBSPOT_CONTACT_MOBILE_NUMBER_PROPERTY] = $request['mobile_number'];
            }

            if(!empty($request['nmls_num'])) {
                $hubspotContactInput[Hubspot::HUBSPOT_CONTACT_NMLS_PROPERTY] = $request['nmls_num'];
            }

            if(!empty($request['job_title'])) {
                $hubspotContactInput[Hubspot::HUBSPOT_CONTACT_JOB_TITLE_PROPERTY] = $request['job_title'];
            }

            $hubspotContact = $this->hubspotRepository->createHubspotContact($hubspotContactInput);
            $this->hubspotRepository->associateHubspotContactAndCompany($hubspotContact["id"], $request->company_id);

            $randomPassword = generate_password();

            $user = User::query()->create([
                'first_name' => $request['first_name'],
                'last_name' => $request['last_name'],
                'email' => $request['email'],
                'job_title' => $request['job_title'],
                'username' => $request['email'],
                'password' => Hash::make($randomPassword),
                'mobile_number' => $request['mobile_number'],
                'nmls_num' => $request["nmls_num"],
                'company_id' => $enterpriseCompany->id,
                'user_type_id' => $userTypeLoanOfficer->id,
                'pricing_engine_id' => $request['pricing_engine_id'],
                'first_time_login' => true,
                'user_status' => EnumsUserStatus::ACTIVE,
                'hubspot_contact_id' => $hubspotContact["id"],
                'stripe_subscription_id' => $session->subscription,
                'stripe_customer_id' => $session->customer,
                'subscription_expired_at' => $this->getSubscriptionExpirationData()
            ]);

            $user->url_identifier = $this->idGenerator->generateUrlIdentifier($user->id);
            $user->employee_id = $this->idGenerator->generateEmployeeId($user);
            $user->save();

            // update count of active loan officers in hubspot per company
            $this->hubspotHelper->updateHubspotActiveUsers($enterpriseCompany);

            $this->emailRepository->sendSuccessCheckoutEmail($user, $randomPassword);

            DB::commit();
            return $this->success([
                'message' => trans('messages.success.process', [
                    'resource' => 'contact',
                ]),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->error([
                'message' => $e->getMessage()
            ], $e->getCode());
        }
    }

    /**
     * Search for a company in Hubspot
     */

    public function searchHubspotCompany(Request $request): JsonResponse
    {
        try {
            $query = $request->query->get('query');

            $company = Company::query()
                ->where('name', $query)
                ->first();

            if ($company) {
                throw new Exception(
                    trans('messages.error.exist', [
                        'resource' => 'company',
                    ]),
                    JsonResponse::HTTP_UNPROCESSABLE_ENTITY
                );
            }

            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' . config('services.hubspot.key')
            ])->post('https://api.hubapi.com/crm/v3/objects/companies/search', [
                "query" => $query
            ]);

            $result = $response->json()['results'];

            foreach ($result as $key => $value) {
                $uplistData = Company::query()
                    ->where('name', $value['properties']['name'])
                    ->get();
                foreach ($uplistData as $keyss => $valueee) {
                    if ($valueee->name == $value['properties']['name']) {
                        unset($result[$key]);
                    }
                }
            }


            return $this->success([
                'results' => $result
            ]);
        } catch (Exception $e) {
            return $this->error([
                'message' => $e->getMessage()
            ], $e->getCode());
        }
    }
}
