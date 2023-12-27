<?php

namespace App\Observers;

use App\Enums\Hubspot;
use App\Models\Company;
use App\Repositories\HubspotRepository;
use \Carbon\Carbon;

class CompanyObserver
{
    protected $hubspotRepository;

    public function __construct()
    {
        $this->hubspotRepository = new HubspotRepository();
    }
    
    /**
     * Handle the Company "created" event.
     */
    public function created(Company $company): void
    {
        $input = [
            'expiration_date' => Carbon::parse($company->created_at)->addYear()->endOfMonth(),
            'renewal_date' => Carbon::parse($company->created_at)->addYear()->addMonth()->startOfMonth()
        ];

        $hubspotCompanyInput = [
            Hubspot::HUBSPOT_COMPANY_CONTRACT_EXPIRY_DATE => Carbon::parse($input['expiration_date'])->toDateString(),
            Hubspot::HUBSPOT_COMPANY_RENEWAL_DATE => Carbon::parse($input['renewal_date'])->toDateString()
        ];

        $this->hubspotRepository->updateHubspotCompany($company->hubspot_company_id, $hubspotCompanyInput);
        $company->update($input);
    }

    /**
     * Handle the Company "updated" event.
     */
    public function updated(Company $company): void
    {
        //
    }

    /**
     * Handle the Company "deleted" event.
     */
    public function deleted(Company $company): void
    {
        //
    }

    /**
     * Handle the Company "restored" event.
     */
    public function restored(Company $company): void
    {
        //
    }

    /**
     * Handle the Company "force deleted" event.
     */
    public function forceDeleted(Company $company): void
    {
        //
    }
}
