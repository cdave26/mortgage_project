<?php

namespace App\Http\Controllers;

use App\Http\Requests\LicenseRequest;
use App\Models\Buyer;
use App\Models\License;
use App\Models\Listing;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class LicenseController extends Controller
{
    public function index(int $id, int $page, int $limit, Request $request)
    {
        $search = $request->search;
        $stateIds = $request->state;
        $sortBy = $request->sortBy;
        $order = $request->order;

        $licenses = License::where('user_id', $id)
            ->whereNull('deleted_at')
            ->select([
                'licenses.*',
                's.name as state_name',
                's.abbreviation',
            ])
            ->leftJoin('states as s', 's.id', '=', 'licenses.state_id');

        if (!empty($search) || $search === '0') {
            $licenses->where('licenses.license', 'like', '%' . $search . '%');
        }

        if (!empty($stateIds)) {
            $licenses->whereIn('licenses.state_id', array_map("intval", explode(',', $stateIds)));
        }

        if (!empty($sortBy) && !empty($order)) {
            if ($sortBy === 'state') {
                $licenses->orderBy('s.abbreviation', $order);
            } else {
                $licenses->orderBy($sortBy, $order);
            }
        }

        return $this->success([
            'licenses' => $licenses->paginate($limit, ['*'], 'page', $page)
        ]);
    }

    public function store(LicenseRequest $request): JsonResponse
    {
        $data = $request->validated();

        License::create($data);

        $beginning = Auth::id() === $data['user_id']
            ? 'Your' : 'The';

        return $this->success([
            'message' => trans('messages.success.dynamic', [
                'beginning' => $beginning,
                'resource' => 'state license',
                'super' => 'was',
                'action' => 'added.',
            ]),
        ]);
    }

    public function view(int $id): JsonResponse
    {
        $userId = Auth::user()->id;

        $license = License::select([
            'licenses.*',
            's.name as state_name',
            's.abbreviation',
        ])
            ->leftJoin('states as s', 's.id', '=', 'licenses.state_id')
            ->whereNull('deleted_at')
            ->find($id);

        if (!$license) {
            return $this->error([
                'message' => trans('messages.error.not_found', [
                    'resource' => 'license',
                ]),
            ], JsonResponse::HTTP_NOT_FOUND);
        }

        if ($license->user_id !== $userId) {
            return $this->error([
                'message' => trans('messages.error.forbidden')
            ], JsonResponse::HTTP_FORBIDDEN);
        }

        return $this->success([
            'license' => $license,
        ]);
    }

    public function update(int $id, LicenseRequest $request): JsonResponse
    {
        $fields = $request->validated();

        $license = License::find($id);

        if (!$license) {
            return $this->error([
                'message' => trans('messages.error.not_found', [
                    'resource' => 'license',
                ]),
            ], JsonResponse::HTTP_NOT_FOUND);
        }

        $license->update($fields);

        $beginning = Auth::id() === $fields['user_id']
            ? 'Your' : 'The';

        return $this->success([
            'message' => trans('messages.success.dynamic', [
                'beginning' => $beginning,
                'resource' => 'state license',
                'super' => 'was',
                'action' => 'updated.',
            ]),
        ]);
    }

    public function delete(int $id): JsonResponse
    {
        try {
            $license = License::find($id);

            if (!$license) {
                throw new Exception(
                    trans('messages.error.not_found', [
                        'resource' => 'license',
                    ]),
                    JsonResponse::HTTP_NOT_FOUND
                );
            }

            $listing = Listing::where('user_license_id', $id)
                ->exists();

            $buyers = Buyer::where([
                ['loan_officer_id', $license->user_id],
                ['property_state_id', $license->state_id],
            ])->exists();

            if ($listing || $buyers) {
                $message = trans('messages.error.relationship.delete', [
                    'resource' => 'license',
                ]);
                abort(JsonResponse::HTTP_INTERNAL_SERVER_ERROR, $message);
            }

            $license->deleted_by = Auth::id();
            $license->save();
            $license->delete();

            $beginning = Auth::id() === $license->user_id
                ? 'Your' : 'The';

            return $this->success([
                'message' => trans('messages.success.dynamic', [
                    'beginning' => $beginning,
                    'resource' => 'state license',
                    'super' => 'was',
                    'action' => 'deleted.',
                ]),
            ]);
        } catch (Exception $e) {
            return $this->error([
                'message' => $e->getMessage()
            ], $e->getCode());
        }
    }

    public function getLicensePerState(int $stateId, int $userId): JsonResponse
    {
        $licenses = License::select([
            'licenses.*',
            's.name as state_name',
            's.abbreviation',
        ])
            ->leftJoin('states as s', 's.id', '=', 'licenses.state_id')
            ->whereNull('deleted_at')
            ->where('state_id', $stateId)
            ->where('user_id', $userId)
            ->get();

        if (!$licenses) {
            return $this->error([
                'message' => trans('messages.error.not_found', [
                    'resource' => 'licenses',
                ]),
            ], JsonResponse::HTTP_NOT_FOUND);
        }

        return $this->success([
            'licenses' => $licenses,
        ]);
    }

    public function getLicensesPerUser(int $userId, Request $request): JsonResponse
    {
        $licenseStates = DB::table('licenses as l')
            ->join('states as s', 'l.state_id', '=', 's.id')
            ->where('user_id', '=', $userId)
            ->whereNull('l.deleted_at')
            ->selectRaw(<<<SELECT
                    l.id,
                    l.license,
                    l.state_id,
                    s.name as name,
                    s.abbreviation as abbreviation,
                    CONCAT(s.abbreviation, ' - ', s.name) as full_name
                SELECT)
            ->orderBy($request->orderBy, 'ASC')
            ->get();

        if (!$licenseStates) {
            return $this->error([
                'message' => trans('messages.error.not_found', [
                    'resource' => 'license states',
                ]),
            ], JsonResponse::HTTP_NOT_FOUND);
        }

        return $this->success([
            'licenseStates' => $licenseStates,
        ]);
    }
}
