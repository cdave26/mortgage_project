<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class GetCompanyByCodeController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(string $code): JsonResponse
    {
        $company = Company::where('code', $code)
            ->firstOrFail();

        $logo = $company->company_logo && Storage::exists($company->company_logo)
            ? Storage::url($company->company_logo) : config('services.sendgrid.default_company_logo');

        return $this->success([
            'company' => [
                ...$company->only([
                    'id', 'code', 'name'
                ]),
                'logo' => $logo,
            ],
        ]);
    }
}
