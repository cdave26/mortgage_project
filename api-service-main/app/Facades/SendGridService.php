<?php

namespace App\Facades;

use Illuminate\Support\Facades\Facade;

class SendGridService extends Facade
{
    /**
     * Get the registered name of the component.
     */
    protected static function getFacadeAccessor(): string
    {
        return \App\Services\SendGridService::class;
    }
}
