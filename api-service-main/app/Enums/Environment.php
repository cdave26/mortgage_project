<?php

namespace App\Enums;

enum Environment: string
{
    const PRODUCTION = 'production';
    const STAGING = 'staging';
    const DEVELOPMENT = 'development';
    const LOCAL = 'local';
}
