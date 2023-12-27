<?php

namespace App\Http\Controllers;

use App\Models\Listing;
use Exception;
use Illuminate\Http\Request;
use App\Http\Requests\ListingRequest;
use App\Enums\ListingStatus;
use App\Enums\UserType;
use App\Facades\SendGridService;
use App\Mail\AgentListingNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ListingController extends Controller
{
    private $userType = [1, 2];

    public function __construct(
        protected AgentListingNotification $agentListingNotif,
    ) { }

    private function allowedAccess()
    {
        return [
            UserType::UPLIST_ADMIN->id(),
            UserType::COMPANY_ADMIN->id(),
            UserType::LOAN_OFFICER->id(),
        ];
    }

    /**
     * Display a listing of the resource.
     */
    public function index(string $page, string $limit, Request $request): JsonResponse
    {

        $search = $request->search;
        $sortBy = $request->sortBy;
        $order = $request->order;

        $user = Auth::user();

        $userTypeId = $user->user_type_id;
        if (!in_array($userTypeId, $this->allowedAccess())) {
            return $this->error([
                'message' => trans('messages.error.forbidden'),
            ], JsonResponse::HTTP_FORBIDDEN);
        }

        $listings = DB::table('listings as l')
            ->join('companies as co', 'co.id', '=', 'l.company_id')
            ->join('companies as sco', 'sco.id', '=', 'l.sub_company_id')
            ->join('users as u', 'u.id', '=', 'l.user_id')
            ->join('states as s', 's.id', '=', 'l.state_id')
            ->join('counties as c', 'c.id', '=', 'l.county_id')
            ->join('licenses as ls', 'ls.id', '=', 'l.user_license_id')
            ->join('states as lss', 'lss.id', '=', 'ls.state_id')
            ->join('units as uc', 'uc.id', '=', 'l.units_count')
            ->join('listing_statuses as lst', 'lst.id', '=', 'l.listing_status')
            ->join('property_types as pt', 'pt.id', '=', 'l.property_type')
            ->whereNull('l.deleted_at')
            ->where('l.listing_status', '!=', ListingStatus::ARCHIVED->value)
            ->selectRaw(<<<SELECT
                l.*,
                CONCAT(l.property_address, ' ', l.property_city, ', ', s.abbreviation) as partial_address,
                CONCAT(
                    l.property_address, ' ',
                    IFNULL(l.property_apt_suite, ''),
                    IF(l.property_apt_suite, ', ', ''),
                    l.property_city, ', ',
                    s.abbreviation, ' ',
                    l.property_zip
                ) as full_address,
                u.email, u.mobile_number, u.url_identifier,
                CONCAT(u.first_name, ' ', u.last_name) as loan_officer,
                CONCAT(s.abbreviation, ' - ', s.name) as full_state,
                s.name as state,
                c.name as county,
                pt.id as property_type,
                pt.description as property_type_desc,
                lst.id as listing_status,
                lst.description as listing_status_desc,
                uc.id as units_count,
                uc.description as units_count_desc,
                ls.license,
                lss.name as user_license_state,
                sco.code as company_code
            SELECT);


        if ($userTypeId === 3) {
            $listings->where('l.user_id', $user->id)
                ->where('l.company_id', $user->company_id);
        }

        if ($userTypeId === 2) {
            $listings->where('l.company_id', $user->company_id);
        }

        if (!empty($search) || $search === '0') {
            $listings->where('l.mls_number', 'like', '%' . strval($search) . '%');
        }

        if (!empty($sortBy) && !empty($order)) {
            if ($sortBy === 'loan_officer') {
                $listings->orderByRaw("LOWER(loan_officer) $order");
            } else if ($sortBy === 'address') {
                $listings->orderByRaw("LOWER(partial_address) $order");
            } else {
                $listings->orderBy($sortBy, $order);
            }
        }

        return $this->success([
            'listings' => $listings->paginate($limit, ['*'], 'page', $page)
        ]);
    }

    public function store(ListingRequest $request): JsonResponse
    {
        $fields = $request->validated();
        try {
            DB::beginTransaction();

            $fields['sub_company_id'] = $request->company_id;
    
            $listing = Listing::query()->create($fields);

            $successMessage = [
                'beginning' => 'Your',
                'resource' => 'listing',
                'super' => 'was',
                'action' => 'created.',
            ];
    
            if($request->has('agent_listing')) {
                $notifaction = $this->agentListingNotif->__invoke($listing->toArray());
                SendGridService::send($notifaction);

                $successMessage = [
                    'beginning' => 'Your',
                    'resource' => 'request',
                    'super' => 'has been',
                    'action' => 'submitted.',
                ];
            }
    
            DB::commit();
            return $this->success([
                'listing_id' => $listing->id,
                'message' => trans('messages.success.dynamic', $successMessage),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->error([
                'message' => $e->getMessage()
            ], $e->getCode());
        }
    }

    public function view(int $id): JsonResponse
    {
        $user = Auth::user();

        $userTypeId = $user->user_type_id;
        if (!in_array($userTypeId, $this->allowedAccess())) {
            return $this->error([
                'message' => trans('messages.error.forbidden'),
            ], JsonResponse::HTTP_FORBIDDEN);
        }

        $listing = DB::table('listings as l')
            ->join('companies as co', 'co.id', '=', 'l.company_id')
            ->join('companies as sco', 'sco.id', '=', 'l.sub_company_id')
            ->join('users as u', 'u.id', '=', 'l.user_id')
            ->join('states as s', 's.id', '=', 'l.state_id')
            ->join('counties as c', 'c.id', '=', 'l.county_id')
            ->join('licenses as ls', 'ls.id', '=', 'l.user_license_id')
            ->join('states as lss', 'lss.id', '=', 'ls.state_id')
            ->join('units as uc', 'uc.id', '=', 'l.units_count')
            ->join('property_types as pt', 'pt.id', '=', 'l.property_type')
            ->join('listing_statuses as lst', 'lst.id', '=', 'l.listing_status')
            ->whereNull('l.deleted_at')
            ->where('l.listing_status', '!=', ListingStatus::ARCHIVED->value)
            ->selectRaw(<<<SELECT
                l.*,
                CONCAT(l.property_address, ' ', l.property_city, ', ', s.abbreviation) as partial_address,
                CONCAT(
                    l.property_address, ' ',
                    IFNULL(l.property_apt_suite, ''),
                    IF(l.property_apt_suite, ', ', ''),
                    l.property_city, ', ',
                    s.abbreviation, ' ',
                    l.property_zip
                ) as full_address,
                u.email, u.mobile_number, u.url_identifier,
                CONCAT(u.first_name, ' ', u.last_name) as loan_officer,
                CONCAT(s.abbreviation, ' - ', s.name) as full_state,
                s.name as state,
                c.name as county,
                pt.id as property_type,
                pt.description as property_type_desc,
                lst.id as listing_status,
                lst.description as listing_status_desc,
                uc.id as units_count,
                uc.description as units_count_desc,
                ls.license,
                lss.name as user_license_state,
                sco.code as company_code
            SELECT);

        if ($userTypeId === 3) {
            $listing->where('l.user_id', $user->id)
                ->where('l.company_id', $user->company_id);
        }

        if ($userTypeId === 2) {
            $listing->where('l.company_id', $user->company_id);
        }

        $listing->where('l.id', $id);
        $listing = $listing->first();

        if (!$listing) {
            return $this->error([
                'message' => trans('messages.error.not_found', [
                    'resource' => 'listing'
                ])
            ], JsonResponse::HTTP_NOT_FOUND);
        }

        return $this->success([
            'listing' => $listing,
        ]);
    }

    public function update(int $id, ListingRequest $request): JsonResponse
    {
        $user = Auth::user();
        $fields = $request->validated();
        try {
            DB::beginTransaction();

            $listing = Listing::query()->find($id);

            if (!$listing) {
                return $this->error([
                    'message' => trans('messages.error.not_found', [
                        'resource' => 'listing',
                    ])
                ], JsonResponse::HTTP_NOT_FOUND);
            }

            if (!$listing->from_sub_company) {
                $fields['sub_company_id'] = $fields['company_id'];
            }

            $listing->update($fields);

            DB::commit();
            return $this->success([
                'message' => in_array($user->user_type_id, $this->userType) ?
                    ($user->id == $listing->user_id ?
                        trans('messages.success.dynamic', [
                            'beginning' => 'Your',
                            'resource' => 'listing',
                            'super' => 'was',
                            'action' => 'updated.',
                        ]) :  trans('messages.success.update', [
                            'resource' => 'listing',
                        ])
                    )
                    : trans('messages.success.dynamic', [
                        'beginning' => 'Your',
                        'resource' => 'listing',
                        'super' => 'was',
                        'action' => 'updated.',
                    ])

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
        try {
            $user = Auth::user();
            DB::beginTransaction();

            $listing = Listing::query()->find($id);

            if (!$listing) {
                throw new Exception(
                    trans('messages.error.not_found', [
                        'resource' => 'listing',
                    ]),
                    JsonResponse::HTTP_NOT_FOUND
                );
            }

            $listing->listing_status = ListingStatus::ARCHIVED->value;
            $listing->deleted_by = Auth::id();
            $listing->save();
            $listing->delete();

            DB::commit();
            return $this->success([
                'message' => in_array($user->user_type_id, $this->userType) ?
                    ($user->id == $listing->user_id ? trans('messages.success.dynamic', [
                        'beginning' => 'Your',
                        'resource' => 'listing',
                        'super' => 'was',
                        'action' => 'deleted.',
                    ]) :

                        trans('messages.success.delete', [
                            'resource' => 'listing',
                        ]))
                    :

                    trans('messages.success.dynamic', [
                        'beginning' => 'Your',
                        'resource' => 'listing',
                        'super' => 'was',
                        'action' => 'deleted.',
                    ]),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->error([
                'message' => $e->getMessage()
            ], $e->getCode());
        }
    }

    public function getPublicListing(int $id, string $mlsNumber): JsonResponse
    {
        $listing = Listing::with([
            'user',
            'company',
            'subCompany',
            'state',
            'county',
            'license',
            'unitsCount',
            'propertyType'
        ])
            ->whereNull('listings.deleted_at')
            ->where('listing_status', '!=', ListingStatus::ARCHIVED->value)
            ->select([
                'listings.*',
                'csl.state_metadata',
                'csl.license as company_state_license'
            ])
            ->leftJoin('users as u', 'u.id', '=', 'listings.user_id')
            ->leftJoin('company_state_licenses as csl', function ($join) {
                $join->on('csl.company_id', '=', 'listings.company_id')
                    ->on('csl.state_id', '=', 'listings.state_id')
                    ->whereNull('csl.deleted_at');
            });

        $listing->where('listings.id', $id);
        $listing = $listing->first();

        if (!$listing) {
            return $this->error([
                'message' => trans('messages.error.not_found', [
                    'resource' => 'public listing',
                ]),
            ], JsonResponse::HTTP_NOT_FOUND);
        }

        $pageLink = explode('/', $listing->page_link);

        if ($pageLink[2] !== $mlsNumber) {
            return $this->error([
                'message' => trans('messages.error.invalid_url'),
            ], JsonResponse::HTTP_FORBIDDEN);
        }

        $publishable = [
            ListingStatus::PUBLISHED->value,
            ListingStatus::SALE_PENDING->value
        ];

        if (!in_array($listing->listing_status, $publishable)) {
            return $this->error([
                'message' => trans('messages.error.not_published', [
                    'resource' => 'public listing',
                ]),
            ], JsonResponse::HTTP_FORBIDDEN);
        }

        return $this->success([
            'listing' => $listing,
        ]);
    }

    public function getAll(Request $request): JsonResponse
    {
        $search = $request->search;

        $user = Auth::user();

        $userTypeId = $user->user_type_id;
        if (!in_array($userTypeId, $this->allowedAccess())) {
            return $this->error([
                'message' => trans('messages.error.forbidden'),
            ], JsonResponse::HTTP_FORBIDDEN);
        }

        $listings = DB::table('listings as l')
            ->join('companies as co', 'co.id', '=', 'l.company_id')
            ->join('users as u', 'u.id', '=', 'l.user_id')
            ->join('states as s', 's.id', '=', 'l.state_id')
            ->join('counties as c', 'c.id', '=', 'l.county_id')
            ->join('licenses as ls', 'ls.id', '=', 'l.user_license_id')
            ->join('states as lss', 'lss.id', '=', 'ls.state_id')
            ->join('units as uc', 'uc.id', '=', 'l.units_count')
            ->join('listing_statuses as lst', 'lst.id', '=', 'l.listing_status')
            ->join('property_types as pt', 'pt.id', '=', 'l.property_type')
            ->whereNull('l.deleted_at')
            ->where('l.listing_status', '!=', ListingStatus::ARCHIVED->value)
            ->selectRaw(<<<SELECT
                l.*,
                CONCAT(l.property_address, ' ', l.property_city, ', ', s.abbreviation) as partial_address,
                CONCAT(
                    l.property_address, ' ',
                    IFNULL(l.property_apt_suite, ''),
                    IF(l.property_apt_suite, ', ', ''),
                    l.property_city, ', ',
                    s.abbreviation, ' ',
                    l.property_zip
                ) as full_address,
                u.email, u.mobile_number, u.url_identifier,
                CONCAT(u.first_name, ' ', u.last_name) as loan_officer,
                CONCAT(s.abbreviation, ' - ', s.name) as full_state,
                s.name as state,
                c.name as county,
                pt.id as property_type,
                pt.description as property_type_desc,
                lst.id as listing_status,
                lst.description as listing_status_desc,
                uc.id as units_count,
                uc.description as units_count_desc,
                ls.license,
                lss.name as user_license_state,
                co.code as company_code
            SELECT);


        if ($userTypeId === 3) {
            $listings->where('l.user_id', $user->id)
                ->where('l.company_id', $user->company_id);
        }

        if ($userTypeId === 2) {
            $listings->where('l.company_id', $user->company_id);
        }

        if (!empty($search) || $search === '0') {
            $listings->where('l.mls_number', 'like', '%' . strval($search) . '%');
        }

        $listings = $listings->orderBy('l.updated_at', 'desc')->get();

        return $this->success([
            'listings' => $listings
        ]);
    }
}
