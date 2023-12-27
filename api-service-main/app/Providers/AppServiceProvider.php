<?php

namespace App\Providers;

use App\Mail\OTPVerificationCode;
use App\Services\AuthenticationService;
use App\Services\BuyerService;
use App\Services\BuyersPreApprovalRequestService;
use App\Services\OTPService;
use App\Services\RegistrationService;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(OTPService::class, function (Application $app) {
            return new OTPService($app->make(OTPVerificationCode::class));
        });

        $this->app->singleton(RegistrationService::class, fn () => new RegistrationService);
        $this->app->singleton(AuthenticationService::class, fn () => new AuthenticationService);
        $this->app->singleton(BuyerService::class, fn () => new BuyerService);
        $this->app->singleton(BuyersPreApprovalRequestService::class, fn () => new BuyersPreApprovalRequestService);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
