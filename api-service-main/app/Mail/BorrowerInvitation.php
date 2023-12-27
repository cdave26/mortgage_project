<?php

namespace App\Mail;

use Illuminate\Support\Arr;

class BorrowerInvitation
{
    public function __construct(
        protected Mail $mail,
    ) { }

    public function __invoke(array $data): Mail
    {
        $template = config('services.sendgrid.borrower_invitation');

        $this->mail->setTemplateId($template);

        $recipient = Arr::get($data, 'borrower.email');

        $company = Arr::get($data, 'borrower.company.code');

        $loginPage = implode([
            config('uplist.client_app_url'),
            "/$company/login",
        ]);

        $registrationPage = implode([
            config('uplist.client_app_url'),
            "/$company/buyer/register",
        ]);

        $this->mail->addTo($recipient, null, [
            'subject' => 'Invitation: Uplist',
            'login_page' => $loginPage,
            'registration_page' => $registrationPage,
            ...$data,
        ]);

        return $this->mail;
    }
}
