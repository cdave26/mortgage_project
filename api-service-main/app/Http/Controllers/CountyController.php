<?php

namespace App\Http\Controllers;

use App\Models\County;
use Illuminate\Http\JsonResponse;
use Exception;

class CountyController extends Controller
{
    public function index(String $state_id): JsonResponse
    {
        $counties = County::query()->where('state_id', $state_id)
            ->orderBy('name', 'ASC')
            ->get();

        return $this->success([
            "counties" => $counties,
        ]);
    }
}
