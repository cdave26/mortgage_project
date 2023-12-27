<?php

namespace App\Providers;

use App\Services\EssentService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\ServiceProvider;

class EssentServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->singleton(EssentService::class, fn () => new EssentService);
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        $token = config('services.essent.api_key');

        Http::macro('essent', function () use ($token) {
            return Http::baseUrl('https://api-ratefinder-test.essent.us/api/v1.0/QuoteService')
                ->withHeaders([
                    'Apikey' => $token,
                ])
                ->acceptJson()
                ->asJson()
                ->timeout(180)
                ->throw();
        });
    }
}
