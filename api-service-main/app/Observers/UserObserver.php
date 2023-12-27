<?php

namespace App\Observers;

use App\Helpers\HubspotHelper;
use App\Models\Company;
use App\Models\User;
use App\Models\UserType;
use App\Repositories\HubspotRepository;

class UserObserver
{
    protected $hubspotRepository;
    protected $hubspotHelper;

    public function __construct()
    {
        $this->hubspotRepository = new HubspotRepository();
        $this->hubspotHelper = new HubspotHelper();
    }

    /**
     * Handle the User "created" event.
     */
    public function created(User $user): void
    {
        
    }

    /**
     * Handle the User "updated" event.
     */
    public function updated(User $user): void
    {
        $fields = $user->getOriginal();
        $difference = $user->getChanges();

        $userTypeId = $fields['user_type_id'];

        foreach($difference as $diff => $val) {
            if(array_key_exists($diff, $fields)) {
                if($diff === 'user_type_id') {
                    $userTypeId = $val;
                }

                if($diff === 'company_id') {
                    $userType = UserType::query()->find($userTypeId);
                    $isRegisteredLoanOfficer = $userType->name === UserType::LOAN_OFFICER;
                    $newCompany = Company::query()->find($val);

                    /**
                     * update associations if loan officer changed company excluding default company
                     */
                    if($isRegisteredLoanOfficer && $newCompany !== config('uplist.app_name')) {
                        $oldCompany = Company::query()->find($fields[$diff]);

                        $this->hubspotRepository->updateHubspotContactCompanyAssociation(
                                                    $user->hubspot_contact_id,
                                                    $oldCompany->hubspot_company_id,
                                                    $newCompany->hubspot_company_id
                                                );

                        // update active_users properties in hubspot for both companies
                        $this->hubspotHelper->updateHubspotActiveUsers($newCompany);
                        $this->hubspotHelper->updateHubspotActiveUsers($oldCompany);
                    }
                }
            }
        }
    }

    /**
     * Handle the User "deleted" event.
     */
    public function deleted(User $user): void
    {
    }

    /**
     * Handle the User "restored" event.
     */
    public function restored(User $user): void
    {
        //
    }

    /**
     * Handle the User "force deleted" event.
     */
    public function forceDeleted(User $user): void
    {
        //
    }
}
