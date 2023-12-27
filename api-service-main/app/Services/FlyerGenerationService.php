<?php

namespace App\Services;
use App\Repositories\FlyerRepository;
use App\Traits\ImageTrait;
use App\Helpers\Disclosure;
use App\Models\Listing;
use App\Models\Flyer;
class FlyerGenerationService
{
    use ImageTrait;
    private $urlReplaceText = 'https://api.pdf.co/v1/pdf/edit/replace-text';
    private $urlReplaceTextWithImage = 'https://api.pdf.co/v1/pdf/edit/replace-text-with-image';
    private $loanOfficer;
    private $flyerRepo;
    public function __construct(FlyerRepository $flyerRepo)
    {
        $this->flyerRepo = $flyerRepo;
    }
    public function getFlyerImages(): object
    {
        return $this->flyerRepo->doFetchFlyerImages();
    }
    public function centerText($text, $flyerName){
        if($flyerName == 'throwback_yellow' || $flyerName == 'throwback_blue'){
            $new_text = str_pad($text, 50, " ", STR_PAD_BOTH);
            if(strlen($text) <= 12){
                $new_text = "    " . $new_text;
            }elseif (strlen($text) <= 13) {
                $new_text = " " . $new_text;
            }elseif (strlen($text) <= 15) {
                $new_text = "  " . $new_text;
            }elseif (strlen($text) <= 20) {
                $new_text = "  " . str_pad($text, 42, " ", STR_PAD_BOTH);
            }else{
                $new_text = "  " . str_pad($text, 38, " ", STR_PAD_BOTH);
            }
            return $new_text;
        }
        return $text;
    }
    public function createStringReplacePayload(object $data, $loanOfficer): array
    {
        $helper = new Disclosure();
        $listing = Listing::findOrFail($data->listing_id);
        $disclosures = $helper->getDisclosure($data->listing_id, $loanOfficer);
        $textWrapeed = implode(' ', $disclosures);
        $wrappedDisclosures = wordwrap($textWrapeed, $this->getTextSize($data->flyer_id), "\n", false);
        $flyerName = $this->getFlyerName($data->flyer_id);
        $addressWrapped = wordwrap($this->getAddress($data->listing_id, $data->flyer_id), 30, "\n", false);
        $down =  (int)$listing->property_value * ((int)$listing->default_down_payment / 100);
        return [
            'url' => $data->url,
            'searchStrings' => $data->input('searchStrings'),
            'replaceStrings' => [
                $this->centerText($loanOfficer->full_name, $flyerName),
                is_null($loanOfficer->alternative_email) ? $this->centerText($loanOfficer->email, $flyerName) : $this->centerText($loanOfficer->alternative_email, $flyerName),
                $this->centerText($loanOfficer->mobile_number, $flyerName),
                $this->centerText('NMLS# ' . $loanOfficer->nmls_num, $flyerName),
                $wrappedDisclosures,
                '',
                '',
                '',
                $addressWrapped,
                $this->getDP($data->listing_id),
                $this->centerText($loanOfficer->job_title, $flyerName),
                currency_format($down, 0),
                currency_format((int)$listing->property_value, 0),
            ],
        ];
    }

    public function logoReplacePayload($url, $searchString, $loanOfficer, $flyerId): array
    {
        $flyer = Flyer::findOrFail($flyerId);
        if ($flyer->name === 'tech_green') {
                 $logo = $this->resizeCompanyImage($loanOfficer, null, 68);
        }else{
                $logo = $this->resizeCompanyImage($loanOfficer, null, 80);
        }
        return $this->imageReplace($searchString, $logo, $url);
    }

    public function QrReplacePayload($url, $searchString, $QrUrl): array
    {
        return $this->imageReplace($searchString, $QrUrl, $url);
    }

    public function portraitReplacePayload($url, $searchString, $loanOfficer): array
    {
        $portrait = $this->resizePortraitImage($loanOfficer);
        return $this->imageReplace($searchString, $portrait, $url);
    }

    public function smallLogoReplacePayload($url, $searchString, $loanOfficer): array
    {
        $smallLogo = $this->resizeCompanyImage($loanOfficer, 45, 45);
        return $this->imageReplace($searchString, $smallLogo, $url);
    }

    public function mediumLogoReplacePayload($url, $searchString, $loanOfficer): array
    {
        $smallLogo = $this->resizeCompanyImage($loanOfficer, null, 45);
        return $this->imageReplace($searchString, $smallLogo, $url);

    }

    public function downloadAndSaveGeneratedFlyer($url, $data, $loanOfficer)
    {
        $listing = Listing::findOrFail($data['listing_id']);
        $generated_flyer = $this->flyerRepo->doDownloadGeneratedFlyer($url, $listing, $data['flyer_id']);

        $this->flyerRepo->doSaveGeneratedFlyer([
            'user_id' => $loanOfficer->id,
            'flyer_id' => $data['flyer_id'],
            'generated_flyer' => $generated_flyer,
            'listing_id' => $data['listing_id'],
            'company_id' => $loanOfficer->company_id
        ]);


    }

    private function imageReplace(string $searchString, $image, string $url): array
    {
        return [
            'url' => $url,
            'searchString' => $searchString,
            'replaceImage' => $image,
        ];
    }

    private function getAddress($listing_id, $flyer_id): string
    {
        $listing = Listing::findOrFail($listing_id);

        if ($flyer_id === 3 || $flyer_id === 4) {
            return $listing->property_address;
        }

        $address = $listing->property_address . ' '. PHP_EOL . $listing->property_city . ', '
                   . $listing->state->abbreviation. ' ' . $listing->property_zip;

        return $address;
    }

    private function getTextSize($flyer_id)
    {
        $flyer = Flyer::findOrFail($flyer_id);

        if ($flyer->name === 'tech_green') {
            return 55;
        }
        elseif ($flyer->name === 'bold_blue' || $flyer->name === 'bold_yellow') {
            return 100;
        }

        return 140;
    }

    private function getFlyerName($flyer_id)
    {
        $flyer = Flyer::findOrFail($flyer_id);
        return $flyer->name;
    }

    private function getDP($listing_id)
    {
        $listing = Listing::findOrFail($listing_id);
        return $listing->default_down_payment;

    }

}