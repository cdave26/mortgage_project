<?php

namespace App\Http\Responses;

use Laravel\Fortify\Http\Responses\PasswordResetResponse as FortifyPasswordResetResponse;

class PasswordResetResponse extends FortifyPasswordResetResponse
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

    public function toResponse($request)
    {
        return response()->json([
            'success' => true
        ], 200);
    }
}