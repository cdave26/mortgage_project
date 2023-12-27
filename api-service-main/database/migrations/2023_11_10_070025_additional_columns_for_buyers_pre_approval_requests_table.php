<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('buyers_pre_approval_requests', function (Blueprint $table) {
            $table->string('property_type_id', 50)
                ->nullable()
                ->after('zip');

            $table->string('occupancy_type_id', 50)
                ->nullable()
                ->after('county_id');

            $table->string('credit_score_range_id', 50)
                ->nullable()
                ->after('occupancy_type_id');

            $table->boolean('veterans_affairs')
                ->after('credit_score_range_id');

            $table->foreign('property_type_id')
                ->references('id')
                ->on('property_types');

            $table->foreign('occupancy_type_id')
                ->references('id')
                ->on('occupancy_types');

            $table->foreign('credit_score_range_id')
                ->references('id')
                ->on('credit_score_ranges');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('buyers_pre_approval_requests', function (Blueprint $table) {
            $table->dropForeign('buyers_pre_approval_requests_property_type_id_foreign');
            $table->dropForeign('buyers_pre_approval_requests_occupancy_type_id_foreign');
            $table->dropForeign('buyers_pre_approval_requests_credit_score_range_id_foreign');

            $table->dropColumn([
                'property_type_id',
                'occupancy_type_id',
                'credit_score_range_id',
                'veterans_affairs',
            ]);
        });
    }
};
