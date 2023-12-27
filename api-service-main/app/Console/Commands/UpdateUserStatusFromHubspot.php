<?php

namespace App\Console\Commands;

use App\Enums\Hubspot;
use App\Models\User;
use App\Models\UserStatus;
use App\Repositories\HubspotRepository;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class UpdateUserStatusFromHubspot extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user_status:update';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update the user status from Hubspot';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $hubspotRepository = new HubspotRepository();
        $hubspotContacts = [];
        $lastId = '';

        $currentTimestamp = \Carbon\Carbon::now();
        $currentEnv = config('app.env');
        $formattedDisplay = '['. $currentTimestamp . '] - [' . $currentEnv . '] - ';

        $this->info($formattedDisplay . 'Fetching all hubspot contacts');
        do {
            $contactList = $hubspotRepository->getHubspotContactList(100, $lastId);
            $results = $contactList->getResults();
            $paging = $contactList->getPaging();

            $hubspotContacts = [
                ...$hubspotContacts,
                ...$results
            ];

            if($paging) {
                $lastId = $paging['next']['after'];
            } else {
                $lastId = '';
            }
        } while ($lastId !== '');

        if(!$hubspotContacts) {
            $this->info($formattedDisplay . 'No Hubspot contacts retrieved.');
        } else {
            $this->info($formattedDisplay . count($hubspotContacts) . ' Hubspot contacts retrieved.');

            foreach ($hubspotContacts as $contact) {
                $contactProps = $contact['properties'];

                $contactEmail = check_if_has_array_key($contactProps, 'email', null);
                $hubspotRecord = check_if_has_array_key($contactProps, 'hs_object_id', null);

                if(!$contactEmail) {
                    $message = '[{current_timestamp}] - [{env}] - Hubspot user has no email address.';
                    $this->info($formattedDisplay . 'Hubspot record #'. $hubspotRecord .' has no email address.');
                    continue;
                }

                $user = User::whereRaw('LOWER(email) = ?', $contactEmail)
                    ->whereNull('deleted_at')
                    ->first();

                if(!$user) {
                    $noUserOutput = Str::swap([
                        '{current_timestamp}' => $currentTimestamp,
                        '{env}' => $currentEnv,
                        '{user_email}' => $contactEmail,
                    ], '[{current_timestamp}] - [{env}] - {user_email} has no enterprise app record.');

                    $this->info($noUserOutput);
                } else {
                    $hubspotUserStatus = check_if_has_array_key($contactProps, Hubspot::HUBSPOT_CONTACT_USER_STATUS_PROPERTY, null);
    
                    $message = '';
                    if(!$hubspotUserStatus) {
                        $message = '[{current_timestamp}] - [{env}] - User {user_email} has no Uplist user status data on Hubspot.';
                    } else {
                        $userStatus = UserStatus::firstWhere('hubspot_value', $hubspotUserStatus);
                        
                        if(!$userStatus) {
                            $message = '[{current_timestamp}] - [{env}] - User {user_email} has an invalid Uplist user status.';
                        } else {
                            
                            $user->user_status = $userStatus->id;
                            $user->save();
                                
                            $message = '[{current_timestamp}] - [{env}] - User status of {user_email} has been updated successfully.';
                        }
                    }
    
                    $successOutput = Str::swap([
                        '{user_email}' => $user->email,
                        '{current_timestamp}' => $currentTimestamp,
                        '{env}' => $currentEnv,
                    ], $message);
    
                    $this->info($successOutput);
                }
            }
        }

        $this->info($formattedDisplay . 'finished user status update.' . PHP_EOL);
    }
}
