<?php

namespace App\Mail;

use App\Enums\CreditScoreRange;
use App\Enums\DownPaymentType;
use App\Enums\OccupancyType;
use Illuminate\Support\Arr;

class BuyersContactRequestTemplate
{
    protected string $sender;

    protected string $email;

    protected string $contactNumber;

    protected ?string $propertyAddress;

    protected string $comments;

    protected ?float $price;

    protected ?DownPaymentType $downPaymentType;

    protected ?float $downPayment;

    protected ?float $sellerCredit;

    protected ?float $loanAmount;

    protected ?CreditScoreRange $creditScoreRange;

    protected ?OccupancyType $occupancyType;

    protected ?bool $veteransAffairs;

    protected ?bool $firstTimeHomeBuyers;

    protected ?array $payments;

    public function __construct(protected array $request)
    {
        $this->sender = Arr::get($request, 'sender');
        $this->email = Arr::get($request, 'email');
        $this->contactNumber = Arr::get($request, 'contact_number');
        $this->propertyAddress = Arr::get($request, 'property_address');
        $this->comments = Arr::get($request, 'comments');
        $this->price = Arr::get($request, 'price');
        $this->downPaymentType = DownPaymentType::tryFrom(Arr::get($request, 'down_payment_type'));
        $this->downPayment = Arr::get($request, 'down_payment');
        $this->sellerCredit = Arr::get($request, 'seller_credit');
        $this->loanAmount = Arr::get($request, 'loan_amount');
        $this->creditScoreRange = CreditScoreRange::tryFrom(Arr::get($request, 'credit_score_range_id'));
        $this->occupancyType = OccupancyType::tryFrom(Arr::get($request, 'occupancy_type_id'));
        $this->veteransAffairs = Arr::get($request, 'veterans_affairs');
        $this->firstTimeHomeBuyers = Arr::get($request, 'first_time_home_buyers');
        $this->payments = Arr::get($request, 'payments');
    }

    public function text($value): string
    {
        return <<<HTML
        <table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="15a2e9c3-174d-4ec8-bc1d-54f864a7a407" data-mc-module-version="2019-10-22">
            <tbody>
                <tr>
                    <td style="padding:18px 0px 18px 0px; line-height:37px; text-align:inherit;" height="100%" valign="top" bgcolor="" role="module-content">
                        <div>
                            <div style="font-family: inherit; text-align: inherit">
                                <span style="color: #0662c7; font-size: 31px">
                                    <strong>$value</strong>
                                </span>
                            </div>
                            <div></div>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
        HTML;
    }

    public function columns(string $label, $value): string
    {
        return <<<HTML
        <table border="0" cellpadding="0" cellspacing="0" align="center" width="100%" role="module" data-type="columns" style="padding:0px 0px 0px 0px;" bgcolor="#FFFFFF" data-distribution="1,1">
            <tbody>
                <tr role="module-content">
                    <td height="100%" valign="top">
                        <table width="290" style="width:290px; border-spacing:0; border-collapse:collapse; margin:0px 10px 0px 0px;" cellpadding="0" cellspacing="0" align="left" border="0" bgcolor="" class="column column-0">
                            <tbody>
                                <tr>
                                    <td style="padding:0px;margin:0px;border-spacing:0;">
                                        <table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="dc635081-a9a6-461b-9c10-4173b6bbf2fc" data-mc-module-version="2019-10-22">
                                            <tbody>
                                                <tr>
                                                    <td style="padding:0px 0px 0px 0px; line-height:27px; text-align:inherit;" height="100%" valign="top" bgcolor="" role="module-content">
                                                        <div>
                                                            <div style="font-family: inherit; text-align: inherit">
                                                                <span style="color: #4b5a6a; font-size: 18px">$label</span>
                                                            </div>
                                                            <div></div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <table width="290" style="width:290px; border-spacing:0; border-collapse:collapse; margin:0px 0px 0px 10px;" cellpadding="0" cellspacing="0" align="left" border="0" bgcolor="" class="column column-1">
                            <tbody>
                                <tr>
                                    <td style="padding:0px;margin:0px;border-spacing:0;">
                                        <table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="f6186005-e2f1-47fd-ae02-c6419101282c" data-mc-module-version="2019-10-22">
                                            <tbody>
                                                <tr>
                                                    <td style="padding:0px 0px 0px 0px; line-height:27px; text-align:inherit;" height="100%" valign="top" bgcolor="" role="module-content">
                                                        <div>
                                                            <div style="font-family: inherit; text-align: inherit">
                                                                <span style="font-size: 18px; color: #00162e">$value</span>
                                                            </div>
                                                            <div></div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>
        HTML;
    }

    public function populatePropertyInformation(array &$request)
    {
        $prerequisite = [
            'property_address', 'price', 'down_payment', 'seller_credit',
        ];

        if (Arr::hasAny($this->request, $prerequisite)) {
            $request[] = $this->text('Property Information');
        }

        if (!is_null($this->propertyAddress)) {
            $request[] = $this->columns('Property address:', $this->propertyAddress);
        }

        if (!is_null($this->price)) {
            $request[] = $this->columns('Price:', currency_format($this->price, 0));
        }

        if (!is_null($this->downPaymentType) && !is_null($this->downPayment)) {
            $request[] = $this->columns('Down payment:', match ($this->downPaymentType) {
                DownPaymentType::PERCENTAGE => currency_format(($this->downPayment / 100) * $this->price, 0),
                default => currency_format($this->downPayment, 0),
            });
        }

        if (!is_null($this->sellerCredit)) {
            $request[] = $this->columns('Seller credit:', currency_format($this->sellerCredit, 0));
        }
    }

    public function populateSearchCriteria(array &$request)
    {
        $prerequisite = [
            'loan_amount', 'down_payment', 'credit_score_range_id',
            'occupancy_type_id', 'veterans_affairs', 'first_time_home_buyers',
        ];

        if (Arr::hasAny($this->request, $prerequisite)) {
            $request[] = $this->text('Search Criteria');
        }

        if (!is_null($this->loanAmount)) {
            $request[] = $this->columns('Loan amount:', currency_format($this->loanAmount, 0));
        }

        if (!is_null($this->downPaymentType) && !is_null($this->downPayment)) {
            $request[] = $this->columns(implode(['Down ', match ($this->downPaymentType) {
                DownPaymentType::PERCENTAGE => '%',
                default => '$',
            }, ':']), match ($this->downPaymentType) {
                DownPaymentType::DOLLAR => currency_format($this->downPayment, 0, ''),
                default => $this->downPayment,
            });
        }

        if (!is_null($this->creditScoreRange)) {
            $request[] = $this->columns('Credit score:', $this->creditScoreRange->description());
        }

        if (!is_null($this->occupancyType)) {
            $request[] = $this->columns('Occupancy:', $this->occupancyType->description());
        }

        if (!is_null($this->veteransAffairs)) {
            $request[] = $this->columns('VA:', $this->veteransAffairs ? 'Y' : 'N');
        }

        if (!is_null($this->firstTimeHomeBuyers)) {
            $request[] = $this->columns('FTHB:', $this->firstTimeHomeBuyers ? 'Y' : 'N');
        }
    }

    public function populateSearchResults(array &$request)
    {
        $payments = Arr::get($this->request, 'payments');

        if (empty($payments)) return;

        $request[] = $this->text('Search Results');

        $amortizations = Arr::map($payments,
            fn (array $amortization, string $key) => [
                ...$amortization, 'loan_type' => $key,
            ]
        );

        foreach ($amortizations as $amortization) {
            $request[] = (string) new BuyersAmortizationTemplate($amortization);
        }
    }

    public function __toString(): string
    {
        $request = [
            $this->text('Property Inquirer'),
            $this->columns('Sender name:', $this->sender),
            $this->columns('Sender email:', $this->email),
            $this->columns('Sender phone:', $this->contactNumber),
            $this->columns('Comments:', $this->comments),
        ];

        $this->populatePropertyInformation($request);
        $this->populateSearchCriteria($request);
        $this->populateSearchResults($request);

        return implode($request);
    }
}
