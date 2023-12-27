<?php

use Illuminate\Database\Migrations\Migration;
use App\Models\Flyer;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
     function up(): void
    {
        Flyer::insert([
            [
                'name' => 'casual',
                'image' => 'pdf_featured_images/casual.jpg',
                'pdf_name' => 'flyers_pdf/casual.pdf',
            ],
            [
                'name' => 'understated',
                'image' => 'pdf_featured_images/understated.jpg',
                'pdf_name' => 'flyers_pdf/understated.pdf',
            ],
            [
                'name' => 'bold_blue',
                'image' => 'pdf_featured_images/bold_blue.jpg',
                'pdf_name' => 'flyers_pdf/bold_blue.pdf',
            ],
            [
                'name' => 'bold_yellow',
                'image' => 'pdf_featured_images/bold_yellow.jpg',
                'pdf_name' => 'flyers_pdf/bold_yellow.pdf',
            ],
            [
                'name' => 'elegant_gold',
                'image' => 'pdf_featured_images/elegant_gold.jpg',
                'pdf_name' => 'flyers_pdf/elegant_gold.pdf',
            ],
            [
                'name' => 'elegant_silver',
                'image' => 'pdf_featured_images/elegant_silver.jpg',
                'pdf_name' => 'flyers_pdf/elegant_silver.pdf',
            ],
            [
                'name' => 'throwback_yellow',
                'image' => 'pdf_featured_images/throwback_yellow.jpg',
                'pdf_name' => 'flyers_pdf/throwback_yellow.pdf',
            ],
            [
                'name' => 'throwback_blue',
                'image' => 'pdf_featured_images/throwback_blue.jpg',
                'pdf_name' => 'flyers_pdf/throwback_blue.pdf',
            ],
            [
                'name' => 'tech_green',
                'image' => 'pdf_featured_images/tech_green.jpg',
                'pdf_name' => 'flyers_pdf/tech_green.pdf',
            ],
            [
                'name' => 'company_theme',
                'image' => 'pdf_featured_images/company_theme.jpg',
                'pdf_name' => 'flyers_pdf/company_theme.pdf',
            ]
        ]);
    }
};
