<?php

namespace App\Http\Controllers;

use App\Http\Requests\ResetPasswordRequest;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Hash;

class ResetPasswordController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(ResetPasswordRequest $request)
    {
        $data = $request->validated();

        $email = Arr::get($data, 'email');

        $password = Arr::get($data, 'password');

        $password = Hash::make($password);

        $ip = Arr::get($data, 'ip');

        $trusted = Arr::get($data, 'trusted', false);

        $trustThisDeviceExpiration = config('uplist.expiration.trust_this_device');

        $now = Carbon::now();

        $user = User::firstWhere('email', $email);

        $user->update([
            'password' => $password,
            'first_time_login' => false,
        ]);

        if ($trusted) {
            $user->trustedDevices()->create([
                'ip_address' => $ip,
                'expires_at' => $now->addMinutes($trustThisDeviceExpiration),
            ]);
        }

        return $this->success([
            'message' => trans('messages.success.update', [
                'resource' => 'password',
            ]),
        ]);
    }
}
