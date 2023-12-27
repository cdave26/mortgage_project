<?php

namespace App\Services;

use App\Enums\UserStatus;
use App\Models\Buyer;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class RegistrationService extends Service
{
    public function borrower(array $data): void
    {
        try {
            $code = data_get($data, 'code');

            $buyer = Buyer::where('code', $code)
                ->firstOrFail();

            if (array_key_exists('password', $data)) {
                $password = data_get($data, 'password');
                $data['password'] = Hash::make($password);
            }

            $attributes = [
                ...$data,
                'user_status' => UserStatus::ACTIVE,
            ];

            User::findOrFail($buyer->borrower_id)
                ->update($attributes);

            $buyer->update([
                'code' => implode('_', [
                    $code,
                    Str::random(5),
                ]),
            ]);

            DB::commit();
        } catch (\Exception $exception) {
            DB::rollBack();
            $this->abort($exception);
        }
    }
}
