<?php

namespace App\Services;

use Aws\Exception\AwsException;
use Aws\Sns\SnsClient;

class AmazonMessagingService extends Service
{
    public function __construct(
        protected SnsClient $client,
    ) { }

    public function send(array $data)
    {
        try {
            $this->client->publish([
                'Message' => $data['message'],
                'PhoneNumber' => $data['to'],
            ]);
        } catch (AwsException $exception) {
            $this->abort($exception);
        }
    }
}
