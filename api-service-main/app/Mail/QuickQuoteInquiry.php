<?php

namespace App\Mail;

use Illuminate\Support\Str;
use Illuminate\Support\Arr;

class QuickQuoteInquiry
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

    function populateGetPaymentResults(array $data, bool $isBuydown = false): string
    {
        if(!$data) {
            return (
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
                                    <span style="font-family:Helvetica,sans-serif;font-size:inherit;line-height:inherit;">No results.</span>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>'
            );
        }

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
                                        <span style="font-family:Helvetica,sans-serif;font-size:inherit;line-height:inherit;">{label}</span>:
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
                $htmlBlocks[] = $this->populateGetPaymentResults($buydown, true);
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

    public function textBold($value): string
    {
        return <<<HTML
        <div style="font-family: inherit; text-align: inherit">
            <span style="font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; letter-spacing: normal; orphans: 2; text-align: left; text-indent: 0px; text-transform: none; white-space-collapse: preserve; text-wrap: wrap; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-line: none; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; font-weight: bold; text-decoration-skip-ink: none; font-family: arial, helvetica, sans-serif; color: #00162e; font-size: 16px">
                $value
            </span>
        </div>
        HTML;
    }

    public function textNormal($value): string
    {
        return <<<HTML
        <div style="font-family: inherit; text-align: inherit">
            <span style="font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; orphans: 2; text-align: left; text-indent: 0px; text-transform: none; white-space-collapse: preserve; text-wrap: wrap; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-line: none; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; text-decoration-skip-ink: none; font-family: arial, helvetica, sans-serif; color: #00162e; font-size: 16px">
                $value
            </span>
        </div>
        HTML;
    }

    public function populateSearchCriteria(array $data): array
    {
        $requirements = [
            'home_price', 'loan_purpose', 'down_payment', 'down_payment_percent', 'loan_amount', 'ltv',
            'credit_score', 'occupancy_type', 'property_type', 'property_state', 'property_county', 'is_military_veteran',
            'monthly_taxes', 'homeowners_insurance', 'hoa_dues', 'seller_credits', 'buydown',
        ];

        if (Arr::has($data, $requirements)) {
            $homePrice = Arr::get($data, 'home_price');
            $loanPurpose = Arr::get($data, 'loan_purpose');
            $downPayment = Arr::get($data, 'down_payment');
            $downPaymentPercent = Arr::get($data, 'down_payment_percent');
            $loanAmount = Arr::get($data, 'loan_amount');
            $ltv = Arr::get($data, 'ltv');
            $creditScore = Arr::get($data, 'credit_score');
            $occupancyType = Arr::get($data, 'occupancy_type');
            $propertyType = Arr::get($data, 'property_type');
            $propertyState = Arr::get($data, 'property_state');
            $propertyCounty = Arr::get($data, 'property_county');
            $isMilitaryVeteran = Arr::get($data, 'is_military_veteran');
            $monthlyTaxes = Arr::get($data, 'monthly_taxes');
            $homeownersInsurance = Arr::get($data, 'homeowners_insurance');
            $hoaDues = Arr::get($data, 'hoa_dues');
            $sellerCredits = Arr::get($data, 'seller_credits');
            $buydown = Arr::get($data, 'buydown');

            return [
                'search_criteria' => implode([
                    $this->textBold('Search Criteria'),
                    $this->textNormal("Home Price: $homePrice"),
                    $this->textNormal("Loan Purpose: $loanPurpose"),
                    $this->textNormal("Down Payment: $downPayment"),
                    $this->textNormal("% Down: $downPaymentPercent"),
                    $this->textNormal("Loan Amount: $loanAmount"),
                    $this->textNormal("LTV: $ltv"),
                    $this->textNormal("Credit Score: $creditScore"),
                    $this->textNormal("Occupancy: $occupancyType"),
                    $this->textNormal("Property Type: $propertyType"),
                    $this->textNormal("State: $propertyState"),
                    $this->textNormal("County: $propertyCounty"),
                    $this->textNormal("Military/Veteran: $isMilitaryVeteran"),
                    $this->textNormal("Monthly Taxes: $monthlyTaxes"),
                    $this->textNormal("Homeowners Insurance: $homeownersInsurance"),
                    $this->textNormal("HOA Dues: $hoaDues"),
                    $this->textNormal("Seller Credit: $sellerCredits"),
                    $this->textNormal("Buydown: $buydown"),
                    '<br/>',
                ]),
            ];
        }

        return [];
    }

    public function populateAdvancedSearch(array $data): array
    {
        $requirements = [
            'units_count', 'heloc_loan_amount', 'is_first_time_home_buyer', 'is_self_employed',
        ];

        if (Arr::has($data, $requirements)) {
            $unitsCount = Arr::get($data, 'units_count');
            $helocLoanAmount = Arr::get($data, 'heloc_loan_amount');
            $isFirstTimeHomeBuyer = Arr::get($data, 'is_first_time_home_buyer');
            $isSelfEmployed = Arr::get($data, 'is_self_employed');

            return [
                'advanced_search' => implode([
                    $this->textBold('Advanced Search'),
                    $this->textNormal("No. of Units: $unitsCount"),
                    $this->textNormal("Second Mortgage Balance (if any): $helocLoanAmount"),
                    $this->textNormal("First Time Home Buyer: $isFirstTimeHomeBuyer"),
                    $this->textNormal("Self Employed: $isSelfEmployed"),
                    '<br/>',
                ]),
            ];
        }

        return [];
    }

    public function __invoke(array $data): Mail
    {
        $this->mail->setTemplateId(
            config('services.sendgrid.quick_quote_inquiry'),
        );

        $substitutions = [];

        foreach ($data as $key => $value) {
            $substitutions[$key] = $value;

            if($key === "get_payment_results") {
                $substitutions['get_payment_results'] = implode([
                    $this->textBold('Search Results'),
                    $this->populateGetPaymentResults($value),
                ]);
            }
        }

        $loanOfficer = implode(' ', [
            Arr::get($data, 'first_name'),
            Arr::get($data, 'last_name'),
        ]);

        $substitutions = [
            'subject' => 'Quick Quote Inquiry',
            'loan_officer' => $loanOfficer,
            ...$this->populateSearchCriteria($data),
            ...$this->populateAdvancedSearch($data),
            ...$substitutions,
        ];

        $this->mail->addTo(
            Arr::get($data, 'email'),
            $loanOfficer,
            $substitutions,
        );

        return $this->mail;
    }
}
