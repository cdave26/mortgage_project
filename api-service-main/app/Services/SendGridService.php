<?php

namespace App\Services;

use SendGrid;
use SendGrid\Mail\Mail;
use SendGrid\Response;

class SendGridService extends Service
{
    public function __construct(
        protected SendGrid $service,
    ) { }

    public function send(Mail $mail): Response
    {
        return $this->service->send($mail);
    }
}
