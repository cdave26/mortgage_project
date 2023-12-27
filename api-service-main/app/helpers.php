<?php

use App\Models\Company;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

if (!function_exists('currency_format')) {
    function currency_format(float $value, int $decimals = 2, string $symbol = '$'): string
    {
        $value = bcdiv($value, 1, $decimals);

        $currency = implode([
            $symbol,
            ' ',
            number_format($value, $decimals),
        ]);

        return Str::squish($currency);
    }
}

if (!function_exists('data_uri')) {
    function data_uri(string $path): string
    {
        $file = File::get($path);

        $mimeType = File::mimeType($path);

        $data = base64_encode($file);

        return implode([
            'data:', $mimeType, ';base64,', $data,
        ]);
    }
}

if (!function_exists('percentage')) {
    function percentage(float $part, float $whole, int $decimals = 0, string $symbol = '%'): string
    {
        $percentage = ($part / $whole) * 100;

        $percentage = bcdiv($percentage, 1, $decimals);

        return implode([$percentage, $symbol]);
    }
}

if (!function_exists('selected_options')) {
    function selected_options(array $metadata, string $state, string $options): ?array
    {
        if (empty($metadata)) {
            return [];
        }

        $state = Arr::first($metadata, function (array $data) use ($state) {
            return $data['name'] === $state;
        });

        $options = Arr::first($state['validation'] ?? [], function ($validation) use ($options) {
            return $validation['key'] === $options;
        });

        $selected = Arr::where($options['selection'] ?? [], function ($selection) {
            return $selection['checked'];
        });

        return $selected ?? [];
    }
}

if (!function_exists('url_identifier')) {
    function url_identifier(int $id, string $code = 'us1'): string
    {
        return implode([
            $code,
            Str::padLeft($id, 6, 0),
        ]);
    }
}

if (!function_exists('employee_id')) {
    function employee_id(Company $company): string
    {
        $users = $company->users->count();
        $id = Str::padLeft($users, 4, 0);
        $code = Str::substr($company->name, 0, 3);

        return implode([
            Str::upper($code),
            $company->id,
            $id,
        ]);
    }
}

if (!function_exists('format_phone_number')) {
    function format_phone_number($phoneNumber)
    {
        if(!$phoneNumber) {
            return null;
        }
        
        if(substr($phoneNumber, 0, 2) === '+1') {
            return implode(['(', substr($phoneNumber, 2, 3), ')', ' ', substr($phoneNumber, 5, 3), '-', substr($phoneNumber, 8)]);
        }

        if (strlen($phoneNumber) === 10) {
           return implode(['(', substr($phoneNumber, 0, 3), ')', ' ', substr($phoneNumber, 3, 3), '-', substr($phoneNumber, 6)]);
        }

        return $phoneNumber;
    }
}

if (!function_exists('generate_password')) {
    function generate_password(): string
    {
        $digits    = array_flip(range('0', '9'));
        $lowercase = array_flip(range('a', 'z'));
        $uppercase = array_flip(range('A', 'Z'));
        $special   = array_flip(str_split('!@#$%^&*()_+=-}{[}]\|;:<>?/'));
        $combined  = array_merge($digits, $lowercase, $uppercase, $special);

        $password  = str_shuffle(array_rand($digits) .
            array_rand($lowercase) .
            array_rand($uppercase) .
            array_rand($special) .
            implode(array_rand($combined, rand(4, 8))));

        return $password;
    }
}

/**
 * Checks if the property from Hubspot has value or not
 * @param array $property
 * @param string $subProperty
 * @param $fallback - default value that will be returned if there is no property
 * 
 * returns value
 */
if(!function_exists('check_if_has_array_key')) {
    function check_if_has_array_key($property, $subProperty, $fallback): mixed
    {
        if (!array_key_exists($subProperty, $property)) {
            return $fallback;
        };

        if(isset($property[$subProperty]) && $property[$subProperty]) {
            return $property[$subProperty];
        }

        return $fallback;
    }
}

