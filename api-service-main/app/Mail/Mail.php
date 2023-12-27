<?php

namespace App\Mail;

use SendGrid\Mail\From;

class Mail extends \SendGrid\Mail\Mail
{
    public function getFrom()
    {
        $email = config('uplist.admin_email');
        $name = config('uplist.admin_name');
        return new From($email, $name);
    }
}
