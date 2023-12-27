<?php

namespace App\Services;

use Twilio\Rest\Client;

class TwilioMessagingService extends Service
{
    public function __construct(
        protected Client $client,
    ) { }

    public function send(array $data)
    {
        $sender = config('services.twilio.phone_number');

        $options = [
            'from' => $sender,
            'body' => $data['message'],
        ];

        $this->client->messages->create(
            $data['to'],
            $options,
        );
    }
}
