<?php

namespace App\Mail;

use Illuminate\Support\Arr;

class Welcome
{
    public function __construct(
        protected Mail $mail,
    ) { }

    public function __invoke(array $data): Mail
    {
        $template = config('services.sendgrid.welcome_template');

        $this->mail->setTemplateId($template);

        $email = Arr::get($data, 'email');

        $password = Arr::get($data, 'password');

        $link = implode([
            config('uplist.client_app_url'),
            '/login',
        ]);

        $this->mail->addTo($email);

        $this->mail->addSubstitutions([
            'subject' => 'Welcome to Uplist',
            'redirect_link' => $link,
            'email' => $email,
            'password' => $password,
        ]);

        return $this->mail;
    }
}
