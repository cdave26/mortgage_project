<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        DB::table('flyers')->where('name', 'casual')->update([
            'image' => 'pdf_featured_images/casual.png',
        ]);
        DB::table('flyers')->where('name', 'understated')->update([
            'image' => 'pdf_featured_images/understated.png',
        ]);

    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
