<?php

namespace App\Providers;

use App\Enums\MessagingService;
use App\Services\AmazonMessagingService;
use App\Services\TwilioMessagingService;
use Aws\Credentials\Credentials;
use Aws\Sns\SnsClient;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Support\ServiceProvider;
use Twilio\Rest\Client;

class MessagingServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $key = config('services.aws.key');

        $secret = config('services.aws.secret');

        $region = config('services.aws.region');

        $credentials = new Credentials($key, $secret);

        $snsClientConfig = [
            'credentials' => $credentials,
            'region' => $region,
        ];

        $this->app->singleton(SnsClient::class, fn () => new SnsClient($snsClientConfig));

        $username = config('services.twilio.account_sid');

        $password = config('services.twilio.auth_token');

        $this->app->singleton(Client::class, fn () => new Client($username, $password));

        $this->app->singleton('messaging-service', function (Application $app) {
            $service = config('services.messaging');
            $service = MessagingService::from($service);

            return match ($service) {
                MessagingService::TWILIO => new TwilioMessagingService($app->make(Client::class)),
                MessagingService::AWS => new AmazonMessagingService($app->make(SnsClient::class)),
            };
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
