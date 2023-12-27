<?php

namespace App\Http\Controllers;

use App\Http\Resources\LoanOfficerResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class LoanOfficerController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(string $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $user = $user->load([
            'company:id,name,address,city,state,zip,equal_housing,company_nmls_number,company_mobile_number,additional_details,company_logo,allow_loan_officer_to_upload_logo',
            'listings:id,user_id,mls_number',
            'licenses:id,user_id,state_id,license',
            'licenses.state:id,name,abbreviation,disclosure,licensing_information,additional_required_disclosures',
            'licenses.state.companyStateLicense' => function ($query) use ($user) {
                $query->where('company_id', $user->company_id);
            },
        ]);

        return $this->success([
            'loan_officer' => new LoanOfficerResource($user),
        ]);
    }
}
