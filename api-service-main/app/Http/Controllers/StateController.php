<?php

namespace App\Http\Controllers;

use App\Models\State;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StateController extends Controller
{
    public function index(): JsonResponse
    {
        $reconstructed = [];
        $states = State::all();

        foreach ($states as $state) {
            $reconstructed[] = [
                'id' => $state->id,
                'name' => $state->name,
                'abbreviation' => $state->abbreviation,
                'full_name' => $state->full_state,
                'metadata' => $state->metadata,
                'default_disclaimer' => $state->default_disclaimer
            ];
        };

        return $this->success([
            "states" => $reconstructed,
        ]);
    }

    public function getStatesPerCompany(int $companyId, Request $request): JsonResponse
    {
        $companyStates = DB::table('company_state_licenses as csl')
            ->join('states as s', 'csl.state_id', '=', 's.id')
            ->where('csl.company_id', '=', $companyId)
            ->whereNull('csl.deleted_at')
            ->selectRaw(<<<SELECT
                    s.id,
                    s.name as name,
                    s.abbreviation as abbreviation,
                    CONCAT(s.abbreviation, ' - ', s.name) as full_name,
                    csl.state_metadata as metadata
                SELECT)
            ->orderBy($request->orderBy, 'ASC')
            ->get();

        return $this->success([
            "companyStates" => $companyStates,
        ]);  
    }
}
