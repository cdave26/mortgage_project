<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Auth\Recaller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use Symfony\Component\HttpFoundation\Response;

class RememberMe
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Prerequisite: Use `auth:web` middleware

        $response = $next($request);

        if ($request->is('*/login')) {
            return $response;
        }

        $key = Auth::guard()->getRecallerName();

        $cookie = $request->cookie($key);

        $recaller = $cookie ? new Recaller($cookie) : null;

        $user = Auth::user();

        $token = $user?->getRememberToken();

        $provider = Auth::guard()->getProvider();

        if ($token && $token !== $recaller?->token()) {
            $provider->updateRememberToken($user, null);
            Auth::logout();
            return $response;
        }

        if ($token && !Session::get('migrated')) {
            Session::put('migrated', true);
            Session::migrate();
        }

        return $response;
    }
}
