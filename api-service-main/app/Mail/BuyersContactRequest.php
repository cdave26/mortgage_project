<?php

namespace App\Mail;

use App\Enums\UserType;
use App\Models\User;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Storage;

class BuyersContactRequest
{
    public function __construct(
        protected Mail $mail,
    ) { }

    public function __invoke(array $data): Mail
    {
        $template = config('services.sendgrid.contact_request');

        $this->mail->setTemplateId($template);

        $recipient = Arr::pull($data, 'recipient');

        $sender = Arr::get($data, 'sender');

        $substitutions = [
            'subject' => "Contact request from $sender",
        ];

        $this->mail->addTo($recipient);

        $user = User::firstWhere('email', $recipient);

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
        } elseif (($companyLogo && Storage::exists($companyLogo))) {
            $logo = Storage::url($companyLogo);
        } else {
            $logo = config('services.sendgrid.default_company_logo');
        }

        Arr::set($data, 'company_logo', $logo);

        Arr::set($data, 'loan_officer', implode(' ', [
            $user->first_name, $user->last_name,
        ]));

        $request = (string) new BuyersContactRequestTemplate($data);

        Arr::set($data, 'request', $request);

        $data = Arr::only($data, [
            'company_logo', 'loan_officer', 'sender', 'email',
            'contact_number', 'property_address', 'comments', 'request',
        ]);

        $this->mail->addSubstitutions([
            ...$substitutions,
            ...$data,
        ]);

        return $this->mail;
    }
}
