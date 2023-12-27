<?php

namespace App\Observers;

use App\Enums\UserType;
use App\Facades\SendGridService;
use App\Mail\BorrowerInvitation;
use App\Models\Buyer;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Storage;

class BuyerObserver
{
    /**
     * Handle events after all transactions are committed.
     *
     * @var bool
     */
    public $afterCommit = true;

    public function __construct(
        protected BorrowerInvitation $invitation,
    ) { }

    /**
     * Handle the Buyer "created" event.
     */
    public function created(Buyer $buyer): void
    {
        $buyer = $buyer->load([
            'borrower',
            'borrower.company',
            'loanOfficer',
        ])->toArray();

        $buyer = Arr::dot($buyer);

        $data = Arr::only($buyer, [
            'borrower.company.company_logo',
            'borrower.company.allow_loan_officer_to_upload_logo',
            'borrower.company.name',
            'borrower.company.code',
            'loan_officer.first_name',
            'loan_officer.last_name',
            'loan_officer.email',
            'loan_officer.mobile_number',
            'loan_officer.custom_logo_flyers',
            'loan_officer.user_type_id',
            'borrower.email',
            'borrower.first_name',
            'code',
        ]);

        $companyLogo = $data['borrower.company.company_logo'];
        $allowLOtoUploadLogo = $data['borrower.company.allow_loan_officer_to_upload_logo'];
        $customLogoFlyers = $data['loan_officer.custom_logo_flyers'];
        $LOUserType = $data['loan_officer.user_type_id'];

        $logo = null;

        if(
            $allowLOtoUploadLogo &&
            $LOUserType === UserType::LOAN_OFFICER->id() &&
            $customLogoFlyers &&
            Storage::exists($customLogoFlyers)
        ) {
            $logo = Storage::url($customLogoFlyers);
        } elseif($companyLogo && Storage::exists($companyLogo)) {
            $logo = Storage::url($companyLogo);
        } else {
            $logo = config('services.sendgrid.default_company_logo');
        }

        $data['borrower.company.company_logo'] = $logo;

        $invitation = $this->invitation->__invoke(
            Arr::undot($data),
        );

        SendGridService::send($invitation);
    }
}
