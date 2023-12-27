<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('employee_id')->nullable();
            $table->string('first_name', 50);
            $table->string('last_name', 50);
            $table->string('email')->unique();
            $table->string('alternative_email')->nullable();
            $table->string('job_title', 50);
            $table->string('profile_logo', 120)->nullable();
            $table->string('username')->unique();
            $table->string('password');
            $table->string('mobile_number', 30);
            $table->string('nmls_num', 50);
            $table->string('url_identifier')->nullable();
            $table->string('stripe_subscription_id')->nullable();
            $table->string('stripe_customer_id')->nullable();
            $table->string('stripe_invoice_status')->nullable();
            $table->timestamp('subscription_expired_at')->nullable();
            $table->string('hubspot_contact_id')->nullable();
            $table->timestamp('email_verified_at')->nullable();
            $table->boolean('first_time_login')->default(true);
            $table->timestamp('last_time_login')->nullable();
            $table->string('last_ip_login')->nullable();
            $table->string('custom_logo_flyers')->nullable();
            $table->string('user_status', 50);
            $table->foreignId('deleted_by')->nullable()->constrained('users');
            $table->softDeletes();
            $table->rememberToken();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
