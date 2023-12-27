<?php

namespace App\Http\Responses;

use Illuminate\Validation\ValidationException;
use Laravel\Fortify\Http\Responses\FailedPasswordResetResponse as FortifyFailedPasswordResetResponse;

class FailedPasswordResetResponse extends FortifyFailedPasswordResetResponse
{
    /**
     * The response status language key.
     *
     * @var string
     */
    protected $status;

    /**
     * Create a new response instance.
     *
     * @param  string  $status
     * @return void
     */
    public function __construct(string $status)
    {
        $this->status = $status;
    }

    /**
     * Create an HTTP response that represents the object.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function toResponse($request)
    {
        throw ValidationException::withMessages([
            'email' => [trans($this->status)],
        ]);
    }
}
