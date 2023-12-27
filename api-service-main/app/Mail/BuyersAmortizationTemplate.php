<?php

namespace App\Mail;

use App\Enums\LoanType;
use Illuminate\Support\Arr;

class BuyersAmortizationTemplate
{
    protected LoanType $loanType;

    protected float $interestRate;

    protected float $annualPercentageRate;

    protected float $monthlyPrincipalInterest;

    protected float $tax;

    protected float $insurance;

    protected float $mortgageInsurance;

    protected float $totalPayment;

    protected float $homeownersAssociationFee;

    public function __construct(array $amortization)
    {
        $this->loanType = LoanType::from(Arr::get($amortization, 'loan_type'));
        $this->interestRate = Arr::get($amortization, 'interest_rate');
        $this->annualPercentageRate = Arr::get($amortization, 'annual_percentage_rate');
        $this->monthlyPrincipalInterest = Arr::get($amortization, 'monthly_principal_interest');
        $this->tax = Arr::get($amortization, 'tax');
        $this->insurance = Arr::get($amortization, 'insurance');
        $this->mortgageInsurance = Arr::get($amortization, 'mortgage_insurance');
        $this->totalPayment = Arr::get($amortization, 'total_payment');
        $this->homeownersAssociationFee = Arr::get($amortization, 'homeowners_association_fee');
    }

    public function text($value): string
    {
        return <<<HTML
        <table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="15a2e9c3-174d-4ec8-bc1d-54f864a7a407.1" data-mc-module-version="2019-10-22">
            <tbody>
                <tr>
                    <td style="padding:18px 0px 18px 0px; line-height:30px; text-align:inherit;" height="100%" valign="top" bgcolor="" role="module-content">
                        <div>
                            <div style="font-family: inherit; text-align: inherit">
                                <span style="color: #000; font-size: 18px">
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
                        <table width="200" style="width:200px; border-spacing:0; border-collapse:collapse; margin:0px 10px 0px 0px;" cellpadding="0" cellspacing="0" align="left" border="0" bgcolor="" class="column column-0">
                            <tbody>
                                <tr>
                                    <td style="padding:0px;margin:0px;border-spacing:0;">
                                        <table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="dc635081-a9a6-461b-9c10-4173b6bbf2fc.1.1.1" data-mc-module-version="2019-10-22">
                                            <tbody>
                                                <tr>
                                                    <td style="padding:0px 0px 0px 0px; line-height:27px; text-align:inherit;" height="100%" valign="top" bgcolor="" role="module-content">
                                                        <div>
                                                            <div style="font-family: inherit; text-align: inherit">
                                                                <span style="color: #000; font-size: 18px">$label</span>
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
                                        <table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="f6186005-e2f1-47fd-ae02-c6419101282c.1.1.1" data-mc-module-version="2019-10-22">
                                            <tbody>
                                                <tr>
                                                    <td style="padding:0px 0px 0px 0px; line-height:27px; text-align:inherit;" height="100%" valign="top" bgcolor="" role="module-content">
                                                        <div>
                                                            <div style="font-family: inherit; text-align: inherit">
                                                                <span style="color: #000; font-family: arial, helvetica, sans-serif; font-size: 18px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space-collapse: preserve; text-wrap: wrap; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; float: none; display: inline">
                                                                    $value
                                                                </span>
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

    public function total($value): string
    {
        return <<<HTML
        <table border="0" cellpadding="0" cellspacing="0" align="center" width="100%" role="module" data-type="columns" style="padding:0px 0px 0px 0px;" bgcolor="#FFFFFF" data-distribution="1,1">
            <tbody>
                <tr role="module-content">
                    <td height="100%" valign="top">
                        <table width="200" style="width:200px; border-spacing:0; border-collapse:collapse; margin:0px 10px 0px 0px;" cellpadding="0" cellspacing="0" align="left" border="0" bgcolor="" class="column column-0">
                            <tbody>
                                <tr>
                                    <td style="padding:0px;margin:0px;border-spacing:0;">
                                        <table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="dc635081-a9a6-461b-9c10-4173b6bbf2fc.1.1.1.1.2" data-mc-module-version="2019-10-22">
                                            <tbody>
                                                <tr>
                                                    <td style="padding:2px 0px 2px 0px; line-height:27px; text-align:inherit;" height="100%" valign="top" bgcolor="" role="module-content">
                                                        <div>
                                                            <div style="font-family: inherit; text-align: inherit">
                                                                <span style="font-size: 18px; color: #000">
                                                                    <strong>Total:</strong>
                                                                </span>
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
                                        <table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="f6186005-e2f1-47fd-ae02-c6419101282c.1.1.1.1.2" data-mc-module-version="2019-10-22">
                                            <tbody>
                                                <tr>
                                                    <td style="padding:0px 0px 0px 0px; line-height:30px; text-align:inherit;" height="100%" valign="top" bgcolor="" role="module-content">
                                                        <div>
                                                            <div style="font-family: inherit; text-align: inherit">
                                                                <span style="font-family: arial, helvetica, sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space-collapse: preserve; text-wrap: wrap; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; float: none; display: inline; color: #000; font-size: 18px">
                                                                    <strong>$value</strong>
                                                                </span>
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

    public function __toString(): string
    {
        $loanType = match($this->loanType) {
            LoanType::NON_CONFORMING => 'Jumbo',
            default => $this->loanType->value,
        };

        $interestRate = bcdiv($this->interestRate, 1, 3);
        $annualPercentageRate = bcdiv($this->annualPercentageRate, 1, 3);

        $amortization = [
            $this->text($loanType),
            $this->columns('Rate/APR:', implode(' / ', [
                "{$interestRate}%",
                "{$annualPercentageRate}%",
            ])),
            $this->columns('P&I:', currency_format($this->monthlyPrincipalInterest)),
            $this->columns('Taxes:', currency_format($this->tax)),
            $this->columns('Insurance:', currency_format($this->insurance)),
            $this->columns('MI:', currency_format($this->mortgageInsurance)),
            $this->total(currency_format($this->totalPayment)),
            $this->columns('HOA Dues:', currency_format($this->homeownersAssociationFee)),
        ];

        return implode($amortization);
    }
}
