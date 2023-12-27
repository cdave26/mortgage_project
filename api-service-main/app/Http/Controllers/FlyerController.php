<?php

namespace App\Http\Controllers;

use App\Enums\Flyer as EnumsFlyer;
use App\Models\Flyer;
use App\Models\GeneratedFlyer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FlyerController extends Controller
{
    public function getFlyerImages(string $page, string $limit, Request $request): JsonResponse
    {
        if (!in_array($request->type, [EnumsFlyer::LISTING, EnumsFlyer::MARKETING])) {
            return $this->error([
                'message' => trans('messages.error.forbidden'),
            ], JsonResponse::HTTP_FORBIDDEN);
        }

        $flyers = Flyer::where('type', $request->type); 

        return $this->success([
            'flyers' => $flyers->paginate($limit, ['*'], 'page', $page)
        ]);
    }

    // get the latest generated flyer
    public function getGeneratedFlyer(int $listingId): JsonResponse
    {
        $generatedFlyer = GeneratedFlyer::where('listing_id', $listingId)
            ->select([
                'generated_flyers.*',
                'u.first_name',
                'u.last_name',
                'f.name as flyer_name',
                'f.image as flyer_image'
            ])
            ->leftJoin('users as u', 'u.id', '=', 'generated_flyers.user_id')
            ->leftJoin('flyers as f', 'f.id', '=', 'generated_flyers.flyer_id')
            ->orderByDesc('created_at')
            ->limit(1)
            ->first();
        
        return $this->success([ 'listingGeneratedFlyer' => $generatedFlyer ]);
    }

    // get the list of generated flyers
    public function getGeneratedFlyers(int $id, string $page, string $limit, Request $request): JsonResponse
    {
        $sortBy = $request->sortBy;
        $order = $request->order;

        $generatedFlyers = GeneratedFlyer::where('listing_id', $id)
            ->select([
                'generated_flyers.*',
                'u.first_name',
                'u.last_name',
                'f.name as flyer_name',
                'f.image as flyer_image',
                'c.name as company_name'
            ])
            ->leftJoin('companies as c', 'c.id', '=', 'generated_flyers.company_id')
            ->leftJoin('users as u', 'u.id', '=', 'generated_flyers.user_id')
            ->leftJoin('flyers as f', 'f.id', '=', 'generated_flyers.flyer_id');

        if(!empty($sortBy) && !empty($order)) {
            if($sortBy === 'generated_by') {
                $generatedFlyers->orderByRaw("LOWER(CONCAT(u.first_name, ' ', u.last_name)) $order");
            } else {
                $generatedFlyers->orderBy($sortBy, $order);
            }
        }

        return $this->success([
            'listingGeneratedFlyers' => $generatedFlyers->paginate($limit, ['*'], 'page', $page)
        ]);
    }
}
