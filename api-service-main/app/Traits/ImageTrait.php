<?php

namespace App\Traits;
use App\Models\Company;
use Illuminate\Support\Facades\Storage;
use App\Models\User;
use Spatie\Image\Image;
use Spatie\Image\Manipulations;
trait ImageTrait
{
    public function resizeCompanyImage($user, $width, $height)
    {
        $logo = Company::select('company_logo')
                       ->where('id', $user->company_id)
                       ->first();
        
        if (empty($logo->company_logo)) {
            return '';
        }

        $logoUrl = str_replace('\\', '/', $logo->company_logo);

        $newImagePath = "resize_company_logo/";

        Storage::disk('public')->makeDirectory($newImagePath . 'company_logo/', 0775, true, true);

        $tmpFileName = $newImagePath . $logoUrl;

        Storage::disk('public')->put($tmpFileName, Storage::get($logoUrl));

        $tmpPublicPath = Storage::disk('public')->path($tmpFileName);

        Image::load($tmpPublicPath)
            ->fit(Manipulations::FIT_FILL_MAX, $width, $height)
            ->optimize()
            ->blur(0.20)
            ->save($tmpPublicPath);
        
        Storage::put($tmpFileName, Storage::disk('public')->get($tmpFileName));

        if(config('filesystems.default') !== 'public') {
            Storage::disk('public')->delete($tmpFileName);
        }

        $resizedImageUrl = Storage::url($tmpFileName);

        //For Ngrok Testing - uncomment then replace filename
        // $resizedImageUrl = "https://ba77-120-28-216-162.ngrok-free.app/storage/resize_company_logo/company_logo/mF7mGBFqr4hKMwaQIssnoZrrl4S5f2sgQIpj9jiW.png";

        return $resizedImageUrl;

    }

    public function resizePortraitImage($user)
    {
        $portrait = $user->profile_logo;

        if (empty($user->profile_logo)) {
            return '';
        }

        $portraitUrl = str_replace('\\', '/', $portrait);

        $newImagePath = "resize_profile/";

        Storage::disk('public')->makeDirectory($newImagePath . 'profile_logo/', 0775, true, true);

        $tmpFileName = $newImagePath . $portraitUrl;

        Storage::disk('public')->put($tmpFileName, Storage::get($portraitUrl));

        $tmpPublicPath = Storage::disk('public')->path($tmpFileName);

        Image::load($tmpPublicPath)
            ->fit(Manipulations::FIT_FILL_MAX, 100, 100)
            ->optimize()
            ->blur(0.20)
            ->save($tmpPublicPath);
        
        Storage::put($tmpFileName, Storage::disk('public')->get($tmpFileName));

        if(config('filesystems.default') !== 'public') {
            Storage::disk('public')->delete($tmpFileName);
        }

        $resizedImageUrl = Storage::url($tmpFileName);

        //For Ngrok Testing - uncomment then replace filename
        //$resizedImageUrl = "https://ba77-120-28-216-162.ngrok-free.app/storage/resized_profile/profile_logo/zs3gBxf8CKG2aFhFyM7wgVKCgGd80g8RX5ShyQv1.png";
        
        return $resizedImageUrl;
    }

    
}