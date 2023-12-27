<?php

use App\Enums\UserStatus as EnumsUserStatus;
use App\Models\UserStatus;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        UserStatus::insert([
            [
                'id' => EnumsUserStatus::ACTIVE,
                'description' => EnumsUserStatus::ACTIVE->description(),
                'hubspot_value' => EnumsUserStatus::ACTIVE->hubspotValue(),
                'sequence' => 1
            ],
            [
                'id' => EnumsUserStatus::ON_HOLD,
                'description' => EnumsUserStatus::ON_HOLD->description(),
                'hubspot_value' => EnumsUserStatus::ON_HOLD->hubspotValue(),
                'sequence' => 2
            ],
            [
                'id' => EnumsUserStatus::ACTIVE_TRIAL,
                'description' => EnumsUserStatus::ACTIVE_TRIAL->description(),
                'hubspot_value' => EnumsUserStatus::ACTIVE_TRIAL->hubspotValue(),
                'sequence' => 3
            ],
            [
                'id' => EnumsUserStatus::INACTIVE,
                'description' => EnumsUserStatus::INACTIVE->description(),
                'hubspot_value' => EnumsUserStatus::INACTIVE->hubspotValue(),
                'sequence' => 4
            ],
        ]);
    }
};
