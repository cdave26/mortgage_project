<?php

namespace App\Helpers;
use App\Models\User;
use App\Models\Flyer;
use App\Models\Company;
use App\Models\Listing;
class FlyerNameGenerator
{
    private $user_id;
    private $flyer_id;
    private  $company_id;
    private $listing_id;
    public function __construct(int $user_id, int $flyer_id, int $company_id, int $listing_id)
    {
        $this->user_id = $user_id;
        $this->flyer_id = $flyer_id;
        $this->company_id = $company_id;
        $this->listing_id = $listing_id;
    }
    public function generateFlyerName(): string
    {
        $mls_number = $this->getListingMLSNumber();
        $company_nmls_number = $this->getCompanyNmlsNumber();
        $personal_nmls_number = $this->getPersonalNmlsNumber();
        $flyer_type = $this->getFlyerType();

        return 'generated_pdf/'.$mls_number . '-' . $company_nmls_number . '-' . $personal_nmls_number . '-' . $flyer_type;  
    }

    private function getListingMLSNumber(): string
    {
        $listing = Listing::findOrFail($this->listing_id);
        return $listing->mls_number;
    }

    private function getCompanyNmlsNumber(): string
    {
        $company = Company::findOrFail($this->company_id);
        return $company->company_nmls_number;
    }

    private function getPersonalNmlsNumber()
    {
        $user = User::findOrFail($this->user_id);
        return $user->nmls_num;
    }

    private function getFlyerType(): string
    {
        $flyer = Flyer::findOrFail($this->flyer_id);
        return $flyer->name;
    }
}