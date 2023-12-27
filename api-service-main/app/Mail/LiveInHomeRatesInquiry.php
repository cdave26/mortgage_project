<?php

namespace App\Mail;

use Illuminate\Support\Str;
use Illuminate\Support\Arr;

class LiveInHomeRatesInquiry
{
    public function __construct(
        protected Mail $mail,
    ) {}

    function populateBuydown($data): array
    {
        $buydown = [];

        foreach ($data as $year => $value) {
            $rate = Arr::get($value, 'interest_rate', 0);
            $totalPayment = Arr::get($value, 'total_payment', 0);
            $monthlyPrincipalInterest = Arr::get($value, 'monthly_principal_interest', 0);
            $tax = Arr::get($value, 'tax', 0);
            $insurance = Arr::get($value, 'insurance', 0);
            $mortgageInsurance = Arr::get($value, 'mortgage_insurance', 0);

            $data = [
                'Buydown' => "Year {$year}",
                'Rate' => implode([bcdiv($rate, 1, 3), '%']),
                'Monthly P&I' => currency_format($monthlyPrincipalInterest),
                'Taxes' => currency_format($tax, 2),
                'Insurance' => currency_format($insurance, 2),
            ];

            if ($mortgageInsurance) {
                $data['MI'] = currency_format($mortgageInsurance);
            }

            $buydown[] = [...$data,
                'Total Payment' => currency_format($totalPayment),
            ];
        }

        return $buydown;
    }

    function convertToHtml(array $data, bool $isBuydown = false)
    {
        $getPaymentDetails = [];

        foreach ($data as $values) {
            $htmlBlocks = [];
            $buydown = Arr::get($values, 'Buydown');

            foreach($values as $key => $value) {
                if (is_object($value) || is_array($value)) continue;

                $detailHtmlBlock = Str::swap([
                    '{label}' => $key,
                    '{value}' => $value,
                ],
                    '<table role="module" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout:fixed">
                        <tbody>
                            <tr>
                                <td
                                    style="padding:2px 0px;font-family:Helvetica,sans-serif;font-size:16px;line-height:22px;text-align:inherit"
                                    height="100%"
                                    valign="top"
                                    bgcolor=""
                                    role="module-content"
                                >
                                    <div style="font-family:Helvetica,sans-serif;font-size:inherit;line-height:inherit;text-align:inherit">
                                        <span style="font-family:Helvetica,sans-serif;font-size:inherit;line-height:inherit;">{label}</span> :
                                        <span style="font-family:Helvetica,sans-serif;font-size:inherit;line-height:inherit;">{value}</span>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>'
                );

                array_push($htmlBlocks, $detailHtmlBlock);
            }

            if (is_array($buydown) && !empty($buydown)) {
                $buydown = $this->populateBuydown($buydown);
                $htmlBlocks[] = $this->convertToHtml($buydown, true);
            }

            $getPaymentDetails[] = implode("", $htmlBlocks);
        }

        $wrapped = [];

        foreach ($getPaymentDetails as $details) {
            $wrapperHtmlBlock = Str::swap([
                '{style}' => !$isBuydown ? 'margin-bottom: 20px;'
                    : 'margin-top: 20px; margin-bottom: 20px;',
                '{details}' => $details,
            ], '<div style="{style}">{details}</div>');

            array_push($wrapped, $wrapperHtmlBlock);
        }

        return implode("", $wrapped);
    }

    public function __invoke(array $data): Mail
    {
        $this->mail->setTemplateId(
            config('services.sendgrid.request_uplist_property'),
        );

        $arr = [];

        foreach ($data as $key => $value) {
            if($key === "get_payment_results") {
                $arr['html'] = $this->convertToHtml($value);
            }

            $arr[$key] = $value;
        }

        $loanOfficer = implode(' ', [
            Arr::get($data, 'first_name'),
            Arr::get($data, 'last_name'),
        ]);

        $merged = array_merge(
            [
                'subject' => 'Contact request about your listing',
                'loan_officer' => $loanOfficer
            ],
            $arr
        );

        $this->mail->addTo(
            Arr::get($data, 'email'),
            $loanOfficer,
            $merged
        );

        return $this->mail;
    }
}
