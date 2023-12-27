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
        UserStatus::where('id', EnumsUserStatus::ACTIVE_TRIAL)
            ->update(['hubspot_value' => EnumsUserStatus::ACTIVE_TRIAL->hubspotValue()]);

        UserStatus::where('id', EnumsUserStatus::ACTIVE)
            ->update(['description' => EnumsUserStatus::ACTIVE->description()]);
    }
};
