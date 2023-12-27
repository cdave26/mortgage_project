<?php

namespace App\Mail;

use Illuminate\Support\Arr;

class OTPVerificationCode
{
    public function __construct(
        protected Mail $mail,
    ) { }

    public function __invoke(array $data): Mail
    {
        $template = config('services.sendgrid.otp_template');

        $recipient = Arr::get($data, 'email');

        $otp = Arr::get($data, 'otp');

        $logo = Arr::get($data, 'company_logo');

        $this->mail->setTemplateId($template);

        $this->mail->addTo($recipient);

        $this->mail->addSubstitutions([
            'subject' => 'Uplist Verification Code',
            'company_logo' => $logo,
            'otp' => $otp,
        ]);

        return $this->mail;
    }
}
