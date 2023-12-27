<?php

namespace App\Mail;

use App\Enums\DownPaymentType;
use App\Enums\Unit;
use Illuminate\Support\Arr;

class BuyersPreApprovalRequestLetter
{
    public function __construct(
        protected Mail $mail,
    ) { }

    public function __invoke(array $data): Mail
    {
        $template = config('services.sendgrid.buyers_pre_approval_request_letter');

        $this->mail->setTemplateId($template);

        $recipient = Arr::get($data, 'buyer.loan_officer.email');
        $borrowerFirstName = Arr::get($data, 'buyer.borrower.first_name');
        $borrowerLastName = Arr::get($data, 'buyer.borrower.last_name');
        $borrowerEmail = Arr::pull($data, 'buyer.borrower.email');

        $borrower = implode(' ', [
            $borrowerFirstName,
            $borrowerLastName,
        ]);

        $price = Arr::get($data, 'price');
        $downPaymentType = Arr::get($data, 'down_payment_type');
        $downPayment = Arr::get($data, 'down_payment');
        $loanAmount = Arr::get($data, 'loan_amount');
        $sellerCredit = Arr::get($data, 'seller_credit');
        $veteransAffairs = Arr::get($data, 'veterans_affairs');
        $firstTimeHomeBuyers = Arr::get($data, 'buyer.first_time_home_buyers');
        $unit = Arr::get($data, 'buyer.unit.id');

        $downPaymentType = DownPaymentType::from($downPaymentType);

        Arr::set($data, 'price', currency_format($price, 0));

        Arr::set($data, 'down_payment', match ($downPaymentType) {
            DownPaymentType::PERCENTAGE => currency_format(($downPayment / 100) * $price, 0),
            default => currency_format($downPayment, 0),
        });

        Arr::set($data, 'loan_amount', currency_format($loanAmount, 0));
        Arr::set($data, 'seller_credit', currency_format($sellerCredit));
        Arr::set($data, 'veterans_affairs', $veteransAffairs ? 'Y' : 'N');
        Arr::set($data, 'buyer.first_time_home_buyers', $firstTimeHomeBuyers ? 'Y' : 'N');

        Arr::set($data, 'buyer.unit', match (Unit::from($unit)) {
            Unit::ONE => 1,
            Unit::TWO => 2,
            Unit::THREE => 3,
            Unit::FOUR => 4,
            default => 0,
        });

        $tax = Arr::pull($data, 'tax');
        $homeownersAssociationFee = Arr::pull($data, 'homeowners_association_fee');
        $amortizations = Arr::pull($data, 'buyer.amortizations');

        $html = [];

        foreach ($amortizations as $amortization) {
            $html[] = (string) new BuyersAmortizationTemplate([
                'tax' => $tax,
                'homeowners_association_fee' => $homeownersAssociationFee,
                ...$amortization,
            ]);
        }

        Arr::set($data, 'buyer.amortizations', implode($html));

        Arr::set($data, 'property', (string) new BuyersPropertyTemplate($data));

        $this->mail->addTo($recipient, null, [
            'subject' => "Pre-approval Request Letter from $borrower",
            ...$data,
        ]);

        $this->mail->addCc($borrowerEmail);

        return $this->mail;
    }
}
