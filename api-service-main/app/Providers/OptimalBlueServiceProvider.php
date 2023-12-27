<?php

namespace App\Providers;

use App\Services\OptimalBlueService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\ServiceProvider;

class OptimalBlueServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->singleton(OptimalBlueService::class, fn () => new OptimalBlueService);
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        Http::macro('optimalBlue', function (string $token) {
            return Http::baseUrl('https://marketplace.optimalblue.com')
                ->withHeaders([
                    'api-version' => 3,
                ])
                ->withToken($token)
                ->acceptJson()
                ->asJson()
                ->throw();
        });
    }
}
