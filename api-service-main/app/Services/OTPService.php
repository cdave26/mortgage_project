<?php

namespace App\Services;

use App\Enums\OTPChannel;
use App\Enums\UserStatus;
use App\Enums\UserType;
use App\Facades\MessagingService;
use App\Facades\SendGridService;
use App\Mail\OTPVerificationCode;
use App\Models\LoginLogs;
use Illuminate\Database\Eloquent\Builder;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpKernel\Exception\HttpException;

class OTPService extends Service
{
    public function __construct(
        protected OTPVerificationCode $otpVerificationCode,
    ) { }

    public function generate(array $data): void
    {
        try {
            DB::beginTransaction();

            $user = User::firstWhere(function (Builder $query) use ($data) {
                $query->where('email', $data['email'])
                    ->whereIn('user_status', [UserStatus::ACTIVE, UserStatus::ACTIVE_TRIAL]);
            });

            if (!$user) {
                throw new HttpException(
                    JsonResponse::HTTP_UNPROCESSABLE_ENTITY,
                    trans('messages.error.not_found', [
                        'resource' => 'user',
                    ]),
                );
            }

            $code = random_int(100000, 999999);

            $user->passwordOtps()->create([
                'otp_number' => $code,
            ]);

            $channel = OTPChannel::from($data['channel']);

            if ($channel === OTPChannel::SMS) {
                $message = trans('messages.otp.sms', [
                    'code' => $code,
                    'contact_number' => $user->company->company_mobile_number,
                ]);

                $to = Str::of($user->mobile_number)
                    ->replaceMatches('/[^0-9]/', '')
                    ->prepend('+')
                    ->toString();

                MessagingService::send([
                    'to' => $to,
                    'message' => $message,
                ]);

                DB::commit();
                return;
            }

            $logo = null;
            $LOCustomLogo = null;
            $LOUserType = null;
            
            if($user->user_type_id === UserType::BUYER->id()) {
                $LOCustomLogo = $user->buyer->loanOfficer->custom_logo_flyers;
                $LOUserType = $user->buyer->loanOfficer->user_type_id;
            } else{
                $LOCustomLogo = $user->custom_logo_flyers;
                $LOUserType = $user->user_type_id;
            }

            if(
                $user->company->allow_loan_officer_to_upload_logo &&
                $LOUserType === UserType::LOAN_OFFICER->id() &&
                $LOCustomLogo &&
                Storage::exists($LOCustomLogo)
            ) {
                $logo = Storage::url($LOCustomLogo);
            } elseif($user->company->company_logo && Storage::exists($user->company->company_logo)) {
                $logo = Storage::url($user->company->company_logo);
            } else {
                $logo = config('services.sendgrid.default_company_logo');
            }

            $otpVerificationCode = $this->otpVerificationCode->__invoke([
                ...$data,
                'otp' => $code,
                'company_logo' => $logo,
            ]);

            SendGridService::send($otpVerificationCode);

            DB::commit();
        } catch (\Exception $exception) {
            DB::rollBack();
            $this->abort($exception);
        }
    }

    public function verify(array $data): bool
    {
        try {
            DB::beginTransaction();

            $email = Arr::get($data, 'email');

            $otp = Arr::get($data, 'otp');

            $ip = Arr::get($data, 'ip');

            $trusted = Arr::get($data, 'trusted', false);

            $otpExpiration = config('uplist.expiration.otp');

            $trustThisDeviceExpiration = config('uplist.expiration.trust_this_device');

            $now = Carbon::now();

            $user = User::with([
                'passwordOtps' => fn ($query) => $query
                    ->latest()
                    ->limit(1),
            ])->firstWhere('email', $email);

            $password = Arr::first($user->passwordOtps);

            if ($password === null) {
                throw new HttpException(
                    JsonResponse::HTTP_UNPROCESSABLE_ENTITY,
                    trans('messages.otp.invalid'),
                );
            }

            if ($password->used_at !== null) {
                throw new HttpException(
                    JsonResponse::HTTP_UNPROCESSABLE_ENTITY,
                    trans('messages.otp.invalid'),
                );
            }

            if ($otp !== $password->otp_number) {
                throw new HttpException(
                    JsonResponse::HTTP_UNPROCESSABLE_ENTITY,
                    trans('messages.otp.invalid'),
                );
            }

            $expired = $password->created_at
                ->addMinutes($otpExpiration)
                ->lessThan($now);

            if ($expired) {
                throw new HttpException(
                    JsonResponse::HTTP_UNPROCESSABLE_ENTITY,
                    trans('messages.otp.expired'),
                );
            }

            $password->used_at = $now;

            $password->save();

            LoginLogs::create([
                'user_id' => $user->id,
                'company_id' => $user->company_id,
                'ip_address' => $ip,
            ]);

            if ($trusted) {
                $user->trustedDevices()->create([
                    'ip_address' => $ip,
                    'expires_at' => $now->addMinutes($trustThisDeviceExpiration),
                ]);
            }

            Auth::login($user);

            DB::commit();

            return true;
        } catch (\Exception $exception) {
            DB::rollBack();
            $this->abort($exception);
        }

        return false;
    }
}
