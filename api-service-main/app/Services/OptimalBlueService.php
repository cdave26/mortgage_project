<?php

namespace App\Services;

use App\DTO\OptimalBlueProduct;
use App\Enums\Buydown;
use App\Enums\DownPaymentType;
use App\Enums\Environment;
use App\Enums\LoanType;
use App\Enums\OccupancyType;
use App\Facades\EssentService;
use App\Models\OptimalBlueDefaultStrategy;
use App\Models\OptimalBlueUserStrategy;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class OptimalBlueService extends Service
{
    protected string $token;

    protected OptimalBlueDefaultStrategy | OptimalBlueUserStrategy $strategy;

    protected array $payload = [];

    public function __construct()
    {
        if (App::environment([Environment::PRODUCTION, Environment::STAGING, Environment::DEVELOPMENT])) {
            $this->token = Http::asForm()
                ->post('https://login.microsoftonline.com/marketplaceauth.optimalblue.com/oauth2/token', [
                    'client_id' => config('services.optimal_blue.key'),
                    'client_secret' => config('services.optimal_blue.secret'),
                    'grant_type' => config('services.optimal_blue.grant_type'),
                    'resource' => config('services.optimal_blue.resource'),
                ])
                ->json('access_token');
            return;
        }

        $this->token = Http::post('https://digitalmarketplace.optimalblue.com/signin-oauth/credentials/fullsearch-v3')
            ->json('accessToken');
    }

    public function availableStrategies(): array
    {
        try {
            return Http::optimalBlue($this->token)
                ->get('/support/api/strategies')
                ->json();
        } catch (\Exception $exception) {
            $this->abort($exception);
        }
    }

    public function getAccounts()
    {
        try {
            return Http::optimalBlue($this->token)
                ->get('/support/api/strategies/accounts')
                ->json();
        } catch (\Exception $exception) {
            $this->abort($exception);
        }
    }

    /**
     * Find specific company OB account
     * @param String $companyName
     * 
     * @return Array
     */
    public function getAccountPerCompany(string $companyName): array
    {
        $OBaccounts = $this->getAccounts();
        $account = [];

        $toUpwellMap = [
            'Fairway Independent Mortgage Corporation',
            'Your Company',
            'GO Mortgage',
            'Lennar Mortgage',
        ];

        $checker = $companyName;

        if(in_array($companyName, $toUpwellMap)) {
            $checker = 'Upwell Mortgage, Inc.';
        }

        if($companyName == 'Revolution Mortgage') {
            $checker = 'T2 Financial LLC';
        }

        if($companyName == 'First Financial Mortgage') {
            $checker = 'First Financial Bank, N.A. (TX)';
        }

        if($companyName == 'Homeseed Loans, a division of Mann Mortgage, LLC') {
            $checker = 'Mann Mortgage, LLC';
        }

        if($companyName == 'Momentum Home Loans') {
            $checker = 'My Move Mortgage, LLC dba Momentum Home Loans';
        }

        foreach ( $OBaccounts as $acc ) {
            if ( $checker === $acc['name'] ) {
                $account = $acc;
                break;
            }
        }

        return $account;
    }

    public function getCompanyStrategies(int $companyAccountId): array
    {
        try {
            $url = Str::swap([
                '{companyAccountId}' => $companyAccountId,
            ], '/support/api/strategies/accounts/{companyAccountId}');
            
            return Http::optimalBlue($this->token)
                ->get($url)
                ->json();
        } catch (\Exception $exception) {
            $this->abort($exception);
        }
    }

    public function fullProductSearch(int $channel, int $originator, array $data): array
    {
        try {
            $url = Str::swap([
                '{businessChannelId}' => $channel,
                '{originatorId}' => $originator,
            ], '/full/api/businesschannels/{businessChannelId}/originators/{originatorId}/productsearch');

            // (START) Debug Optimal Blue
            $loanType = Arr::get($data, 'loanInformation.loanType');

            \Illuminate\Support\Facades\Storage::disk('public')
                ->put("marketplace.optimalblue.com/productsearch/{$loanType->value}Payload.json", json_encode([
                    'endpoint' => $url,
                    'payload' => $data,
                ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
            // (END) Debug Optimal Blue

            return Http::optimalBlue($this->token)
                ->post($url, $data)
                ->json();
        } catch (\Exception $exception) {
            $this->abort($exception);
        }
    }

    public function loan(?int $channel, ?int $originator, string $loanId): array
    {
        try {
            $url = Str::swap([
                '{businessChannelId}' => $channel,
                '{originatorId}' => $originator,
                '{loanId}' => $loanId,
            ], '/pipeline/api/businesschannels/{businessChannelId}/originators/{originatorId}/loans/{loanId}');

            return Http::optimalBlue($this->token)
                ->get($url)
                ->json();
        } catch (\Exception $exception) {
            $this->abort($exception);
        }
    }

    public function defaultFullProductSearchPayload(): array
    {
        return [
            'borrowerInformation' => [
                'assetDocumentation' => 'Verified',
                'debtToIncomeRatio' => 40.0,
                'pledgedAssets' => false,
                'citizenship' => 'USCitizen',
                'employmentDocumentation' => 'Verified',
                'fico' => 780,
                'firstName' => "string",
                'lastName' => "string",
                'vaFirstTimeUse' => true,
                'middleName' => null,
                'suffix' => null,
                'homePhone' => null,
                'workPhone' => null,
                'email' => null,
                'dateOfBirth' => null,
                'SSN' => null,
                'firstTimeHomeBuyer' => true,
                'incomeDocumentation' => 'Verified',
                'typeOfVeteran' => null,
                'monthlyIncome' => 0.0,
                'monthsReserves' => 24,
                'selfEmployed' => true,
                'waiveEscrows' => false,
                'mortgageLatesX30' => 0,
                'mortgageLatesX60' => 0,
                'mortgageLatesX90' => 0,
                'mortgageLatesX120' => 0,
                'MortgageLatesRolling' => 0,
                'bankruptcy' => 'Never',
                'bankruptcyChapter' => null,
                'bankruptcyDisposition' => null,
                'foreclosure' => 'Never',
                'disclosureDate' => null,
                'applicationDate' => null,
                'bankStatementsForIncome' => null,
                'address1' => null,
                'address2' => null,
                'city' => null,
                'state' => null,
                'country' => null,
                'zipCode' => null,
            ],
            'loanInformation' => [
                'loanPurpose' => 'Purchase',
                'lienType' => 'First',
                'amortizationTypes' => [
                    'Fixed',
                ],
                'automatedUnderwritingSystem' => 'NotSpecified',
                'borrowerPaidMI' => 'Yes',
                'buydown' => 'None',
                'cashOutAmount' => 0.0,
                'desiredLockPeriod' => 30,
                'desiredPrice' => 95.0,
                'desiredRate' => 0.0,
                'feesIn' => null,
                'expandedApprovalLevel' => 'NotApplicable',
                'FHACaseAssigned' => null,
                'FHACaseEndorsement' => null,
                'interestOnly' => false,
                'baseLoanAmount' => 0.0,
                'totalLoanAmountDetails' => null,
                'secondLienAmount' => 0.0,
                'helocDrawnAmount' => 0.0,
                'helocLineAmount' => 0.0,
                'loanTerms' => [
                    'ThirtyYear',
                ],
                'productTypes' => [
                    'StandardProducts',
                ],
                'loanType' => 'Conventional',
                'constructionLoanType' => 'NotApplicable',
                'prepaymentPenalty' => 'None',
                'exemptFromVAFundingFee' => false,
                'includeLOCompensationInPricing' => 'YesLenderPaid',
                'customFields' => null,
                'currentServicer' => 'Not Applicable',
                'externalStatus' => null,
                'leadSource' => null,
                'interestOnlyTerm' => null,
                'calculateTotalLoanAmount' => true,
            ],
            'propertyInformation' => [
                'appraisedValue' => 0.0,
                'occupancy' => 'PrimaryResidence',
                'propertyStreetAddress' => 'string',
                'city' => null,
                'county' => null,
                'state' => null,
                'zipCode' => null,
                'propertyType' => 'SingleFamily',
                'corporateRelocation' => false,
                'salesPrice' => 0.0,
                'numberOfStories' => 1,
                'numberOfUnits' => 'OneUnit',
                'construction' => false,
                'uniqueDwelling' => null,
            ],
            'representativeFICO' => 780,
            'loanLevelDebtToIncomeRatio' => 40.0,
            'coBorrowerInformation' => null,
            'customerInternalId' => 'OB#99',
            'additionalFields' => null,
        ];
    }

    public function setStrategy(OptimalBlueDefaultStrategy | OptimalBlueUserStrategy $strategy): self
    {
        $this->strategy = $strategy;

        return $this;
    }

    public function setFullProductSearchPayload(array $data): self
    {
        $this->payload = $this->populatePayload(
            $this->defaultFullProductSearchPayload(),
            $data,
        );

        return $this;
    }

    public function calculateClosestValue(array $data): float
    {
        if (!isset($this->strategy)) {
            return 0;
        }

        $closestValue = $this->strategy->price;

        $defaultPrice = (float) config('services.optimal_blue.default_price');

        if (!$closestValue) {
            return $defaultPrice;
        }

        $sellingPrice = Arr::get($data, 'price', 0);

        $loanAmount = Arr::get($data, 'loan_amount', 0);

        $sellerCredit = Arr::get($data, 'seller_credit', 0);

        $occupancyType = Arr::get($data, 'occupancy_type_id');

        $credit = 0;

        switch (OccupancyType::from($occupancyType)) {
            case OccupancyType::INVESTMENT:
                $maxCredit = $sellingPrice * 0.02;
                $credit = $sellerCredit >= $maxCredit ? $maxCredit : $sellerCredit;
                break;
            default:
                $loanToValue = ($loanAmount / $sellingPrice) * 100;

                if ($loanToValue > 90) {
                    $credit = $sellingPrice * 0.03;
                } else if ($loanToValue > 75 && $loanToValue <= 90) {
                    $credit = $sellingPrice * 0.06;
                } else {
                    $credit = $sellingPrice * 0.09;
                }
                break;
        }

        $sellerCredit = $sellerCredit < $credit
            ? $sellerCredit : $credit;

        $discount = $loanAmount * ((100 - $closestValue) / 100);

        if ($sellerCredit > $discount) {
            $closestValue = round(100 - (($sellerCredit / $loanAmount) * 100), 3);
        }

        return $closestValue > $defaultPrice ? $closestValue : $defaultPrice;
    }

    public function getProductByConventional(array $data): array
    {
        if (!isset($this->strategy)) {
            return [];
        }

        $payload = $this->payload;

        Arr::set($payload, 'loanInformation.loanType', LoanType::CONVENTIONAL);

        $result = $this->fullProductSearch(
            $this->strategy->business_channel_id,
            $this->strategy->originator_id,
            $payload,
        );

        $desiredPrice = Arr::get($payload, 'loanInformation.desiredPrice');

        $sellerCredit = Arr::get($data, 'seller_credit', 0);

        $products = Arr::get($result, 'products');

        if (empty($products)) {
            return [];
        }

        return OptimalBlueProduct::fromFullProductSearch([
            ...$result,
            'desiredPrice' => $desiredPrice,
            'sellerCredit' => $sellerCredit,
        ])->toArray();
    }

    public function getProductByFHA(array $data): array
    {
        if (!isset($this->strategy)) {
            return [];
        }

        $payload = $this->payload;

        Arr::set($payload, 'loanInformation.loanType', LoanType::FHA);

        $result = $this->fullProductSearch(
            $this->strategy->business_channel_id,
            $this->strategy->originator_id,
            $payload,
        );

        $desiredPrice = Arr::get($payload, 'loanInformation.desiredPrice');

        $sellerCredit = Arr::get($data, 'seller_credit', 0);

        $products = Arr::get($result, 'products');

        if (empty($products)) {
            return [];
        }

        return OptimalBlueProduct::fromFullProductSearch([
            ...$result,
            'desiredPrice' => $desiredPrice,
            'sellerCredit' => $sellerCredit,
        ])->toArray();
    }

    public function getProductByVA(array $data): array
    {
        if (!isset($this->strategy)) {
            return [];
        }

        $payload = $this->payload;

        Arr::set($payload, 'loanInformation.loanType', LoanType::VA);

        Arr::set($payload, 'borrowerInformation.typeOfVeteran', 'ActiveDuty');

        $result = $this->fullProductSearch(
            $this->strategy->business_channel_id,
            $this->strategy->originator_id,
            $payload,
        );

        $desiredPrice = Arr::get($payload, 'loanInformation.desiredPrice');

        $sellerCredit = Arr::get($data, 'seller_credit', 0);

        $products = Arr::get($result, 'products');

        if (empty($products)) {
            return [];
        }

        return OptimalBlueProduct::fromFullProductSearch([
            ...$result,
            'desiredPrice' => $desiredPrice,
            'sellerCredit' => $sellerCredit,
        ])->toArray();
    }

    public function calculateBuydown(array $product, array $data = []): array
    {
        $buydown = Arr::get($data, 'buydown');

        $buydown = Buydown::tryFrom($buydown);

        $years = match ($buydown) {
            Buydown::THREE_TWO_ONE => 3,
            Buydown::TWO_ONE => 2,
            Buydown::ONE_ZERO => 1,
            default => 0,
        };

        $buydown = [];

        if (!$years) return $buydown;

        $interestRate = Arr::get($product, 'interest_rate', 0);

        $loanAmount = Arr::get($data, 'loan_amount', 0);

        $amortizationTerm = Arr::get($product, 'amortization_term', 0);

        $loanTermInMonths = $amortizationTerm * 12;

        foreach (range(1, $years) as $year) {
            $yearlyRate = $interestRate - $years--;

            $monthlyRate = $yearlyRate / 100 / 12;

            $monthlyPayment = $monthlyRate / (1 - 1 / pow(1 + $monthlyRate, $loanTermInMonths)) * $loanAmount;

            $monthlyPrincipalInterest = Arr::get($product, 'monthly_principal_interest', 0);

            $monthlySavings = $monthlyPrincipalInterest - $monthlyPayment;

            $payment = $this->calculatePayment([...$product,
                'monthly_principal_interest' => $monthlyPayment,
            ], $data);

            $totalPayment = Arr::get($payment, 'total_payment', 0);

            $tax = Arr::get($payment, 'tax', 0);

            $insurance = Arr::get($payment, 'insurance', 0);

            $mortgageInsurance = Arr::get($payment, 'mortgage_insurance', 0);

            $payments = 12;

            Arr::set($buydown, $year, [
                'interest_rate' => $yearlyRate,
                'total_payment' => round($totalPayment, 2),
                'monthly_principal_interest' => round($monthlyPayment, 2),
                'tax' => round($tax, 2),
                'insurance' => round($insurance, 2),
                'mortgage_insurance' => round($mortgageInsurance, 2),
                'payments' => $payments,
                'monthly_savings' => $monthlySavings,
                'annual_monthly_savings' => $monthlySavings * $payments,
            ]);
        }

        $annualMonthlySavings = Arr::pluck($buydown, 'annual_monthly_savings');

        $buydownCost = array_sum($annualMonthlySavings);

        return [
            'buydown' => $buydown,
            'buydown_cost' => round($buydownCost, 2),
        ];
    }

    public function calculatePayment(array $product, array $data = []): array
    {
        if (blank($product)) {
            return [];
        }

        $mortgageInsurance = Arr::get($product, 'mortgage_insurance', 0);

        $monthlyPrincipalInterest = Arr::get($product, 'monthly_principal_interest', 0);

        $tax = (float) Arr::get($data, 'tax', 0);

        $insurance = (float) Arr::get($data, 'insurance', 0);

        $homeownersAssociationFee = (float) Arr::get($data, 'homeowners_association_fee', 0);

        $totalPayment = array_sum([
            $mortgageInsurance,
            $monthlyPrincipalInterest,
            $tax,
            $insurance,
        ]);

        return array_merge($product, [
            'tax' => $tax,
            'insurance' => $insurance,
            'total_payment' => $totalPayment,
            'homeowners_association_fee' => $homeownersAssociationFee,
        ]);
    }

    public function getQuote(array $data): array
    {
        $state = Arr::get($data, 'property_state');
        $county = Arr::get($data, 'property_county');
        $occupancyType = Arr::get($data, 'occupancy_type_id');
        $creditScore = Arr::get($data, 'credit_score');
        $price = Arr::get($data, 'price', 0);
        $loanAmount = Arr::get($data, 'loan_amount', 0);
        $loanPurpose = Arr::get($data, 'loan_purpose', 'Purchase');

        $downPayment = Arr::get($data, 'down_payment', 0);

        $downPaymentType = Arr::get($data, 'down_payment_type');
        $downPaymentType = DownPaymentType::from($downPaymentType);

        $downPayment = match ($downPaymentType) {
            DownPaymentType::DOLLAR => ($downPayment / $price) * 100,
            DownPaymentType::PERCENTAGE => $downPayment,
        };

        if ($downPayment >= 20) {
            return [];
        }

        $combinedLTVRatioPercent = 100 - $downPayment;

        $miCoveragePercent = match (true) {
            $combinedLTVRatioPercent > 80 && $combinedLTVRatioPercent <= 85 => 12,
            $combinedLTVRatioPercent > 85 && $combinedLTVRatioPercent <= 90 => 25,
            $combinedLTVRatioPercent > 90 && $combinedLTVRatioPercent <= 95 => 30,
            $combinedLTVRatioPercent > 95 && $combinedLTVRatioPercent <= 97 => 35,
            default => 0,
        };

        return EssentService::setPayload([
            'REQUEST.0.KEY.2._Value' => $combinedLTVRatioPercent,
            'REQUEST.0.REQUEST_DATA.0.MI_APPLICATION.LOAN_APPLICATION.ADDITIONAL_CASE_DATA.TRANSMITTAL_DATA.PropertyAppraisedValueAmount' => $price,
            'REQUEST.0.REQUEST_DATA.0.MI_APPLICATION.LOAN_APPLICATION.TRANSACTION_DETAIL.PurchasePriceAmount' => $price,
            'REQUEST.0.REQUEST_DATA.0.MI_APPLICATION.LOAN_APPLICATION.MORTGAGE_TERMS.BaseLoanAmount' => $loanAmount,
            'REQUEST.0.REQUEST_DATA.0.MI_APPLICATION.LOAN_APPLICATION.MORTGAGE_TERMS.BorrowerRequestedLoanAmount' => $loanAmount,
            'REQUEST.0.REQUEST_DATA.0.MI_APPLICATION.LOAN_APPLICATION.PROPERTY._State' => $state,
            'REQUEST.0.REQUEST_DATA.0.MI_APPLICATION.LOAN_APPLICATION.PROPERTY._County' => $county,
            'REQUEST.0.REQUEST_DATA.0.MI_APPLICATION.LOAN_APPLICATION.LOAN_PURPOSE.PropertyUsageType' => $occupancyType,
            'REQUEST.0.REQUEST_DATA.0.MI_APPLICATION.CREDIT_SCORE.0._Value' => $creditScore,
            'REQUEST.0.REQUEST_DATA.0.MI_APPLICATION.LOAN_APPLICATION.LOAN_PURPOSE._Type' => $loanPurpose,
            'REQUEST.0.REQUEST_DATA.0.MI_APPLICATION.LOAN_APPLICATION.LOAN_PRODUCT_DATA.LOAN_FEATURES.MICoveragePercent' => $miCoveragePercent,
        ])->getResponse();
    }

    public function getPayments(array $data, array $loanTypes): array
    {
        $loanAmount = Arr::get($data, 'loan_amount', 0);

        if (empty($this->payload) || empty($loanAmount)) {
            return [];
        }

        // (START) Debug Essent Rate Finder
        \Illuminate\Support\Facades\Storage::disk('public')
            ->deleteDirectory('api-ratefinder-test.essent.us');
        // (END) Debug Essent Rate Finder

        $quote = $this->getQuote($data);

        $closestValue = $this->calculateClosestValue($data);

        Arr::set($this->payload, 'loanInformation.desiredPrice', $closestValue);

        $payments = [];

        // (START) Debug Optimal Blue
        \Illuminate\Support\Facades\Storage::disk('public')
            ->deleteDirectory('marketplace.optimalblue.com/productsearch');
        // (END) Debug Optimal Blue

        foreach ($loanTypes as $type) {
            $productSearch = match ($type) {
                LoanType::CONVENTIONAL => $this->getProductByConventional($data),
                LoanType::FHA => $this->getProductByFHA($data),
                LoanType::VA => $this->getProductByVA($data),
                default => [],
            };

            $products = Arr::get($productSearch, 'products', []);

            $totalLoanAmount = Arr::get($productSearch, 'totalLoanAmountDetails.totalLoanAmount', 0);

            foreach ($products as $key => $product) {
                $mortgageInsurance = Arr::get($product, 'mortgage_insurance', 0);

                $type = LoanType::from($key);

                $product = match ($type) {
                    LoanType::CONFORMING => empty($quote) ? $product : [
                        ...$product, ...$quote,
                    ],
                    LoanType::NON_CONFORMING => $mortgageInsurance > 0 ? [
                        ...$product, ...$quote,
                    ] : $product,
                    default => $product,
                };

                $payment = $this->calculatePayment($product, $data);

                $buydown = match ($type) {
                    LoanType::FHA, LoanType::VA => $this->calculateBuydown($product, [
                        ...$data, 'loan_amount' => $totalLoanAmount,
                    ]),
                    default => $this->calculateBuydown($product, $data),
                };

                Arr::set($payments, $key, [...$payment, ...$buydown]);
            }
        }

        return $payments;
    }
}
