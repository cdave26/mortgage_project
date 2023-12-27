<?php

namespace App\Mail;

use Illuminate\Support\Arr;

class BuyersPropertyTemplate
{
    protected string $address;

    protected string $city;

    protected int $zip;

    protected string $county;

    protected string $price;

    protected string $downPayment;

    protected string $loanAmount;

    protected ?int $loanId;

    public function __construct(array $property)
    {
        $this->address = Arr::get($property, 'address');
        $this->city = Arr::get($property, 'city');
        $this->zip = Arr::get($property, 'zip');
        $this->county = Arr::get($property, 'county.name');
        $this->price = Arr::get($property, 'price');
        $this->downPayment = Arr::get($property, 'down_payment');
        $this->loanAmount = Arr::get($property, 'loan_amount');
        $this->loanId = Arr::get($property, 'buyer.loan_id');
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
                                        <table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="dc635081-a9a6-461b-9c10-4173b6bbf2fc" data-mc-module-version="2019-10-22">
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
                                        <table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="f6186005-e2f1-47fd-ae02-c6419101282c" data-mc-module-version="2019-10-22">
                                            <tbody>
                                                <tr>
                                                    <td style="padding:0px 0px 0px 0px; line-height:27px; text-align:inherit;" height="100%" valign="top" bgcolor="" role="module-content">
                                                        <div>
                                                            <div style="font-family: inherit; text-align: inherit">
                                                                <span style="font-size: 18px; color: #000">$value</span>
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
        $property = [
            $this->columns('Subject Property:', implode(', ', [
                $this->address,
                $this->city,
                $this->zip,
            ])),
            $this->columns('County:', $this->county),
            $this->columns('Purchase Price:', $this->price),
            $this->columns('Down Payment:', $this->downPayment),
            $this->columns('Loan Amount:', $this->loanAmount),
        ];

        if ($this->loanId) {
            $property[] = $this->columns('Optimal Blue Loan ID:', $this->loanId);
        }

        return implode($property);
    }
}
