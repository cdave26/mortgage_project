<?php

namespace App\Services;

use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Arr;
use Symfony\Component\HttpKernel\Exception\HttpException;

class Service
{
    public function populatePayload(array $payload, array $dotted): array
    {
        $default = $payload;

        foreach ($dotted as $key => $value) {
            if (Arr::has($payload, $key)) {
                Arr::set($payload, $key, $value);
            }
        }

        $diff = array_diff(
            Arr::flatten($payload),
            Arr::flatten($default),
        );

        if (filled($diff)) {
            return $payload;
        }

        return [];
    }

    public function abort(\Exception $exception): void
    {
        $code = match (get_class($exception)) {
            ModelNotFoundException::class => JsonResponse::HTTP_NOT_FOUND,
            AuthenticationException::class => JsonResponse::HTTP_UNAUTHORIZED,
            HttpException::class => $exception->getStatusCode(),
            default => JsonResponse::HTTP_INTERNAL_SERVER_ERROR,
        };

        abort($code, $exception->getMessage());
    }
}
