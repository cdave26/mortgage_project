<?php

namespace App\Http\Controllers;

use App\Models\PricingEngine;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PricingEngineController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $pricingEngines = PricingEngine::all();

        return $this->success([
            'pricing_engines' => $pricingEngines
        ]);
    }
}
