<?php

namespace App\Providers;

use App\Services\SendGridService;
use Illuminate\Support\ServiceProvider;
use SendGrid;

class SendGridServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $key = config('services.sendgrid.key');
        $mailer = new SendGrid($key);
        $service = new SendGridService($mailer);

        $this->app->singleton(SendGrid::class, fn () => $mailer);
        $this->app->singleton(SendGridService::class, fn () => $service);
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
