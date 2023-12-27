<?php

namespace App\Http\Controllers;

use App\Enums\Hubspot;
use App\Enums\UserStatus;
use App\Models\Company;
use App\Models\CompanyStateLicense;
use App\Models\Listing;
use App\Models\PricingEngine;
use App\Models\User;
use Illuminate\Http\Request;
use Exception;
use App\Repositories\HubspotRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CompanyController extends Controller
{
    protected $hubspotRepository;

    public function __construct()
    {
        $this->hubspotRepository = new HubspotRepository();
    }

    private $userType = [1, 2]; //can only retrieve uplist admin in company admin

    public function companyPerUser(): JsonResponse
    {
        try {
            $curentUser = Auth::user();
            $company = Company::where(function ($query) use ($curentUser) {
                if ($curentUser->user_type_id == 1) {
                    $query->where('id', '!=', 0);
                } else {
                    $query->where('id', $curentUser->company_id);
                }
            })
            ->orderBy('name')
            ->get();

            return $this->success($company);
        } catch (Exception $e) {
            return $this->error([
                'message' => $e->getMessage()
            ], JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
        }
    }

    public function companyList(Request $request): JsonResponse
    {
        $name = $request->name;
        $license = $request->company_nmls_number;
        $state = $request->state;

        $currentUser = Auth::user();

        try {
            $company = Company::with(['companyStateLicenses.company', 'companyStateLicenses.state'])
                ->where(function ($query) use ($currentUser) {
                    if ($currentUser->user_type_id == 1) {
                        $query->where('id', '!=', 0);
                    } else {
                        $query->where('id', $currentUser->company_id);
                    }
                });

            if($name) {
                $company->where('name', 'like', '%' . $name . '%');
            };

            if($license) {
                $company->where('company_nmls_number', 'like', '%' . $license . '%');
            }

            if($state) {
                $company->whereIn('state',  explode(',', $this->decodedURL($state)));
            }
                
            $company = $company->get();
            
            return $this->success($company);
        } catch (Exception $e) {
            return $this->error([
                'message' => $e->getMessage()
            ], JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
        }
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $curentUser = Auth::user();

            $limit = $request->limit;
            $page = $request->page;
            $name = $request->name;
            $license = $request->company_nmls_number;
            $state = $request->state;
            $sortBy = $request->sortBy;

            $company = Company::where(function ($query) use ($curentUser) {
                if ($curentUser->user_type_id == 1) {
                    $query->where('id', '!=', 0);
                } else if ($curentUser->user_type_id == 2) {
                    //query for company admin
                    $query->where('id', $curentUser->company_id);
                }
            })
                ->where(function ($query) use ($name) {
                    if ($name) {
                        $query->where('name', 'like', '%' . $name . '%');
                    }
                })
                ->where(function ($query) use ($license) {
                    if ($license) {
                        $query->where('company_nmls_number', 'like', '%' . $license . '%');
                    }
                })
                ->where(function ($query) use ($state) {
                    if ($state) {
                        $query->whereIn('state',  explode(',', $this->decodedURL($state)));
                    }
                })
                ->when($sortBy, function ($query) use ($sortBy) {
                    if ($sortBy) {
                        $sortBy = json_decode($this->decodedURL($sortBy), true);
                        foreach ($sortBy as $key => $value) {
                            $query->orderBy($key, $value);
                        }
                    }
                })
                ->paginate($limit, ['*'], 'page', $page);
            return $this->success($company);
        } catch (Exception $e) {
            return $this->error([
                'message' => $e->getMessage()
            ], JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
        }
    }

    public function store(Request $request): JsonResponse
    {
        $userAuth = Auth::user();
        $fields = $request->validate([
            'name' => 'required|string|max:255|unique:companies',
            'has_company_msa' => 'required|string|in:true,false',
            'license' => 'required|json',
            'address' => 'required|string|max:50',
            'city' => 'required|string|max:30',
            'state' => 'required|string|max:30',
            'zip' => 'required|string|max:20',
            'company_logo' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'header_background_color' => 'nullable|string|max:20',
            'header_text_color' => 'nullable|string|max:20',
            'company_privacy_policy_URL' => 'required|string|url',
            'company_terms_of_tervice_URL' => 'nullable|string|url',
            'company_nmls_number' => ['required', 'string', 'max:30', 'regex:/^\+?\d*$/'], // removed unique to avoid conflict with hubspot
            'company_mobile_number' => 'required|string|max:20',
            'additional_details' => 'nullable|string|max:500',
            'state_metadata' => 'required|json',
            'is_enterprise' => 'nullable|string|in:true,false',
            'enterprise_max_users' => 'nullable|integer',
            'hubspot_company_id' => 'nullable|string|max:255',
            'pricing_engine_id' => 'required|integer|exists:App\Models\PricingEngine,id',
            'equal_housing' => 'required|string',
            // 'allow_access_to_buyer_app' => 'required|string|in:true,false', for future purpose
            'allow_loan_officer_to_upload_logo' => 'required|string|in:true,false',
        ]);

        try {
            DB::beginTransaction();

            $name = $fields['name'];

            $code = Str::of($name)
                ->replaceMatches('/[^a-zA-Z\s]+/i', '')
                ->lower()
                ->kebab()
                ->toString();

            $licenseArr = json_decode($fields['license']);

            $company = Company::create([
                'code' => $code,
                'name' => $name,
                'has_company_msa' => $fields['has_company_msa'] == 'true' ? 1 : 0,
                'address' => $fields['address'],
                'city' => $fields['city'],
                'state' => $fields['state'],
                'zip' => $fields['zip'],
                'company_logo' =>  $request->file('company_logo') ? Storage::put('company_logo', $request->file('company_logo')) : null,
                'header_background_color' => $fields['header_background_color'],
                'header_text_color' => $fields['header_text_color'],
                'company_privacy_policy_URL' => $fields['company_privacy_policy_URL'],
                'company_terms_of_tervice_URL' => $fields['company_terms_of_tervice_URL'],
                'company_nmls_number' => $fields['company_nmls_number'],
                'company_mobile_number' => $fields['company_mobile_number'],
                'additional_details' => $fields['additional_details'],
                'is_enterprise' => $fields['is_enterprise'] === 'true' ? 1 : 0,
                'enterprise_max_users' => $fields['enterprise_max_users'],
                'hubspot_company_id' => $fields['hubspot_company_id'],
                'pricing_engine_id' => $fields['pricing_engine_id'],
                'equal_housing' => $fields['equal_housing'],
                // 'allow_access_to_buyer_app' => $fields['allow_access_to_buyer_app'] == 'true' ? 1 : 0, for future purpose
                'allow_loan_officer_to_upload_logo' => $fields['allow_loan_officer_to_upload_logo'] == 'true' ? 1 : 0,
            ]);

            $this->createCompanyStateLicense($licenseArr,  $company->id,   json_decode($fields['state_metadata']));

            /**
             * Broadcast to all uplist admin
             */

            if (in_array($userAuth->user_type_id, [1])) {
                event(new \App\Events\RealTimeUpdateEvent(json_encode([
                    "type" => 'added-company',
                    'payload' => $company,
                    'whois' => $userAuth->id,
                ])));
            }

            DB::commit();
            return $this->success([
                'message' => trans('messages.success.dynamic', [
                    'beginning' => 'The',
                    'resource' => 'company',
                    'super' => 'was',
                    'action' => 'created!',
                ]),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->error([
                'message' => $e->getMessage()
            ], JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
        }
    }

    public function update(int $id, Request $request): JsonResponse
    {
        $userAuth = Auth::user();
        $fields = $request->validate([
            'name' => 'required|string|max:255|unique:companies,name,' . $id,
            'has_company_msa' => 'required|string|in:true,false',
            'license' => 'required|json',
            'address' => 'required|string|max:50',
            'city' => 'required|string|max:30',
            'state' => 'required|string|max:30',
            'zip' => 'required|string|max:20',
            'company_logo' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'header_background_color' => 'nullable|string|max:20',
            'header_text_color' => 'nullable|string|max:20',
            'company_privacy_policy_URL' => 'required|string|url',
            'company_terms_of_tervice_URL' => 'nullable|string|url',
            'company_nmls_number' => ['required', 'string', 'max:30', 'regex:/^\+?\d*$/'], // removed unique to avoid conflict with hubspot
            'company_mobile_number' => 'required|string|max:20',
            'additional_details' => 'nullable|string|max:500',
            'state_metadata' => 'required|json',
            'pricing_engine_id' => 'required|integer|exists:App\Models\PricingEngine,id',
            'equal_housing' => 'required|string',
            // 'allow_access_to_buyer_app' => 'required|string|in:true,false', for future purpose 
            'allow_loan_officer_to_upload_logo' => 'required|string|in:true,false', //todo remove in:true,false

        ]);

        try {
            DB::beginTransaction();

            $company = Company::find($id);

            if (!$company) {
                throw new Exception(
                    trans('messages.error.not_found', [
                        'resource' => 'company',
                    ]),
                    JsonResponse::HTTP_UNPROCESSABLE_ENTITY
                );
            }

            $licenseArr = json_decode($fields['license']);

            $pricingEngine = PricingEngine::query()->find($fields['pricing_engine_id']);

            $hubspotCompanyInput = array_merge(Arr::only($fields, [
                'name',
                'address',
                'city',
                'state',
                'zip',
                'header_background_color',
                'header_text_color',
            ]), [
                Hubspot::HUBSPOT_COMPANY_NMLS_NUM => $fields['company_nmls_number'],
                Hubspot::HUBSPOT_COMPANY_PHONE => $fields['company_mobile_number'],
                'pricing_engine' => $pricingEngine->name,
                Hubspot::HUBSPOT_COMPANY_PRIVACY_POLICY_URL => $fields['company_privacy_policy_URL'],
                Hubspot::HUBSPOT_COMPANY_TERMS_OF_SERVICE_URL => $fields['company_terms_of_tervice_URL'],
            ]);

            $this->updateCompanyStateLicense($licenseArr, $company->id, json_decode($fields['state_metadata']));

            // sync update with Hubspot
            if ($company->hubspot_company_id) {
                $this->hubspotRepository->updateHubspotCompany($company->hubspot_company_id, $hubspotCompanyInput);
            }

            $companyLogo = $company->company_logo;

            if ($request->file('company_logo')) {
                if ($company->company_logo && Storage::exists($company->company_logo)) {
                    Storage::delete($company->company_logo);
                }

                $companyLogo = Storage::put('company_logo', $request->file('company_logo'));
            }

            $company->update([
                'name' => $fields['name'],
                'has_company_msa' => $fields['has_company_msa'] == 'true' ? 1 : 0,
                'address' => $fields['address'],
                'city' => $fields['city'],
                'state' => $fields['state'],
                'zip' => $fields['zip'],
                'company_logo' => $companyLogo,
                'header_background_color' => $fields['header_background_color'],
                'header_text_color' => $fields['header_text_color'],
                'company_privacy_policy_URL' => $fields['company_privacy_policy_URL'],
                'company_terms_of_tervice_URL' => $fields['company_terms_of_tervice_URL'],
                'company_nmls_number' => $fields['company_nmls_number'],
                'company_mobile_number' => $fields['company_mobile_number'],
                'additional_details' => $fields['additional_details'],
                'pricing_engine_id' => $fields['pricing_engine_id'],
                'equal_housing' => $fields['equal_housing'],
                // 'allow_access_to_buyer_app' => $fields['allow_access_to_buyer_app'] == 'true' ? 1 : 0, for future purpose
                'allow_loan_officer_to_upload_logo' => $fields['allow_loan_officer_to_upload_logo'] == 'true' ? 1 : 0,
            ]);

            // if (in_array($userAuth->user_type_id, [2, 3])) {
            event(new \App\Events\RealTimeUpdateEvent(json_encode([
                "type" => 'company-update',
                'payload' => $company,
                'whoisUpdating' => $userAuth->id,
            ])));
            // }

            DB::commit();
            return $this->success([
                'message' => $userAuth->user_type_id == 1 ?  trans('messages.success.update', [
                    'resource' => 'company',
                ]) : trans('messages.success.dynamic', [
                    'beginning' => 'Your',
                    'resource' => 'company',
                    'super' => 'was',
                    'action' => 'updated.',
                ]),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->error([
                'message' => $e->getMessage()
            ], $e->getCode());
        }
    }

    public function delete(int $id): JsonResponse
    {
        $authUser = Auth::user();

        try {

            /**
             * Uplist Admin: Can delete any company
             */
            if ($authUser->user_type_id != 1) {
                return $this->error([
                    'message' => trans('messages.error.unauthorized')
                ], JsonResponse::HTTP_UNAUTHORIZED);
            }


            DB::beginTransaction();

            $company = Company::query()->find($id);

            $user =  User::query()->where('company_id', $id)
                ->where(function ($query) {
                    $query->whereNull('deleted_at')
                        ->orWhere('user_status', UserStatus::ACTIVE->value)
                        ->orWhere('user_status', UserStatus::ACTIVE_TRIAL->value);
                })
                ->get();
            /**
             * if company has user, cannot delete
             */

            if (count($user) > 0) {
                throw new Exception(
                    trans('messages.error.relationship.delete', [
                        'resource' => 'company',
                    ]),
                    JsonResponse::HTTP_UNPROCESSABLE_ENTITY
                );
            }

            if (!$company) {
                throw new Exception(
                    trans('messages.error.not_found', [
                        'resource' => 'company',
                    ]),
                    JsonResponse::HTTP_UNPROCESSABLE_ENTITY
                );
            }

            // check if license is being used in listing
            $checkCompany = Listing::query()
                ->where('company_id', $id)
                ->first();

            if ($checkCompany) {
                throw new Exception(
                    trans('messages.error.relationship.delete', [
                        'resource' => 'company',
                    ]),
                    JsonResponse::HTTP_UNPROCESSABLE_ENTITY
                );
            }

            $company->update(['deleted_by' =>  Auth::id()]);
            $company->delete();

            $this->deleteStateLicense($company->id);

            DB::commit();
            return $this->success([
                'message' => trans('messages.success.dynamic', [
                    'beginning' => 'The',
                    'resource' => 'company',
                    'super' => 'was',
                    'action' => 'deleted.',
                ]),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->error([
                'message' => $e->getMessage()
            ], JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
        }
    }

    public function view(int $id): JsonResponse
    {
        try {
            $user = Auth::user();

            if (!in_array($user->user_type_id, $this->userType)) {
                throw new Exception(
                    trans('messages.error.bad_request'),
                    JsonResponse::HTTP_UNPROCESSABLE_ENTITY
                );
            }

            //Company Admin: Only access to their company
            if ($user->user_type_id === 2 && $user->company_id !== $id) {
                throw new Exception(
                    trans('messages.error.forbidden'),
                    JsonResponse::HTTP_FORBIDDEN
                );
            }

            $company = Company::find($id);

            if (!$company) {
                throw new Exception(
                    trans('messages.error.not_found', [
                        'resource' => 'company',
                    ]),
                    JsonResponse::HTTP_NOT_FOUND
                );
            }

            $stateLicense = CompanyStateLicense::where('company_id', $id)->get();

            if (!$stateLicense) {
                throw new Exception(
                    trans('messages.error.generic'),
                    JsonResponse::HTTP_UNPROCESSABLE_ENTITY
                );
            }

            $company->licenseState = $stateLicense->map(function ($state) {
                return [
                    'license' => [
                        'license' =>  $state->license,
                        'state_id' => $state->state_id,
                        'metadata' => $state->state_metadata,
                    ]
                ];
            });

            $loginURL = implode([
                config('uplist.client_app_url'),
                "/$company->code/login",
            ]);

            return $this->success([
                ...$company->toArray(),
                'login_url' => $loginURL,
            ]);
        } catch (Exception $e) {
            return $this->error([
                'message' => $e->getMessage()
            ], $e->getCode());
        }
    }

    private function createCompanyStateLicense(array $licenseArr, int $id,  $stateMetadata)
    {
        foreach ($licenseArr as $obj) {
            CompanyStateLicense::create([
                'company_id' => $id,
                'state_id' => $obj->license->state_id,
                'license' => $obj->license->license_number,
                "state_metadata" => $stateMetadata
            ]);
        }
    }

    private function updateCompanyStateLicense(array $licenseArr, int $id,  $stateMetadata)
    {
        $newStateIdArr = [];
        $exceptioStateId = [];

        foreach ($licenseArr as $obj) {
            $licensedStateId = $obj->license->state_id;

            $companyStateLicense =  CompanyStateLicense::where('company_id', $id)
                ->where('state_id', $licensedStateId)
                ->get();

            if ($companyStateLicense) {
                if (count($companyStateLicense) > 0) {
                    foreach ($companyStateLicense as $stateLicense) {
                        if ($stateLicense->state_id == $licensedStateId) {
                            if (!$obj->license->isRemove) {
                                $stateLicense::where('company_id', $id)
                                    ->where('state_id', $stateLicense->state_id)
                                    ->update([
                                        'company_id' => $id,
                                        'state_id' => $licensedStateId,
                                        'license' => $obj->license->license_number,
                                        'state_metadata' => $stateMetadata
                                    ]);
                                array_push($exceptioStateId, $licensedStateId);
                            }

                            if ($obj->license->isRemove) {
                                $checkLicense = DB::table('licenses as l')
                                    ->leftJoin('users as u', 'u.id', '=', 'l.user_id')
                                    ->where('u.company_id', '=', $id)
                                    ->where('l.state_id', '=', $licensedStateId)
                                    ->whereNull('l.deleted_at')
                                    ->get();

                                if (count($checkLicense) > 0) {
                                    $message = trans('messages.error.relationship.delete', [
                                        'resource' => 'company state license',
                                    ]);
                                    throw new Exception($message, JsonResponse::HTTP_FORBIDDEN);
                                };

                                $stateLicense::where('company_id', $id)
                                    ->where('state_id', $stateLicense->state_id)
                                    ->delete();
                            }
                        }
                    }
                } else {
                    array_push($exceptioStateId, $licensedStateId);
                    array_push($newStateIdArr, $obj);
                }
            }
        }

        if (count($newStateIdArr) > 0) {
            $this->createCompanyStateLicense($newStateIdArr, $id, $stateMetadata);
            $deleteSetatid = DB::table('company_state_licenses')
                ->where('company_id', $id)
                ->whereNotIn('state_id',  $exceptioStateId)
                ->get()
                ->map(function ($state) {
                    return  [
                        'state_id' => $state->state_id,
                    ];
                });

            CompanyStateLicense::where('company_id', $id)
                ->whereIn('state_id',   $deleteSetatid)
                ->delete();
        }
    }

    private function decodedURL($encodeURIComponent)
    {
        $decodedURL =  preg_replace("/%u([0-9a-f]{3,4})/i", "&#x\\1;", urldecode($encodeURIComponent));

        return $decodedURL;
    }

    private function deleteStateLicense(int $id)
    {
        $companyStateLicense =  CompanyStateLicense::where('company_id', $id)
            ->get();

        if (!$companyStateLicense) {
            return $this->error([
                'message' => trans('messages.error.not_found', [
                    'resource' => 'state license',
                ]),
            ], JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
        }

        foreach ($companyStateLicense as $stateLicense) {
            CompanyStateLicense::where('company_id', $id)
                ->where('state_id', $stateLicense->state_id)
                ->delete();
        }
    }

    /**
     * Check the company name and company nmls number is unique
     */
    public function checkUnique(Request $request)
    {
        $isCheckedName = $request->has('name');
        $whereColumn = $isCheckedName ? "name" : 'company_nmls_number';
        $whereValue = $isCheckedName ? $request->name : $request->company_nmls_number;
        $message = $isCheckedName ? 'The Company name already exist' : 'The Company NMLS number already exist';

        try {
            if (!in_array($request->id, $this->userType)) {
                throw new Exception(
                    trans('messages.error.bad_request'),
                    JsonResponse::HTTP_UNPROCESSABLE_ENTITY
                );
            }

            $company = Company::query()->where($whereColumn, $whereValue)
                ->where('id', '!=', $request->isUpdateId ?? 0)
                ->first();

            if (!$company) {
                return $this->success([
                    'success' => true,
                    'message' => 'proceed to create'
                ]);
            }

            if ($company) {
                return $this->success([
                    'success' => false,
                    'message' => $message
                ]);
            }
        } catch (Exception $e) {
            return $this->error([
                'success' => false,
                'message' => $e->getMessage()
            ], $e->getCode());
        }
    }
}
