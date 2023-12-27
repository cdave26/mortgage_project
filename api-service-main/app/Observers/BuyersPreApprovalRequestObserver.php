<?php

namespace App\Observers;

use App\Enums\UserType;
use App\Facades\SendGridService;
use App\Mail\BuyersPreApprovalRequestLetter;
use App\Models\BuyersPreApprovalRequest;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Storage;

class BuyersPreApprovalRequestObserver
{
    /**
     * Handle events after all transactions are committed.
     *
     * @var bool
     */
    public $afterCommit = true;

    public function __construct(
        protected BuyersPreApprovalRequestLetter $letter,
    ) { }

    /**
     * Handle the Buyer "created" event.
     */
    public function created(BuyersPreApprovalRequest $request): void
    {
        $request = $request->load([
            'buyer',
            'buyer.borrower',
            'buyer.borrower.company',
            'buyer.loanOfficer',
            'buyer.loanOfficer.company',
            'buyer.amortizations',
            'buyer.unit',
            'county',
            'propertyType',
            'occupancyType',
            'creditScoreRange',
        ])->toArray();

        $amortizations = Arr::get($request, 'buyer.amortizations');

        $dotted = Arr::dot($request);

        $request = Arr::only($dotted, [
            'buyer.loan_officer.first_name',
            'buyer.loan_officer.last_name',
            'buyer.loan_officer.email',
            'buyer.loan_officer.user_type_id',
            'buyer.loan_officer.company.company_logo',
            'buyer.loan_officer.company.allow_loan_officer_to_upload_logo',
            'buyer.loan_officer.custom_logo_flyers',
            'buyer.borrower.first_name',
            'buyer.borrower.last_name',
            'buyer.borrower.email',
            'buyer.borrower_address',
            'buyer.borrower_city',
            'buyer.borrower_zip',
            'address',
            'city',
            'zip',
            'county.name',
            'price',
            'down_payment_type',
            'down_payment',
            'loan_amount',
            'tax',
            'homeowners_association_fee',
            'seller_credit',
            'credit_score_range.description',
            'buyer.debt_to_income_ratio',
            'occupancy_type.description',
            'property_type.description',
            'buyer.unit.id',
            'buyer.first_time_home_buyers',
            'veterans_affairs',
            'buyer.loan_id',
        ]);

        $loanOfficerUserType = $request['buyer.loan_officer.user_type_id'];
        $isLoanOfficer = $loanOfficerUserType === UserType::LOAN_OFFICER->id();
        $companyLogo = $request['buyer.loan_officer.company.company_logo'];
        $allowLOtoUploadLogo = $request['buyer.loan_officer.company.allow_loan_officer_to_upload_logo'];
        $customLogoFlyers = $request['buyer.loan_officer.custom_logo_flyers'];

        $logo = null;
        if(
            $allowLOtoUploadLogo &&
            $isLoanOfficer &&
            $customLogoFlyers &&
            Storage::exists($customLogoFlyers)
        ) {
            $logo = Storage::url($customLogoFlyers);
        } elseif ($companyLogo && Storage::exists($companyLogo)) {
            $logo = Storage::url($companyLogo);
        } else {
            $logo = config('services.sendgrid.default_company_logo');
        }

        $request = Arr::undot($request);

        Arr::set($request, 'buyer.amortizations', $amortizations);

        Arr::set($request, 'buyer.borrower.company.company_logo', $logo);

        $letter = $this->letter->__invoke($request);

        SendGridService::send($letter);
    }
}
