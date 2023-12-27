<?php

namespace App\Http\Controllers;

use App\Facades\BuyerService;
use App\Http\Requests\SaveBuyerRequest;
use App\Http\Requests\SearchBuyerRequest;
use App\Http\Resources\PreApprovedBuyerCollection;
use App\Http\Resources\PreApprovedBuyerResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BuyerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(SearchBuyerRequest $request): JsonResponse
    {
        $collection = new PreApprovedBuyerCollection(
            BuyerService::all($request->validated()),
        );

        return $this->success([
            'buyers' => $collection,
        ]);
    }


    /**
     * Display a unpaginated listing of the resource.
     */
    public function getAll(Request $request): JsonResponse
    {
        $collection = BuyerService::getAll($request->toArray());

        return $this->success([
            'buyers' => $collection,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(SaveBuyerRequest $request): JsonResponse
    {
        BuyerService::create($request->validated());

        return $this->success([
            'message' => trans('messages.success.dynamic', [
                'beginning' => 'Your',
                'resource' => 'buyer`s',
                'super' => 'pre-approval request was',
                'action' => 'created.',
            ]),
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $resource = new PreApprovedBuyerResource(
            BuyerService::find($id),
        );

        return $this->success([
            'buyer' => $resource,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(SaveBuyerRequest $request, string $id): JsonResponse
    {
        BuyerService::update($id, $request->validated());

        return $this->success([
            'message' => trans('messages.success.dynamic', [
                'beginning' => 'Your',
                'resource' => 'buyer`s',
                'super' => 'details were',
                'action' => 'updated.',
            ]),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        BuyerService::delete($id);

        return $this->success([
            'message' => trans('messages.success.dynamic', [
                'beginning' => 'Your',
                'resource' => 'buyer',
                'super' => 'was',
                'action' => 'deleted.',
            ]),
        ]);
    }
}
