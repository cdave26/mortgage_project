<?php

namespace App\Services;

use App\Enums\UserStatus;
use App\Enums\UserType;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthenticationService extends Service
{
    public function authenticate(array $data): ?User
    {
        $email = Arr::get($data, 'email');

        $password = Arr::get($data, 'password');

        $company = Arr::get($data, 'company');

        $ip = Arr::get($data, 'ip');

        $now = Carbon::now();

        $user = User::with([
            'buyer:borrower_id,id',
            'trustedDevices' => function ($query) use ($now, $ip) {
                    $query->where([
                        ['expires_at', '>', $now],
                        ['ip_address', '=', $ip],
                    ]);
                },
            ])
            ->firstWhere(function (Builder $query) use ($email) {
                $query->where(function (Builder $query) use ($email) {
                    $query->where('email', $email)
                        ->orWhere('username', $email);
                })
                ->where(function (Builder $query) {
                    $query->where('user_status', UserStatus::ACTIVE)
                        ->orWhere('user_status', UserStatus::ACTIVE_TRIAL);
                });
            });

        if (is_null($company) && $user?->user_type_id === UserType::BUYER->id()) {
            return null;
        }

        if ($company && $user?->company_id != $company) {
            if ($user?->user_type_id !== UserType::UPLIST_ADMIN->id())
                return null;
        }

        if (Hash::check($password, $user?->password)) {
            $user->update([
                'last_time_login' => $now,
                'last_ip_login' => $ip,
            ]);

            $buyerFirstTimeLogin = fn () => $user->first_time_login
                && $user->user_type_id === UserType::BUYER->id();

            if ($user->trustedDevices->isNotEmpty() || $user->first_time_login) {
                Auth::login($user);
            }

            if ($buyerFirstTimeLogin()) {
                $user->update(['first_time_login' => false]);
            }

            return $user;
        }

        return null;
    }
}
