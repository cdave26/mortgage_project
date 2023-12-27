<?php

namespace App\Http\Controllers;

use App\Enums\UserType;
use Illuminate\Http\Request;
use App\Models\GeneratedFlyer as Flyers;
use Illuminate\Support\Facades\Auth;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class GeneratedFlyerController extends Controller
{
    protected $usersType = [1, 2, 3];

    public function getGeneratedFlyers(Request $request)
    {
        try {
            $search = $request->search;
            $addressSearch = $request->addressSearch;
            $activeArchive = $request->activeArchive;
            $filterCreatedBy = $request->createdBy;
            $companyId = $request->companyId;

            $user = Auth::user();
            $userTypeId = $user->user_type_id;
            $company_id = $user->company_id;

            if (!in_array($userTypeId, $this->usersType)) {
                return $this->error([
                    'message' => trans('messages.error.unauthorized')
                ], JsonResponse::HTTP_UNAUTHORIZED);
            }

            $flyers = DB::table('generated_flyers as gf')
                ->join('companies as c', 'gf.company_id', '=', 'c.id')
                ->join('listings as l', 'gf.listing_id', '=', 'l.id')
                ->join('flyers as f', 'gf.flyer_id', '=', 'f.id')
                ->join('states as s', 'l.state_id', '=', 's.id')
                ->join('users as u', 'gf.user_id', '=', 'u.id')
                ->selectRaw(<<<SELECT
                    gf.*,
                    gf.id as generated_flyer_id,
                    gf.created_at as generated_flyer_created_at,
                    l.mls_number,
                    l.id as listing_id,
                    CONCAT(l.property_address, ' ', l.property_city, ', ', s.abbreviation) as partial_address,
                    CONCAT(
                        l.property_address, ' ',
                        IFNULL(l.property_apt_suite, ''),
                        IF(l.property_apt_suite, ', ', ''),
                        l.property_city, ', ',
                        s.abbreviation, ' ',
                        l.property_zip
                    ) as full_address,
                    f.id as flyer_id,
                    u.id as user_id,
                    u.first_name as user_first_name,
                    u.last_name as user_last_name,
                    c.name as company_name
                SELECT);

            // check generated flyer status
            if ($activeArchive === 'active') {
                $flyers->whereNull('gf.deleted_at');
            } else if ($activeArchive === 'archive') {
                $flyers->whereNotNull('gf.deleted_at');
            }

            if($userTypeId === UserType::UPLIST_ADMIN->id() && $companyId) {
                $flyers->where('gf.company_id', '=', $companyId);
            }

            // check user type
            if($userTypeId === UserType::LOAN_OFFICER->id()) {
                $flyers->where('gf.user_id', '=', $user->id);
            }

            if($userTypeId === UserType::COMPANY_ADMIN->id()) {
                $flyers->where('gf.company_id', '=', $company_id);
            }

            // search filters and sorting below
            if(!empty($search) || $search === '0') {
                $flyers->where('l.mls_number', 'like', '%' . $search . '%');
            }

            if(!empty($addressSearch)) {
                $flyers->where(DB::raw("CONCAT(
                    l.property_address, ' ',
                    IFNULL(l.property_apt_suite, ''),
                    IF(l.property_apt_suite, ', ', ''),
                    l.property_city, ', ',
                    s.abbreviation, ' ',
                    l.property_zip
                )"), 'like', '%' . $addressSearch . '%');
            }

            if (!empty($filterCreatedBy)) {
                $decodedurl = preg_replace("/%u([0-9a-f]{3,4})/i", "&#x\\1;", urldecode($filterCreatedBy));
                $sortCreatedBy = json_decode($decodedurl, true);
                $reqName = [];
                $reqLastName = [];
                foreach ($sortCreatedBy as $sort) {
                    array_push($reqName, $sort['first_name']);
                    array_push($reqLastName, $sort['last_name']);
                }

                $flyers->whereIn('u.first_name', $reqName)
                    ->whereIn('u.last_name', $reqLastName);
            }

            $flyers->orderBy('gf.created_at', 'desc');

            return $this->success($flyers->get());
        } catch (Exception $e) {
            return $this->error([
                'message' => $e->getMessage()
            ], JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
        }
    }

    public function viewAllFlyers(Request $request)
    {

        try {
            $search = $request->search;
            $addressSearch = $request->addressSearch;
            $sortBy = $request->sortBy;
            $activeArchive = $request->active_archive;
            $page = $request->page;
            $limit = $request->limit;
            $filterCreatedBy = $request->created_by;
            $companyId = $request->companyId;

            $user = Auth::user();
            $userTypeId = $user->user_type_id;
            $company_id = $user->company_id;

            if (!in_array($userTypeId, $this->usersType)) {
                return $this->error([
                    'message' => trans('messages.error.unauthorized')
                ], JsonResponse::HTTP_UNAUTHORIZED);
            }

            $flyers = DB::table('generated_flyers as gf')
                ->join('companies as c', 'gf.company_id', '=', 'c.id')
                ->join('listings as l', 'gf.listing_id', '=', 'l.id')
                ->join('flyers as f', 'gf.flyer_id', '=', 'f.id')
                ->join('states as s', 'l.state_id', '=', 's.id')
                ->join('users as u', 'gf.user_id', '=', 'u.id')
                ->selectRaw(<<<SELECT
                    gf.*,
                    gf.id as generated_flyer_id,
                    gf.created_at as generated_flyer_created_at,
                    l.mls_number,
                    l.id as listing_id,
                    CONCAT(l.property_address, ' ', l.property_city, ', ', s.abbreviation) as partial_address,
                    CONCAT(
                        l.property_address, ' ',
                        IFNULL(l.property_apt_suite, ''),
                        IF(l.property_apt_suite, ', ', ''),
                        l.property_city, ', ',
                        s.abbreviation, ' ',
                        l.property_zip
                    ) as full_address,
                    f.id as flyer_id,
                    u.id as user_id,
                    u.first_name as user_first_name,
                    u.last_name as user_last_name,
                    c.name as company_name
                SELECT);

            // check generated flyer status
            if ($activeArchive === 'active') {
                $flyers->whereNull('gf.deleted_at');
            } else if ($activeArchive === 'archive') {
                $flyers->whereNotNull('gf.deleted_at');
            }

            if($userTypeId === UserType::UPLIST_ADMIN->id() && $companyId) {
                $flyers->where('gf.company_id', '=', $companyId);
            }

            // check user type
            if($userTypeId === UserType::LOAN_OFFICER->id()) {
                $flyers->where('gf.user_id', '=', $user->id);
            }

            if($userTypeId === UserType::COMPANY_ADMIN->id()) {
                $flyers->where('gf.company_id', '=', $company_id);
            }

            // search filters and sorting below
            if(!empty($search) || $search === '0') {
                $flyers->where('l.mls_number', 'like', '%' . $search . '%');
            }

            if(!empty($addressSearch)) {
                $flyers->where(DB::raw("CONCAT(
                    l.property_address, ' ',
                    IFNULL(l.property_apt_suite, ''),
                    IF(l.property_apt_suite, ', ', ''),
                    l.property_city, ', ',
                    s.abbreviation, ' ',
                    l.property_zip
                )"), 'like', '%' . $addressSearch . '%');
            }

            if (!empty($filterCreatedBy)) {
                $decodedurl = preg_replace("/%u([0-9a-f]{3,4})/i", "&#x\\1;", urldecode($filterCreatedBy));
                $sortCreatedBy = json_decode($decodedurl, true);
                $reqName = [];
                $reqLastName = [];
                foreach ($sortCreatedBy as $sort) {
                    array_push($reqName, $sort['first_name']);
                    array_push($reqLastName, $sort['last_name']);
                }

                $flyers->whereIn('u.first_name', $reqName)
                    ->whereIn('u.last_name', $reqLastName);
            }

            if (!empty($sortBy)) {
                $decodedurl = preg_replace("/%u([0-9a-f]{3,4})/i", "&#x\\1;", urldecode($sortBy));
                $sortBy = json_decode($decodedurl, true);
                foreach ($sortBy as $key => $value) {
                    if($key === 'address') {
                        $flyers->orderByRaw("LOWER(full_address) $value");
                    } else {
                        $flyers->orderBy($key, $value);
                    }
                }
            }

            $flyers->orderBy('gf.created_at', 'desc');

            return $this->success($flyers->paginate($limit, ['*'], 'page', $page));
        } catch (Exception $e) {
            return $this->error([
                'message' => $e->getMessage()
            ], JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
        }
    }

    public function archiveFlyer(Request $request)
    {
        $fields = $request->validate([
            'id' => 'required|integer|exists:App\Models\GeneratedFlyer,id',
        ]);
        try {
            DB::beginTransaction();
            if (!in_array(Auth::user()->user_type_id, $this->usersType)) {
                return $this->error([
                    'message' => trans('messages.error.unauthorized')
                ], JsonResponse::HTTP_UNAUTHORIZED);
            }

            $flyer = Flyers::find($fields['id']);

            if (!$flyer) {
                return $this->error([
                    'message' => trans('messages.error.not_found')
                ], JsonResponse::HTTP_NOT_FOUND);
            }
            $flyer->update(['deleted_by' => Auth::user()->id]);
            $flyer->delete();
            DB::commit();
            return $this->success($flyer);
        } catch (Exception $e) {
            DB::rollback();
            return $this->error([
                'message' => $e->getMessage()
            ], JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
        }
    }

    public function downloadFlyer(Request $request)
    {
        if(!$request->file_name) {
            return $this->error([
                'message' => trans('messages.error.forbidden')
            ], JsonResponse::HTTP_FORBIDDEN);
        }

        try {
            return Storage::download($request->file_name);
        } catch (Exception $e) {
            return $this->error([
                'message' => $e->getMessage()
            ], JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
        }
    }
}
