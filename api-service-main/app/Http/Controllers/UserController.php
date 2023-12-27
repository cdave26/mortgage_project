<?php

namespace App\Http\Controllers;

use App\Enums\Hubspot;
use App\Enums\ListingStatus;
use App\Enums\UserStatus;
use App\Enums\UserType as UserTypeEnum;
use App\Helpers\HubspotHelper;
use App\Helpers\IDGenerator;
use App\Models\Company;
use App\Models\PricingEngine;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\UserType;
use App\Repositories\EmailRepository;
use App\Repositories\HubspotRepository;
use Carbon\Carbon;
use Exception;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    protected $emailRepository;
    protected $hubspotRepository;
    protected $hubspotHelper;

    private function allowedAccess()
    {
        return [
            UserTypeEnum::UPLIST_ADMIN->id(),
            UserTypeEnum::COMPANY_ADMIN->id(),
            UserTypeEnum::LOAN_OFFICER->id(),
        ];
    }

    public function __construct()
    {
        $this->emailRepository = new EmailRepository();
        $this->hubspotRepository = new HubspotRepository();
        $this->hubspotHelper = new HubspotHelper();
    }

    public function sendVerificationEmail(Request $request): JsonResponse
    {
        $this->validate($request, [
            'email' => 'required|email'
        ]);

        try {
            $user = User::where('email', $request->email)->first();

            if (!$user) {
                throw new Exception(
                    trans('messages.error.not_found', [
                        'resource' => 'user',
                    ]),
                    JsonResponse::HTTP_UNPROCESSABLE_ENTITY
                );
            }

            $this->emailRepository->sendVerificationEmail($user);

            return $this->success([
                'message' => trans('messages.success.email'),
            ]);
        } catch (Exception $e) {
            return $this->error([
                'message' => $e->getMessage()
            ], $e->getCode());
        }
    }

    public function verifyEmail(Request $request): JsonResponse
    {
        $this->validate($request, [
            'token' => 'required'
        ]);

        try {
            $decoded = json_decode(base64_decode(str_replace('_', '/', str_replace('-', '+', explode('.', $request->token)[1]))));

            $user = User::where('email', $decoded->email)->first();

            if (!$user) {
                throw new Exception(
                    trans('messages.error.not_found', [
                        'resource' => 'user',
                    ]),
                    JsonResponse::HTTP_UNPROCESSABLE_ENTITY
                );
            }

            if ($user->email_verified_at) {
                throw new Exception(
                    'Email address already verified.',
                    JsonResponse::HTTP_UNPROCESSABLE_ENTITY
                );
            }

            if ($decoded->code !== "email_verified") {
                throw new Exception(
                    'Invalid email token.',
                    JsonResponse::HTTP_UNPROCESSABLE_ENTITY
                );
            }

            User::where('email', $decoded->email)
                ->update(['email_verified_at' => Carbon::now()]);

            return $this->success([
                'message' => trans('messages.success.verify'),
                'user' => User::where('email', $decoded->email)->first()
            ]);
        } catch (Exception $e) {
            return $this->error([
                'message' => $e->getMessage()
            ], $e->getCode());
        }
    }

    public function createToken(Request $request)
    {
        $token = $request->user()->createToken('sess');

        return ['token' => $token->plainTextToken];
    }

    public function getAll(Request $request): JsonResponse
    {
        $execptionArr = [...$this->allowedAccess(), 0];
        $userType = $request->input('userType');
        $search = $request->input('search');
        $companyId = $request->input('company_id');
        $priceEngineId = $request->input('pricing_engine_id');
        $filteredBy = $request->input('filteredBy');

        if (!in_array($userType, $execptionArr)) {
            return $this->error([
                'message' => trans('messages.error.bad_request')
            ], JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
        }

        $currentUser = Auth::user();

        $users = DB::table('users')
            ->join('user_types', 'users.user_type_id', '=', 'user_types.id')
            ->join('companies', 'users.company_id', '=', 'companies.id')
            ->join('pricing_engines', 'users.pricing_engine_id', '=', 'pricing_engines.id')
            ->join('user_statuses', 'users.user_status', '=', 'user_statuses.id')
            ->whereNull('users.deleted_at')
            ->select(
                'users.id',
                'users.employee_id',
                'users.first_name',
                'users.last_name',
                'users.user_type_id',
                'users.company_id',
                'users.pricing_engine_id',
                'users.created_at',
                'users.nmls_num',
                'users.url_identifier',
                'users.job_title',
                'users.email',
                'users.mobile_number',
                'users.username',
                'users.alternative_email',
                'user_types.name as user_type_name',
                'companies.name as company_name',
                'pricing_engines.name as pricing_engine',
                'user_statuses.id as user_status',
                'user_statuses.description as user_status_desc'
            )
            ->where(function ($query) use ($currentUser) {
                if ($currentUser->user_type_id == UserTypeEnum::UPLIST_ADMIN->id()) {
                    $query->where('users.id', '!=', $currentUser->id);
                } else {
                    $query->where('users.company_id', $currentUser->company_id);
                }
            })
            ->whereNotIn('user_type_id', [ UserTypeEnum::BUYER->id() ])
            ->when($userType == 0, function ($query) use ($currentUser) {
                $query->where('users.id', '!=', $currentUser->id);
            })
            ->when($userType == UserTypeEnum::UPLIST_ADMIN->id(), function ($query) use ($currentUser) {
                $query->where('users.id', '!=', $currentUser->id)
                    ->where('users.user_type_id', '!=', UserTypeEnum::COMPANY_ADMIN->id())
                    ->where('users.user_type_id', '!=', UserTypeEnum::LOAN_OFFICER->id());
            })
            ->when($userType == UserTypeEnum::COMPANY_ADMIN->id(), function ($query) use ($currentUser) {
                $query->where('users.id', '!=', $currentUser->id)
                    ->where('users.user_type_id', '!=', UserTypeEnum::UPLIST_ADMIN->id())
                    ->where('users.user_type_id', '!=', UserTypeEnum::LOAN_OFFICER->id());
            })
            ->when($userType == UserTypeEnum::LOAN_OFFICER->id(), function ($query) use ($currentUser) {
                $query->where('users.id', '!=', $currentUser->id)
                    ->where('users.user_type_id', '!=', UserTypeEnum::UPLIST_ADMIN->id())
                    ->where('users.user_type_id', '!=', UserTypeEnum::COMPANY_ADMIN->id());
            })
            ->where(function ($query) use ($search, $userType, $currentUser) {
                if (empty($search) === false) {

                    if ($userType == 0) {
                        $query->where('users.id', '!=', $currentUser->id)
                            ->where('users.first_name', 'like', '%' . $search . '%')
                            ->orWhere('users.last_name', 'like', '%' . $search . '%')
                            ->orWhere('users.nmls_num', 'like', '%' . $search . '%');
                    }

                    if ($userType == UserTypeEnum::UPLIST_ADMIN->id()) {
                        $query->where('users.id', '!=', $currentUser->id)
                            ->where('users.user_type_id', '!=', UserTypeEnum::COMPANY_ADMIN->id())
                            ->where('users.user_type_id', '!=', 3)
                            ->where('users.first_name', 'like', '%' . $search . '%')
                            ->orWhere('users.last_name', 'like', '%' . $search . '%')
                            ->orWhere('users.nmls_num', 'like', '%' . $search . '%');
                    }

                    if ($userType == UserTypeEnum::COMPANY_ADMIN->id()) {
                        $query->where('users.id', '!=', $currentUser->id)
                            ->where('users.user_type_id', '!=', 3)
                            ->where('users.user_type_id', '!=', UserTypeEnum::UPLIST_ADMIN->id())
                            ->where('users.first_name', 'like', '%' . $search . '%')
                            ->orWhere('users.last_name', 'like', '%' . $search . '%')
                            ->orWhere('users.nmls_num', 'like', '%' . $search . '%');
                    }

                    if ($userType == 3) {
                        $query->where('users.id', '!=', $currentUser->id)
                            ->where('users.user_type_id', '!=', UserTypeEnum::UPLIST_ADMIN->id())
                            ->where('users.user_type_id', '!=', UserTypeEnum::COMPANY_ADMIN->id())
                            ->where('users.first_name', 'like', '%' . $search . '%')
                            ->orWhere('users.last_name', 'like', '%' . $search . '%')
                            ->orWhere('users.nmls_num', 'like', '%' . $search . '%');
                    }
                }
            })
            ->where(function ($query) use ($companyId, $userType, $currentUser) {

                if (empty($companyId) === false) {

                    if ($userType == 0) {
                        $query->where('users.id', '!=', $currentUser->id)
                            ->whereIn('users.company_id', array_map("intval", explode(',',  $companyId)));
                    }

                    if ($userType == UserTypeEnum::UPLIST_ADMIN->id()) {
                        $query->where('users.id', '!=', $currentUser->id)
                            ->where('users.user_type_id', '!=', UserTypeEnum::COMPANY_ADMIN->id())
                            ->where('users.user_type_id', '!=', UserTypeEnum::LOAN_OFFICER->id())
                            ->whereIn('users.company_id', array_map("intval", explode(',',  $companyId)));
                    }

                    if ($userType == UserTypeEnum::COMPANY_ADMIN->id()) {
                        $query->where('users.id', '!=', $currentUser->id)
                            ->where('users.user_type_id', '!=', UserTypeEnum::UPLIST_ADMIN->id())
                            ->where('users.user_type_id', '!=', UserTypeEnum::LOAN_OFFICER->id())
                            ->whereIn('users.company_id', array_map("intval", explode(',',  $companyId)));
                    }

                    if ($userType == UserTypeEnum::LOAN_OFFICER->id()) {
                        $query->where('users.id', '!=', $currentUser->id)
                            ->where('users.user_type_id', '!=', UserTypeEnum::UPLIST_ADMIN->id())
                            ->where('users.user_type_id', '!=', UserTypeEnum::COMPANY_ADMIN->id())
                            ->whereIn('users.company_id', array_map("intval", explode(',',  $companyId)));
                    }
                }
            })
            ->where(function ($query) use ($priceEngineId, $userType, $currentUser) {

                if (empty($priceEngineId) === false) {

                    if ($userType == 0) {
                        $query->where('users.id', '!=', $currentUser->id)
                            ->whereIn('users.pricing_engine_id', array_map("intval", explode(",",  $priceEngineId)));
                    }

                    if ($userType == UserTypeEnum::UPLIST_ADMIN->id()) {
                        $query->where('users.id', '!=', $currentUser->id)
                            ->where('users.user_type_id', '!=', UserTypeEnum::COMPANY_ADMIN->id())
                            ->where('users.user_type_id', '!=', UserTypeEnum::LOAN_OFFICER->id())
                            ->whereIn('users.pricing_engine_id', array_map("intval", explode(",",  $priceEngineId)));
                    }

                    if ($userType == UserTypeEnum::COMPANY_ADMIN->id()) {
                        $query->where('users.id', '!=', $currentUser->id)
                            ->where('users.user_type_id', '!=', UserTypeEnum::UPLIST_ADMIN->id())
                            ->where('users.user_type_id', '!=', UserTypeEnum::LOAN_OFFICER->id())
                            ->whereIn('users.pricing_engine_id', array_map("intval", explode(",",  $priceEngineId)));
                    }

                    if ($userType == UserTypeEnum::LOAN_OFFICER->id()) {
                        $query->where('users.id', '!=', $currentUser->id)
                            ->where('users.user_type_id', '!=', UserTypeEnum::UPLIST_ADMIN->id())
                            ->where('users.user_type_id', '!=', UserTypeEnum::COMPANY_ADMIN->id())
                            ->whereIn('users.pricing_engine_id', array_map("intval", explode(",",  $priceEngineId)));
                    }
                }
            })
            ->where(function ($query) use ($filteredBy, $userType, $currentUser) {
                if (empty($filteredBy) === false) {
                    if ($userType == 0) {
                        $query->where('users.id', '!=', $currentUser->id)
                            ->whereIn('users.user_type_id',  array_map("intval", explode(",",  $filteredBy)));
                    }
                }
            });

        $users = $users->orderBy('users.created_at', 'desc')->get();
        return $this->success($users);
    }

    public function usersList(string $id, string $company_id, string $page, string $limit, Request $request): JsonResponse
    {
        $execptionArr = [0, 1, 2, 3];
        $search = $request->input('search');
        $companyId = $request->input('company_id');
        $priceEngineId = $request->input('pricing_engine_id');
        $userType = $request->input('userType');
        $sortBy = $request->input('sortBy');
        $filteredBy = $request->input('filteredBy');

        if (!in_array($userType, $execptionArr)) {
            return $this->error([
                'message' => trans('messages.error.bad_request')
            ], JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
        }

        $curentUser = User::where('id', $id)->first();

        $users = DB::table('users')
            ->join('user_types', 'users.user_type_id', '=', 'user_types.id')
            ->join('companies', 'users.company_id', '=', 'companies.id')
            ->join('pricing_engines', 'users.pricing_engine_id', '=', 'pricing_engines.id')
            ->join('user_statuses', 'users.user_status', '=', 'user_statuses.id')
            ->whereNull('users.deleted_at')
            ->select(
                'users.id',
                'users.employee_id',
                'users.first_name',
                'users.last_name',
                'users.user_type_id',
                'users.company_id',
                'users.pricing_engine_id',
                'users.created_at',
                'users.nmls_num',
                'users.url_identifier',
                'users.job_title',
                'users.email',
                'users.username',
                'users.alternative_email',
                'user_types.name as user_type_name',
                'companies.name as company_name',
                'pricing_engines.name as pricing_engine',
                'user_statuses.id as user_status',
                'user_statuses.description as user_status_desc'
            )
            ->where(function ($query) use ($id, $company_id,  $curentUser) {
                if ($curentUser->user_type_id == 1) {
                    $query->where('users.id', '!=', $id);
                } else {
                    $query->where('users.company_id', $company_id);
                }
            })
            ->when($userType == 0, function ($query) use ($id) {
                $query->where('users.id', '!=', $id);
            })
            ->when($userType == 1, function ($query) use ($id) {
                $query->where('users.id', '!=', $id)
                    ->where('users.user_type_id', '!=', 2)
                    ->where('users.user_type_id', '!=', 3);
            })
            ->when($userType == 2, function ($query) use ($id) {
                $query->where('users.id', '!=', $id)
                    ->where('users.user_type_id', '!=', 1)
                    ->where('users.user_type_id', '!=', 3);
            })
            ->when($userType == 3, function ($query) use ($id) {
                $query->where('users.id', '!=', $id)
                    ->where('users.user_type_id', '!=', 1)
                    ->where('users.user_type_id', '!=', 2);
            })
            ->where(function ($query) use ($search, $userType, $id) {
                if (empty($search) === false) {

                    if ($userType == 0) {
                        $query->where('users.id', '!=', $id)
                            ->where('users.first_name', 'like', '%' . $search . '%')
                            ->orWhere('users.last_name', 'like', '%' . $search . '%')
                            ->orWhere('users.nmls_num', 'like', '%' . $search . '%');
                    }

                    if ($userType == 1) {
                        $query->where('users.id', '!=', $id)
                            ->where('users.user_type_id', '!=', 2)
                            ->where('users.user_type_id', '!=', 3)
                            ->where('users.first_name', 'like', '%' . $search . '%')
                            ->orWhere('users.last_name', 'like', '%' . $search . '%')
                            ->orWhere('users.nmls_num', 'like', '%' . $search . '%');
                    }

                    if ($userType == 2) {
                        $query->where('users.id', '!=', $id)
                            ->where('users.user_type_id', '!=', 3)
                            ->where('users.user_type_id', '!=', 1)
                            ->where('users.first_name', 'like', '%' . $search . '%')
                            ->orWhere('users.last_name', 'like', '%' . $search . '%')
                            ->orWhere('users.nmls_num', 'like', '%' . $search . '%');
                    }

                    if ($userType == 3) {
                        $query->where('users.id', '!=', $id)
                            ->where('users.user_type_id', '!=', 1)
                            ->where('users.user_type_id', '!=', 2)
                            ->where('users.first_name', 'like', '%' . $search . '%')
                            ->orWhere('users.last_name', 'like', '%' . $search . '%')
                            ->orWhere('users.nmls_num', 'like', '%' . $search . '%');
                    }
                }
            })
            ->where(function ($query) use ($companyId, $userType, $id) {

                if (empty($companyId) === false) {

                    if ($userType == 0) {
                        $query->where('users.id', '!=', $id)
                            ->whereIn('users.company_id', array_map("intval", explode(',',  $companyId)));
                    }

                    if ($userType == 1) {
                        $query->where('users.id', '!=', $id)
                            ->where('users.user_type_id', '!=', 2)
                            ->where('users.user_type_id', '!=', 3)
                            ->whereIn('users.company_id', array_map("intval", explode(',',  $companyId)));
                    }

                    if ($userType == 2) {
                        $query->where('users.id', '!=', $id)
                            ->where('users.user_type_id', '!=', 1)
                            ->where('users.user_type_id', '!=', 3)
                            ->whereIn('users.company_id', array_map("intval", explode(',',  $companyId)));
                    }

                    if ($userType == 3) {
                        $query->where('users.id', '!=', $id)
                            ->where('users.user_type_id', '!=', 1)
                            ->where('users.user_type_id', '!=', 2)
                            ->whereIn('users.company_id', array_map("intval", explode(',',  $companyId)));
                    }
                }
            })
            ->where(function ($query) use ($priceEngineId, $userType, $id) {

                if (empty($priceEngineId) === false) {

                    if ($userType == 0) {
                        $query->where('users.id', '!=', $id)
                            ->whereIn('users.pricing_engine_id', array_map("intval", explode(",",  $priceEngineId)));
                    }

                    if ($userType == 1) {
                        $query->where('users.id', '!=', $id)
                            ->where('users.user_type_id', '!=', 2)
                            ->where('users.user_type_id', '!=', 3)
                            ->whereIn('users.pricing_engine_id', array_map("intval", explode(",",  $priceEngineId)));
                    }

                    if ($userType == 2) {
                        $query->where('users.id', '!=', $id)
                            ->where('users.user_type_id', '!=', 1)
                            ->where('users.user_type_id', '!=', 3)
                            ->whereIn('users.pricing_engine_id', array_map("intval", explode(",",  $priceEngineId)));
                    }

                    if ($userType == 3) {
                        $query->where('users.id', '!=', $id)
                            ->where('users.user_type_id', '!=', 1)
                            ->where('users.user_type_id', '!=', 2)
                            ->whereIn('users.pricing_engine_id', array_map("intval", explode(",",  $priceEngineId)));
                    }
                }
            })
            ->where(function ($query) use ($filteredBy, $userType, $id) {
                if (empty($filteredBy) === false) {
                    if ($userType == 0) {
                        $query->where('users.id', '!=', $id)
                            ->whereIn('users.user_type_id',  array_map("intval", explode(",",  $filteredBy)));
                    }
                }
            })
            ->when($sortBy, function ($query) use ($sortBy) {
                if (empty($sortBy) === false) {
                    $decodedurl = preg_replace("/%u([0-9a-f]{3,4})/i", "&#x\\1;", urldecode($sortBy));
                    $sortBy = json_decode($decodedurl, true);

                    foreach ($sortBy as $key => $value) {
                        $query->orderBy($key, $value);
                    }
                }
            })
            ->whereNotIn('user_type_id', [
                UserTypeEnum::BUYER->id(),
            ])
            ->paginate($limit, ['*'], 'page', $page);

        return $this->success($users);
    }

    //check if email is already taken
    public function checkEmailIfExisted(Request $request): JsonResponse
    {
        $fields =  $request->validate([
            'email' => 'required|string',
        ]);

        try {
            $user = User::where('email', $fields['email'])->first();
            if ($user) {
                return $this->success([
                    'isExisted' => true,
                    'message' => trans('messages.error.email_taken'),

                ]);
            } else {
                return $this->success([
                    'isExisted' => false,
                ]);
            }
        } catch (Exception $e) {
            return $this->error([
                'message' => $e->getMessage()
            ], JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
        }
    }

    public function user(string $company_id, string $id): JsonResponse
    {
        try {
            $userTypeId = Auth::user()->user_type_id;

            if (!in_array($userTypeId, $this->allowedAccess())) {
                throw new Exception(
                    trans('messages.error.bad_request'),
                    JsonResponse::HTTP_UNPROCESSABLE_ENTITY
                );
            }

            $user = User::with(['userStatus']);

            if ($userTypeId === 1) {
                $user->where('id', $id);
            } else {
                $user->where('id', $id)->where('company_id', $company_id);
            }

            $user = $user->first();

            if (!$user) {
                throw new Exception(
                    trans('messages.error.forbidden'),
                    JsonResponse::HTTP_FORBIDDEN
                );
            }

            return $this->success($user);
        } catch (Exception $e) {
            return $this->error([
                'message' => $e->getMessage()
            ], $e->getCode());
        }
    }

    public function updateUser(Request $request): JsonResponse
    {
        $userAuth = Auth::user();

        $generator = new IDGenerator();

        $fields =  $request->validate([
            'id' => 'required|integer|exists:App\Models\User,id',
            'company_id' => 'required|integer|exists:App\Models\Company,id',
            'first_name' => 'required|string|max:50',
            'last_name' => 'required|string|max:50',
            'user_type_id' => 'required|integer|exists:App\Models\UserType,id',
            'pricing_engine_id' => 'required|integer|exists:App\Models\PricingEngine,id',
            'job_title' => 'string|max:50|nullable',
            'mobile_number' => 'string|max:30|nullable',
            'nmls_num' => ['string', 'max:50', 'regex:/^[0-9]*$/i', 'nullable'],
            'email' => 'required|string|unique:users,email,' . $request->id,
            'alternative_email' => 'nullable|string',
            'custom_logo_flyers' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        if ($request->alternative_email) {
            $alternativeEmail = filter_var($fields["alternative_email"], FILTER_VALIDATE_EMAIL);
            if ($alternativeEmail === false) {
                $fields["alternative_email"] = null;
            }
        }


        // if ($request->iscomplete_onboarding) {
        //     $fields['iscomplete_onboarding'] = false;
        // }

        try {
            DB::beginTransaction();

            $user = User::query()->find($fields['id']);
            $pricingEngine = PricingEngine::find($request->pricing_engine_id);

            if (!$user) {
                throw new Exception(
                    trans('messages.error.not_found', [
                        'resource' => 'user',
                    ]),
                    JsonResponse::HTTP_UNPROCESSABLE_ENTITY
                );
            }

            $contactType = match((int) $fields['user_type_id']) {
                UserTypeEnum::COMPANY_ADMIN->id() => Hubspot::USER_TYPE_COMPANY_ADMIN,
                UserTypeEnum::LOAN_OFFICER->id() => Hubspot::USER_TYPE_LOAN_OFFICER,
                default => Hubspot::USER_TYPE_LOAN_OFFICER
            };

            // create hubspot contact
            $hubspotContactInput = [
                'firstname' => $request['first_name'],
                'lastname' => $request['last_name'],
                'email' => $request['email'],
                'pricing_engine' => $pricingEngine->name,
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

            if ($user->hubspot_contact_id) {
                $hubspotContact = $this->hubspotRepository->updateHubspotContact($user->hubspot_contact_id, $hubspotContactInput);
            } else {
                $hubspotContactInput = [
                    ...$hubspotContactInput,
                    Hubspot::HUBSPOT_CONTACT_USER_STATUS_PROPERTY => UserStatus::ACTIVE->hubspotValue(),
                ];

                $usersWithHubspot = [
                    UserTypeEnum::COMPANY_ADMIN->id(),
                    UserTypeEnum::LOAN_OFFICER->id()
                ];
                $userForHubspot = in_array($fields['user_type_id'], $usersWithHubspot);

                if($userForHubspot) {
                    $hubspotContact = $this->hubspotRepository->createHubspotContact($hubspotContactInput);
    
                    // add hubspot contact ID created
                    $user->update(['hubspot_contact_id' => $hubspotContact['id']]);
                }
            }

            // upload profile logo
            if ($request->hasFile('profile_logo')) {
                if ($user->profile_logo && Storage::exists($user->profile_logo)) {
                    Storage::delete($user->profile_logo);
                }

                $fields['profile_logo'] = Storage::put('profile_logo', $request->file('profile_logo'));
            } else {
                if (is_null($request->profile_logo)) {
                    $fields['profile_logo'] = null;
                    if ($user->profile_logo && Storage::exists($user->profile_logo)) {
                        Storage::delete($user->profile_logo);
                    }
                }
            }


            //custom_logo_flyers
            if ($request->hasFile('custom_logo_flyers')) {
                if ($user->custom_logo_flyers && Storage::exists($user->custom_logo_flyers)) {
                    Storage::delete($user->custom_logo_flyers);
                }

                $fields['custom_logo_flyers'] = Storage::put('custom_logo_flyers', $request->file('custom_logo_flyers'));
            } else {
                if (is_null($request->custom_logo_flyers)) {
                    $fields['custom_logo_flyers'] = null;
                    if ($user->custom_logo_flyers && Storage::exists($user->custom_logo_flyers)) {
                        Storage::delete($user->custom_logo_flyers);
                    }
                }
            }

            // update app DB
            $user->update($fields);

            if ($user->wasChanged('company_id')) {
                $user->update([
                    'employee_id' => $generator->generateEmployeeId($user)
                ]);
            }

            if ($userAuth->id !== $user->id) {
                // if (in_array($userAuth->user_type_id, [2, 3])) {
                event(new \App\Events\RealTimeUpdateEvent(json_encode([
                    "type" => 'user-update',
                    'payload' => $user
                ])));
                // }
            }



            DB::commit();
            return $this->success([
                'success' => true,
                'message' => trans('messages.success.update', [
                    'resource' => 'user',
                ]),
                'user' => $user
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->error([
                'success' => false,
                'message' => $e->getMessage()
            ], $e->getCode());
        }
    }

    public function deleteUser(Request $request)
    {
        $fields =  $request->validate([
            'id' => 'required|integer|exists:App\Models\User,id',
            'company_id' => 'required|integer|exists:App\Models\Company,id',
        ]);

        try {
            DB::beginTransaction();
            $user = User::where('company_id', $fields['company_id'])
                ->where('id', $fields['id'])
                ->first();

            if (!$user) {
                throw new Exception(
                    trans('messages.error.not_found', [
                        'resource' => 'user',
                    ]),
                    JsonResponse::HTTP_UNPROCESSABLE_ENTITY
                );
            }
            
            if ($user->hubspot_contact_id) {
                $company = Company::query()->find($user->company_id);
                $this->hubspotHelper->updateHubspotActiveUsers($company);
                // create hubspot contact
                $hubspotContactInput = [
                    Hubspot::HUBSPOT_CONTACT_USER_STATUS_PROPERTY => UserStatus::INACTIVE->hubspotValue(),
                ];

                $this->hubspotRepository->updateHubspotContact($user->hubspot_contact_id, $hubspotContactInput);
            }

            // handle soft delete on listings, flyers, license, 
            // and OB strategy data associated by the user being deleted
            $user->listings()->update([
                'deleted_by' => Auth::id(),
                'listing_status' => ListingStatus::ARCHIVED
            ]);
            $user->listings()->delete();

            $user->licenses()->update(['deleted_by' => Auth::id()]);
            $user->licenses()->delete();

            $user->generatedFlyers()->update(['deleted_by' => Auth::id()]);
            $user->generatedFlyers()->delete();

            $user->optimalBlueStrategy()->delete();

            $user->update([
                'deleted_by' => Auth::id(),
                'user_status' => UserStatus::INACTIVE->value
            ]);
            $user->delete();

            DB::commit();
            return $this->success([
                'message' => trans('messages.success.delete', [
                    'resource' => 'user',
                ]),
                'user' => $user
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->error([
                'message' => $e->getMessage()
            ], $e->getCode());
        }
    }

    public function usersPerCompany(int $companyId): JsonResponse
    {
        $user = Auth::user();

        $userTypeId = $user->user_type_id;
        if (
            !in_array($userTypeId, [
                UserTypeEnum::UPLIST_ADMIN->id(),
                UserTypeEnum::COMPANY_ADMIN->id()
            ])
        ) {
            return $this->error([
                'message' => trans('messages.error.forbidden'),
            ], JsonResponse::HTTP_FORBIDDEN);
        }

        $users = User::query()
            ->select([
                'id',
                'company_id',
                'user_type_id',
                'pricing_engine_id',
                'first_name',
                'last_name',
                'email',
                'mobile_number',
                'url_identifier'
            ])
            ->where('company_id', $companyId)
            ->whereNot('user_type_id', UserTypeEnum::BUYER->id())
            ->get();

        if (!$users) {
            throw new Exception(
                trans('messages.error.not_found', [
                    'resource' => 'users',
                ]),
                JsonResponse::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        return $this->success(['users' => $users]);
    }

    public function completeOnboarding(): JsonResponse
    {
        $userAuth = Auth::user();

        if (!in_array($userAuth->user_type_id, [2, 3])) {
            return $this->error([
                'message' => trans('messages.error.unauthorized')
            ], JsonResponse::HTTP_UNAUTHORIZED);
        }

        $user = User::query()->find($userAuth->id);

        if (!$user) {
            throw new Exception(
                trans('messages.error.not_found', [
                    'resource' => 'users',
                ]),
                JsonResponse::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        $user->update([
            'iscomplete_onboarding' => false
        ]);

        return $this->success(['user' => $user]);
    }

    public function getFullUserList(Request $request): JsonResponse
    {
        $companyId = $request->companyId;

        try {
            $user = Auth::user();
            $userTypeId = $user->user_type_id;
            $company_id = $user->company_id;

            if (!in_array($userTypeId, [1, 2])) {
                return $this->error([
                    'message' => trans('messages.error.unauthorized')
                ], JsonResponse::HTTP_UNAUTHORIZED);
            }

            $users = DB::table('users as u')
                ->where('user_type_id', '!=', 4)
                ->selectRaw(<<<SELECT
                    u.id as user_id,
                    u.company_id as company_id,
                    u.first_name as user_first_name,
                    u.last_name as user_last_name,
                    CONCAT(u.first_name, ' ', u.last_name) as user_full_name
                SELECT);

            if($companyId && $userTypeId === UserTypeEnum::UPLIST_ADMIN->id()) {
                $users->where('u.company_id', '=', $companyId);
            }
                
            if($userTypeId === UserTypeEnum::COMPANY_ADMIN->id()) {
                $users->where('u.company_id', '=', $company_id);
            }

            $users = $users->orderByRaw("LOWER(user_full_name) ASC")->get();

            return $this->success($users);
        } catch (Exception $e) {
            return $this->error([
                'message' => $e->getMessage()
            ], JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
        }
    }
}
