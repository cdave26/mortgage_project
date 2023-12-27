<?php

namespace App\Facades;

use Illuminate\Support\Facades\Facade;

class MessagingService extends Facade
{
    /**
     * Get the registered name of the component.
     */
    protected static function getFacadeAccessor(): string
    {
        return 'messaging-service';
    }
}
