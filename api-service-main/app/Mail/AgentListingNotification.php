<?php

namespace App\Mail;

use App\Enums\PropertyType;
use App\Enums\Unit;
use App\Enums\UserType;
use App\Models\County;
use App\Models\State;
use App\Models\User;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class AgentListingNotification
{
    public function __construct(
        protected Mail $mail,
    ) { }

    public function __invoke(array $data): Mail
    {
        $template = config('services.sendgrid.agent_listing_notification');

        $this->mail->setTemplateId($template);

        $userId = Arr::get($data, 'user_id');

        $user = User::find($userId);
        $logo = null;

        $isLoanOfficer = $user->user_type_id === UserType::LOAN_OFFICER->id();
        $allowLOtoUploadLogo = $user->company->allow_loan_officer_to_upload_logo;
        $customLogoFlyers = $user->custom_logo_flyers;
        $companyLogo = $user->company->company_logo;

        $recipient = $user->email;
        $loanOfficer = implode(' ', [
            $user->first_name,
            $user->last_name,
        ]);

        if(
            $allowLOtoUploadLogo &&
            $isLoanOfficer &&
            $customLogoFlyers &&
            Storage::exists($customLogoFlyers)
        ) {
            $logo = Storage::url($customLogoFlyers);
        } elseif ($companyLogo && Storage::exists($companyLogo)) {
            $logo = Storage::url($companyLogo);
        } else {
            $logo = config('services.sendgrid.default_company_logo');
        }

        $listingId = Arr::get($data, 'id');

        $listingURL = implode([
            config('uplist.client_app_url'),
            "/listings/view/$listingId?source=mail",
        ]);

        $propertyType = Arr::get($data, 'property_type');
        $propertyType = PropertyType::from($propertyType);

        $unitsCount = Arr::get($data, 'units_count');
        $unitsCount = Unit::from($unitsCount);

        $propertyState = Arr::get($data, 'state_id');
        $propertyState = State::find($propertyState);

        $propertyCounty = Arr::get($data, 'county_id');
        $propertyCounty = County::find($propertyCounty);

        $propertyValue = Arr::get($data, 'property_value');
        $listingAgentName = Arr::get($data, 'listing_agent_name');
        $listingAgentName = Str::ucfirst($listingAgentName);
        $sellerCredits = Arr::get($data, 'seller_credits');
        $HOADues = Arr::get($data, 'hoa_dues');
        $propertyTaxes = Arr::get($data, 'property_taxes');

        Arr::set($data, 'property_state', $propertyState->name);
        Arr::set($data, 'property_county', $propertyCounty->name);
        Arr::set($data, 'property_value', currency_format($propertyValue, 0));
        Arr::set($data, 'seller_credits', currency_format($sellerCredits, 0));
        Arr::set($data, 'hoa_dues', currency_format($HOADues));
        Arr::set($data, 'property_taxes', currency_format($propertyTaxes));
        Arr::set($data, 'property_type', $propertyType->description());
        Arr::set($data, 'units_count', $unitsCount->description());
        Arr::set($data, 'listing_agent_name', $listingAgentName);

        $this->mail->addTo($recipient, null, [
            'subject' => 'New Listing Flyer Request From ' . $listingAgentName,
            'loan_officer' => $loanOfficer,
            'listing_url' => $listingURL,
            'company_logo' => $logo,
            ...$data,
        ]);

        return $this->mail;
    }
}
