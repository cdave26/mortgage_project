<?php

namespace App\Http\Controllers;

use App\Facades\SendGridService;
use App\Mail\Welcome;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class ResendInvitationEmailController extends Controller
{
    public function __construct(
        public Welcome $invitation,
    ) { }

    /**
     * Handle the incoming request.
     */
    public function __invoke($id)
    {
        $user = User::where([
            ['id', $id],
            ['first_time_login', true],
        ])->firstOrFail();

        $password = generate_password();

        $user->update([
            'password' => Hash::make($password),
        ]);

        $data = $user->only(['email']);

        $invitation = $this->invitation->__invoke([
            ...$data,
            'password' => $password,
        ]);

        SendGridService::send($invitation);

        return $this->success([
            'message' => trans('messages.resend_invitation_email.success'),
        ]);
    }
}
