<?php

namespace App\Enums;

enum OTPChannel: string
{
    case SMS = 'SMS';
    case EMAIL = 'EMAIL';
}
