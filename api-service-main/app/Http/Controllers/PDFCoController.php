<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\JsonResponse;
use App\Services\FlyerGenerationService;
use Illuminate\Support\Facades\Http;
use App\Models\Listing;

class PDFCoController extends Controller
{
    private $flyerService;
    private $urlReplaceText = 'https://api.pdf.co/v1/pdf/edit/replace-text';
    private $urlReplaceTextWithImage = 'https://api.pdf.co/v1/pdf/edit/replace-text-with-image';

    public function __construct(FlyerGenerationService $flyerService)
    {
        $this->flyerService = $flyerService;
    }

    public function generateFlyers(Request $request): JsonResponse
    {
        $user = Auth::user();
        $listing = Listing::findOrFail($request['listing_id']);
        $loanOfficer = $listing->user;
        // Check if logo is empty
        $logo = $this->flyerService->resizeCompanyImage($loanOfficer, 150, 150);
        if ($logo === '') {
            return $this->error([
                'message' => "No company logo, please contact your company admin."
            ], JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
        }

        // Check if portrait is empty
        $portrait = $this->flyerService->resizePortraitImage($loanOfficer);
        if ($portrait === '') {
               $portrait = config('filesystems.disks.s3.url') . '/assets/profile-image.jpeg';
        }

        $stringReplaceUrl = self::doSendRequest(
            $this->flyerService->createStringReplacePayload($request, $loanOfficer),
            $this->urlReplaceText
        );

        $logoReplaceUrl = self::doSendRequest(
            $this->flyerService->logoReplacePayload($stringReplaceUrl, $request->searchString, $loanOfficer, $request->flyer_id),
            $this->urlReplaceTextWithImage
        );

        $QrReplaceUrl = self::doSendRequest(
            $this->flyerService->QrReplacePayload($logoReplaceUrl, $request->searchQrString, $request->replaceQrImage),
            $this->urlReplaceTextWithImage
        );

        $portraitReplaceUrl = self::doSendRequest(
            $this->flyerService->portraitReplacePayload($QrReplaceUrl, 'img_prt', $loanOfficer),
            $this->urlReplaceTextWithImage
        );
           
        $mediumLogoUrl = self::doSendRequest(
            $this->flyerService->mediumLogoReplacePayload($portraitReplaceUrl, 'md_logo', $loanOfficer),
            $this->urlReplaceTextWithImage
        );

        $generatedFlyerUrl = self::doSendRequest(
            $this->flyerService->smallLogoReplacePayload($mediumLogoUrl, $request->searchSmlLogoString, $loanOfficer),
            $this->urlReplaceTextWithImage
        );

        $this->flyerService->downloadAndSaveGeneratedFlyer($generatedFlyerUrl, $request, $loanOfficer);

        return $this->success([
            'message' => trans('messages.success.create', [
                'resource' => 'flyer',
            ])
        ]);
    }

    private function doSendRequest(array $payload, string $url): string
    {
        $promise =  Http::withHeaders([
            'Content-Type' => 'application/json',
            'x-api-key' => config('services.pdf_co.api_key'),
        ])->post($url, $payload);
        return $promise['url'];
    }
}
