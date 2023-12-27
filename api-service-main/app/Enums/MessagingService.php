<?php

namespace App\Enums;

enum MessagingService: string
{
    case TWILIO = 'TWILIO';
    case AWS = 'AWS';
}
