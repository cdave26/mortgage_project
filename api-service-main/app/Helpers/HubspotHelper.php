<?php

namespace App\Helpers;

use App\Helpers\UsersCount;
use App\Repositories\HubspotRepository;

class HubspotHelper
{
    protected $hubspotRepository;

    public function __construct()
    {
        $this->hubspotRepository = new HubspotRepository();
    }

    /**
     * Updates the count of active loan officers in hubspot per company
     * 
     * @param App\Model\Company $company
     */
    public function updateHubspotActiveUsers($company)
    {
        $usersCount = new UsersCount();

        $companyLoanOfficersCount = $usersCount->getActiveLoanOfficersCountPerCompany($company->id);
        $this->hubspotRepository->updateHubspotCompany($company->hubspot_company_id, [ 'active_users' => $companyLoanOfficersCount ]);
    }
}