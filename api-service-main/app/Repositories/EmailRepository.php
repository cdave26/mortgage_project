<?php

namespace App\Repositories;

use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use SendGrid\Mail\Mail;

class EmailRepository
{
    /**
     * Sendgrid
     *
     * @var $sendgrid
     */
    protected $sendgrid;

    /**
     * EmailRepository constructor.
     *
     */
    public function __construct()
    {
        $this->sendgrid = new \SendGrid(config('services.sendgrid.key'));
    }

    private function getError($exception): Exception
    {
        Log::error($exception);
        throw new Exception(
            trans('messages.error.generic'),
            JsonResponse::HTTP_UNPROCESSABLE_ENTITY
        );
    }

    /**
     * @var $payload array
     */
    public function generateToken($payload)
    {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = json_encode($payload);

        // Encode Header to Base64Url String
        $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));

        // Encode Payload to Base64Url String
        $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));

        // Create Signature Hash
        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, 'abC123!', true);

        // Encode Signature to Base64Url String
        $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

        // Create JWT
        $token = $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;

        return $token;
    }

    public function sendStripeRedirectEmail ($user, $redirectLink)
    {
        $email = new Mail();
        $welcomeEmailTemplate = config('services.sendgrid.stripe_redirect_template');

        $email->setFrom(config('uplist.admin_email'), config('uplist.admin_name'));
        $email->addTo(
            $user->email,
            $user->first_name . ' '. $user->last_name, 
            [
                'subject' => 'Welcome to Uplist!',
                'redirect_link' => config('uplist.client_app_url') . $redirectLink,
            ],
            0
        );
        $email->setTemplateId($welcomeEmailTemplate);
        
        try {
            $response = $this->sendgrid->send($email);
            return $response;
        } catch (Exception $e) {
            return $this->getError($e);
        }
    }

    public function sendSuccessCheckoutEmail ($customer, $randomPassword)
    {
        $email = new Mail();
        $welcomeEmailTemplate = config('services.sendgrid.success_checkout_template');

        $email->setFrom(config('uplist.admin_email'), config('uplist.admin_name'));
        $email->addTo(
            $customer->email,
            $customer->name, 
            [
                'subject' => 'Uplist login information',
                'login_url' => config('uplist.client_app_url') . '/login',
                'email' => $customer->email,
                'initial_password' => $randomPassword
            ],
            0
        );
        $email->setTemplateId($welcomeEmailTemplate);

        try {
            $response = $this->sendgrid->send($email);
            return $response;
        } catch (Exception $e) {
            return $this->getError($e);
        }
    }

    public function sendVerificationEmail ($user)
    {
        $email = new Mail();
        $welcomeEmailTemplate = config('services.sendgrid.verification_template');

        $token = $this->generateToken(['email' => $user->email, 'code' => 'email_verified']);

        $email->setFrom(config('uplist.admin_email'), config('uplist.admin_name'));
        $email->addTo(
            $user->email,
            $user->first_name . ' '. $user->last_name, 
            [
                'subject' => 'Uplist email verification',
                'verification_link' => config('uplist.client_app_url') . '/?res=verify_email&token=' . $token
            ],
            0
        );
        $email->setTemplateId($welcomeEmailTemplate);
        
        try {
            $response = $this->sendgrid->send($email);
            return $response;
        } catch (Exception $e) {
            return $this->getError($e);
        }
    }

}