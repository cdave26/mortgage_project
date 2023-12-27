<?php

namespace App\Http\Controllers;

use App\Enums\Hubspot;
use App\Enums\UserStatus as EnumsUserStatus;
use App\Enums\UserType as EnumsUserType;
use App\Helpers\HubspotHelper;
use App\Helpers\IDGenerator;
use App\Models\PricingEngine;
use App\Models\User;
use App\Repositories\EmailRepository;
use App\Repositories\HubspotRepository;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class StripeController extends Controller
{
    protected $emailRepository;

    public function __construct()
    {
        $this->emailRepository = new EmailRepository();
    }
    
    public function createCheckout(Request $request): JsonResponse
    {
        Validator::make($request->toArray(), [
            'price_id' => ['required', 'string'],
            'company_id' => ['required', 'string'],
        ])
        ->stopOnFirstFailure()
        ->validate();
        
        $cancel_url = config('uplist.client_app_url') . '/pricing?res=checkout&companyId=' . $request->company_id;
        $success_url = config('uplist.client_app_url') . '/login?res=success-checkout&session_id={CHECKOUT_SESSION_ID}&companyId=' . $request->company_id;

        if($request->has('contact_id')) {
            $contactIdQuery = '&contactId=' . $request->contact_id;

            $cancel_url = $cancel_url . $contactIdQuery;
            $success_url = $success_url . $contactIdQuery;
        }

        if($request->has('enterprise_app')) {
            $enterpriseQuery = '&enterpriseApp=true';

            $cancel_url = $cancel_url . $enterpriseQuery;
            $success_url = $success_url . $enterpriseQuery;
        }

        $session = \Stripe\Checkout\Session::create([
            'payment_method_types' => ['card'],
            'success_url' => $success_url,
            'cancel_url' => $cancel_url,
            'mode' => 'subscription',
            'line_items' => [[
                'price' => $request['price_id'],
                // For metered billing, do not pass quantity
                'quantity' => 1,
            ]],
            // 'automatic_tax' => [
            //     'enabled' => true,
            // ],
            'allow_promotion_codes' => true,
            'consent_collection' => [
              'terms_of_service' => 'required',
            ],
        ]);

        return $this->success([ 'checkout_url' => $session->url ]);
    }

    /**
     * FOR TYPE 2 OF STRIPE PAYMENT INTEGRATION FLOW
     */
    public function checkoutSuccess(Request $request): JsonResponse
    {
        $stripe = new \Stripe\StripeClient(config('services.stripe.secret'));

        $hubspotRepository = new HubspotRepository();
        $idGenerator = new IDGenerator();
        $hubspotHelper = new HubspotHelper();

        Validator::make($request->toArray(), [
            'session_id' => ['required', 'string'],
            'company_id' => ['required', 'string'],
            'contact_id' => ['required', 'string'],
        ])
        ->stopOnFirstFailure()
        ->validate();

        DB::beginTransaction();
        try {
            $session = $stripe->checkout->sessions->retrieve($request['session_id']);

            if(!$session || $session->status === "expired") {
                throw new Exception(
                    trans('messages.error.hubspot.session_expired'),
                    JsonResponse::HTTP_UNPROCESSABLE_ENTITY
                );
            }

            $randomPassword = generate_password();

            $stripe->customers->retrieve($session->customer);
            
            $hubspotCompany = $hubspotRepository->getHubspotCompany($request->company_id);
            $hubspotContact = $hubspotRepository->getHubspotContact($request->contact_id);

            $this->checkHubspotContactProperties($hubspotContact);

            $enterpriseCompany = $this->createCompany($hubspotCompany, $request->company_id);

            $jobTitle = check_if_has_array_key($hubspotContact['properties'], Hubspot::HUBSPOT_CONTACT_JOB_TITLE_PROPERTY, null);
            $contactNmls = check_if_has_array_key($hubspotContact['properties'], Hubspot::HUBSPOT_CONTACT_NMLS_PROPERTY, null);
            $hubspotUserType = check_if_has_array_key($hubspotContact['properties'], Hubspot::HUBSPOT_CONTACT_USER_TYPE, Hubspot::USER_TYPE_LOAN_OFFICER);
            $hubspotContactPricingEngine = check_if_has_array_key($hubspotContact['properties'], 'pricing_engine', "Optimal Blue");
            $mobileNumber = check_if_has_array_key($hubspotContact['properties'], Hubspot::HUBSPOT_CONTACT_MOBILE_NUMBER_PROPERTY, null);

            $uplistPricingEngine = PricingEngine::where('name', $hubspotContactPricingEngine)->first();

            $userTypeId = match($hubspotUserType) {
                Hubspot::USER_TYPE_COMPANY_ADMIN => EnumsUserType::COMPANY_ADMIN->id(),
                Hubspot::USER_TYPE_LOAN_OFFICER => EnumsUserType::LOAN_OFFICER->id(),
                default => EnumsUserType::LOAN_OFFICER->id()
            };

            $hubspotContactInput = [
                Hubspot::HUBSPOT_CONTACT_USER_STATUS_PROPERTY => EnumsUserStatus::ACTIVE->hubspotValue()
            ];

            /**
             * if the source of the request comes from the uplist web/enterprise app
             */
            if($request->has('enterprise_app')) {
                if(!$request->enterprise_app) {
                    throw new Exception(
                        trans('messages.error.bad_request'),
                        JsonResponse::HTTP_UNPROCESSABLE_ENTITY
                    );
                }

                $user = User::query()->where('hubspot_contact_id', $request->contact_id)->first();
                
                if(!$user) {
                    throw new Exception(
                        trans('messages.error.not_found', [
                            'resource' => 'user',
                        ]),
                        JsonResponse::HTTP_UNPROCESSABLE_ENTITY
                    );
                }
                
                $user->update([
                    'job_title' => $jobTitle,
                    'nmls_num' => $contactNmls,
                    'pricing_engine_id' => $uplistPricingEngine->id,
                    'mobile_number' => format_phone_number($mobileNumber),
                    'user_status' => EnumsUserStatus::ACTIVE,
                    'user_type_id' => $userTypeId,
                    'password' => Hash::make($randomPassword),
                    'stripe_subscription_id' => $session->subscription,
                    'stripe_customer_id' => $session->customer,
                    'subscription_expired_at' => $this->getSubscriptionExpirationData()
                ]);

                $hubspotRepository->updateHubspotContact($user->hubspot_contact_id, $hubspotContactInput);

                // associate Hubspot user and company
                $hubspotRepository->associateHubspotContactAndCompany($hubspotContact["id"], $request->company_id);
                
                // update count of active loan officers in hubspot per company
                $hubspotHelper->updateHubspotActiveUsers($enterpriseCompany);

                // send email
                $this->emailRepository->sendSuccessCheckoutEmail($user, $randomPassword);

                DB::commit();
                return $this->success([
                    'message' => trans('messages.success.process', [
                        'resource' => 'checkout',
                    ]),
                ]);
            } else {
                $user = User::create([
                    'first_name' => $hubspotContact['properties']['firstname'],
                    'last_name' => $hubspotContact['properties']['lastname'],
                    'email' => $hubspotContact['properties']['email'],
                    'job_title' => $jobTitle,
                    'username' => $hubspotContact['properties']['email'],
                    'password' => Hash::make($randomPassword),
                    'mobile_number' => format_phone_number($mobileNumber),
                    'nmls_num' => $contactNmls,
                    'company_id' => $enterpriseCompany->id,
                    'user_type_id' => $userTypeId,
                    'pricing_engine_id' => $uplistPricingEngine->id,
                    'hubspot_contact_id' => $request->contact_id,
                    'first_time_login' => true,
                    'user_status' => EnumsUserStatus::ACTIVE,
                    'stripe_subscription_id' => $session->subscription,
                    'stripe_customer_id' => $session->customer,
                    'subscription_expired_at' => $this->getSubscriptionExpirationData()
                ]);

                $user->url_identifier = $idGenerator->generateUrlIdentifier($user->id);
                $user->employee_id = $idGenerator->generateEmployeeId($user);
                $user->save();

                // update hubspot contact details
                $hubspotRepository->updateHubspotContact($user->hubspot_contact_id, $hubspotContactInput);

                // associate Hubspot user and company
                $hubspotRepository->associateHubspotContactAndCompany($user->hubspot_contact_id, $request->company_id);

                // update count of active loan officers in hubspot per company
                $hubspotHelper->updateHubspotActiveUsers($enterpriseCompany);

                // send email
                $this->emailRepository->sendSuccessCheckoutEmail($user, $randomPassword);

                DB::commit();
                return $this->success([
                    'message' => trans('messages.success.process', [
                        'resource' => 'checkout',
                    ]),
                ]);
            }
        } catch (Exception $e) {
            DB::rollBack();
            return $this->error([
                'success' => false,
                'message' => $e->getMessage()
            ], $e->getCode());
        }
    }
}
