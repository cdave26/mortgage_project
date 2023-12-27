<?php

namespace App\Http\Responses;

use Laravel\Fortify\Http\Responses\LogoutResponse as FortifyLogoutResponse;

class LogoutResponse extends FortifyLogoutResponse
{
    public function toResponse($request)
    {
        return response()->json(["result" => "success"]);
    }
}