<?php

namespace App\Mail;

use SendGrid\Mail\Mail;
use Illuminate\Support\Arr;

class AdminReport
{
    protected $mail;

    public function __construct() {
        $this->mail = new Mail();
    }

    public function __invoke(array $data): Mail
    {
        $template = config('services.sendgrid.admin_report_template');

        $sender = [
            config('uplist.admin_email'),
            config('uplist.admin_name'),
        ];

        $email = Arr::get($data, 'email');
        $name = Arr::get($data, 'name');
        $attachment = Arr::get($data, 'attachment');

        $this->mail->setTemplateId($template);

        $this->mail->setFrom(...$sender);

        $this->mail->addTo(
            $email,
            $name,
            [
                'subject' => 'Uplist Admin Report',
                'first_name' => $name,
                'current_date' => \Carbon\Carbon::now()->toRfc7231String()
            ]
        );

        $file_encoded = base64_encode(file_get_contents($attachment));
        $this->mail->addAttachment(
            $file_encoded,
            "application/vnd.ms-excel",
            "report.xlsx",
            "attachment"
        );

        return $this->mail;
    }
}
