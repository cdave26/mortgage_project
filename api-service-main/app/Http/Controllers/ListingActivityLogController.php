<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ListingActivityLogController extends Controller
{
    public function getAll(int $id, string $page, string $limit, Request $request): JsonResponse
    {
        $sortBy = $request->sortBy;
        $order = $request->order;

        $listingLogs = ActivityLog::with(['user'])
            ->where('model_name', 'listing')
            ->where('model_id', $id)
            ->where('operation', 'update')
            ->select(['activity_logs.*', 'u.first_name', 'u.last_name'])
            ->leftJoin('users as u', 'u.id', '=', 'activity_logs.user_id');

        if(!empty($sortBy) && !empty($order)) {
            if($sortBy === 'updated_by') {
                $listingLogs->orderByRaw("LOWER(CONCAT(u.first_name, ' ', u.last_name)) $order");
            } else {
                $listingLogs->orderBy($sortBy, $order);
            }
        }

        return $this->success([
            'listingLogs' => $listingLogs->paginate($limit, ['*'], 'page', $page)
        ]);
    }
}
