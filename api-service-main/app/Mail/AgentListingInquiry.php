<?php

namespace App\Mail;

use App\Enums\UserType;
use App\Models\User;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Storage;

class AgentListingInquiry
{
    public function __construct(
        protected Mail $mail,
    ) {}

    public function __invoke(array $data): Mail
    {
        $this->mail->setTemplateId(
            config('services.sendgrid.agent_listing_inquiry'),
        );
        
        $userEmail = Arr::get($data, 'email');
        $user = User::firstWhere('email', $userEmail);
        $logo = null;

        $isLoanOfficer = $user->user_type_id === UserType::LOAN_OFFICER->id();
        $allowLOtoUploadLogo = $user->company->allow_loan_officer_to_upload_logo;
        $customLogoFlyers = $user->custom_logo_flyers;
        $companyLogo = $user->company->company_logo;

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

        $arr = [];
        foreach ($data as $key => $value) {
            $arr[$key] = $value;
        }

        $loanOfficer = implode(' ', [
            Arr::get($data, 'first_name'),
            Arr::get($data, 'last_name'),
        ]);

        $merged = array_merge(
            [
                'subject' => 'Agent Listing Inquiry',
                'loan_officer' => $loanOfficer,
                'company_logo' => $logo
            ],
            $arr
        );

        $this->mail->addTo(
            $userEmail,
            $loanOfficer,
            $merged
        );

        return $this->mail;
    }
}
