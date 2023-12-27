<?php

namespace App\Repositories;
use App\Models\Flyer;
use App\Models\GeneratedFlyer;
use Illuminate\Support\Facades\Storage;
use App\Helpers\FlyerNameGenerator;
use App\Models\Listing;
class FlyerRepository
{
    public function doFetchFlyerImages(): object
    {
        $flyers = Flyer::all();
        return $flyers->map(function ($flyer) {
            return [
                'id' => $flyer->id,
                'image' => Storage::url($flyer->image), 
                'name' => $flyer->name,
                'pdfUrl' => Storage::url($flyer->pdf_name),
            ];
        });

    }

    public function doDownloadGeneratedFlyer(string $url,Listing $listing, $flyer_id): string
    {
        $fileName = 'generated_pdf/us' . 
                    $listing->user->id . 
                    '-' . 
                    $listing->user->nmls_num . 
                    '-flyer-' . 
                    $this->getFlyerName($flyer_id) . 
                    '-' . $listing->id.'.pdf';

        $contents = file_get_contents($url);
        Storage::put($fileName, $contents);

        return $fileName;
    }

    public function doSaveGeneratedFlyer(array $data): void
    {
        GeneratedFlyer::create($data);
    }

    private function getFlyerName($flyer_id): string
    {
        $flyer = Flyer::findOrFail($flyer_id);

        return $flyer->name;
    }
}