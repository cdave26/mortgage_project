<?php

namespace App\Actions\Fortify;

use App\Models\PricingEngine;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input)
    {
        Validator::make($input, [
            'first_name' => ['required', 'string', 'max:50'],
            'last_name' => ['required', 'string', 'max:50'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique(User::class),
            ],
            'company_id' => [
                'required',
                'integer',
                'exists:App\Models\Company,id'
            ],
            'user_type_id' => [
                'required',
                'integer',
                'exists:App\Models\UserType,id'
            ],
            'mobile_number' => ['nullable', 'string', 'max:20'],
            'job_title' => ['nullable', 'string', 'max:50'],
            'nmls_num' => ['nullable', 'string', 'max:50']
        ])
        ->stopOnFirstFailure()
        ->validate();

        $uplistPricingEngine = PricingEngine::where('name', 'Optimal Blue')->first();
        
        $randomPassword = generate_password();

        $user = User::create([
            'first_name' => $input['first_name'],
            'last_name' => $input['last_name'],
            'email' => $input['email'],
            'username' => $input['email'],
            'password' => Hash::make($randomPassword),
            'company_id' => $input['company_id'],
            'user_type_id' => $input['user_type_id'],
            'pricing_engine_id' => $uplistPricingEngine->id,
            'job_title' => $input['job_title'] ?? "",
            'nmls_num' => $input['nmls_num'] ?? "",
            'mobile_number' => $input['mobile_number'] ?? "",
            'first_time_login' => true
        ]);

        $urlIdentifier = 'us1' . str_pad($user->id, 6, '0', STR_PAD_LEFT);

        $user->url_identifier = $urlIdentifier;
        $user->save();

        return $user;
    }
}
