<?php

namespace App\Services;

use App\DTO\EssentQuote;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class EssentService extends Service
{
    protected array $payload = [];

    public function getQuote(array $data): array
    {
        try {
            // (START) Debug Essent Rate Finder
            \Illuminate\Support\Facades\Storage::disk('public')
                ->put('api-ratefinder-test.essent.us/Get231QuotePayload.json', json_encode([
                    'endpoint' => 'https://api-ratefinder-test.essent.us/api/v1.0/QuoteService/Get231Quote',
                    'payload' => $data,
                ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
            // (END) Debug Essent Rate Finder

            return Http::essent()
                ->post('/Get231Quote', $data)
                ->json();
        } catch (\Exception $exception) {
            $this->abort($exception);
        }
    }

    public function defaultPayload(): array
    {
        $now = Carbon::now()
            ->format('Y/m/d H:i:s');

        return [
            'REQUESTING_PARTY' => [
                [
                    'CONTACT_DETAIL' => [
                        [
                            'CONTACT_POINT' => [
                                [
                                    '_Type' => 'Phone',
                                    '_Value' => '4257489990'
                                ],
                                [
                                    '_Type' => 'Email',
                                    '_Value' => 'info@upwellmortgage.com'
                                ]
                            ],
                            '_Name' => 'Processor'
                        ]
                    ],
                    '_Name' => 'Upwell',
                    '_StreetAddress' => '800 Bellevue Way NE, Suite 500',
                    '_City' => 'Bellevue',
                    '_State' => 'WA',
                    '_PostalCode' => '98029'
                ]
            ],
            'REQUEST' => [
                [
                    'KEY' => [
                        [
                            '_Name' => 'RequestID',
                            '_Value' => '2850837241'
                        ],
                        [
                            '_Name' => 'TotalDebtExpenseRatioPercent',
                            '_Value' => '41'
                        ],
                        [
                            '_Name' => 'CombinedLTVRatioPercent',
                            '_Value' => '88.85'
                        ]
                    ],
                    'REQUEST_DATA' => [
                        [
                            'MI_APPLICATION' => [
                                'MI_REQUEST' => [
                                    'MIApplicationType' => 'RateQuote',
                                    'MICertificateType' => 'Primary',
                                    'MICoveragePlanType' => 'StandardPrimary',
                                    'MIDurationType' => 'PeriodicMonthly',
                                    'MIInitialPremiumAtClosingType' => 'Deferred',
                                    'MILenderIdentifier' => '4701570001',
                                    'MIPremiumFinancedIndicator' => 'N',
                                    'MIPremiumPaymentType' => 'BorrowerPaid',
                                    'MIPremiumRatePlanType' => 'Level',
                                    'MIPremiumRefundableType' => 'NotRefundable',
                                    'MIRelocationLoanIndicator' => 'N',
                                    'MIRenewalCalculationType' => 'Constant',
                                    'MITransactionIdentifier' => '28541-54321',
                                    'DesktopUnderwriterRecommendationType' => 'ApproveEligible',
                                    'LoanProspectorDocClassificationType' => 'Accept',
                                    'LoanProspectorDocumentationClassificationTypeSpecified' => false,
                                    'AutomatedUnderwritingSystemName' => 'Desktop Underwriter'
                                ],
                                'REQUESTING_PARTY' => [
                                    'CONTACT_DETAIL' => [
                                        [
                                           'CONTACT_POINT' => [
                                                [
                                                    '_Type' => 'Phone',
                                                    '_Value' => '4257489990'
                                                ],
                                                [
                                                    '_Type' => 'Email',
                                                    '_Value' => 'info@upwellmortgage.com'
                                                ]
                                            ],
                                            '_Name' => 'Processor'
                                        ]
                                    ],
                                    '_Name' => 'Upwell',
                                    '_StreetAddress' => '800 Bellevue Way NE, Suite 500',
                                    '_City' => 'Bellevue',
                                    '_State' => 'WA',
                                    '_PostalCode' => '98029'
                                ],
                                'CREDIT_SCORE' => [
                                    [
                                        'MISMOVersionID' => '2.3',
                                        'CreditScoreID' => 'Score11',
                                        'BorrowerID' => 'SSN333224444',
                                        '_ModelNameType' => 'EquifaxBeacon5.0',
                                        '_Value' => '780'
                                    ]
                                ],
                                'LOAN_APPLICATION' => [
                                    'ADDITIONAL_CASE_DATA' => [
                                        'TRANSMITTAL_DATA' => [
                                            'PropertyAppraisedValueAmount' => '0'
                                        ]
                                    ],
                                    'LOAN_PRODUCT_DATA' => [
                                        'LOAN_FEATURES' => [
                                            'BalloonIndicator' => 'N',
                                            'CounselingConfirmationIndicator' => 'N',
                                            'GSEPropertyType' => 'Detached',
                                            'LienPriorityType' => 'FirstLien',
                                            'LoanDocumentationType' => 'FullDocumentation',
                                            'LoanRepaymentType' => 'ScheduledAmortization',
                                            'MICoveragePercent' => '25'
                                        ]
                                    ],
                                    'LOAN_PURPOSE' => [
                                        '_Type' => 'Purchase',
                                        'PropertyUsageType' => 'PrimaryResidence'
                                    ],
                                    'MORTGAGE_TERMS' => [
                                        'BaseLoanAmount' => '0',
                                        'BorrowerRequestedLoanAmount' => '0',
                                        'LenderCaseIdentifier' => 'SampleQuote1',
                                        'LoanAmortizationTermMonths' => '360',
                                        'LoanAmortizationType' => 'Fixed',
                                        'MortgageType' => 'Conventional',
                                        'RequestedInterestRatePercent' => '4.0'
                                    ],
                                    'PROPERTY' => [
                                        '_StreetAddress' => null,
                                        '_City' => null,
                                        '_State' => null,
                                        '_County' => null,
                                        '_PostalCode' => null,
                                        '_FinancedNumberOfUnits' => '1'
                                    ],
                                    'PROPOSED_HOUSING_EXPENSE' => [
                                        [
                                            'HousingExpenseType' => 'FirstMortgagePrincipalAndInterest',
                                            '_PaymentAmount' => '0.00'
                                        ],
                                        [
                                            'HousingExpenseType' => 'HazardInsurance',
                                            '_PaymentAmount' => '0.00'
                                        ],
                                        [
                                            'HousingExpenseType' => 'HomeownersAssociationDuesAndCondominiumFees',
                                            '_PaymentAmount' => '0'
                                        ],
                                        [
                                            'HousingExpenseType' => 'MI',
                                            '_PaymentAmount' => '0.00'
                                        ],
                                        [
                                            'HousingExpenseType' => 'OtherHousingExpense',
                                            '_PaymentAmount' => '0'
                                        ],
                                        [
                                            'HousingExpenseType' => 'RealEstateTax',
                                            '_PaymentAmount' => '0.00'
                                        ]
                                    ],
                                    'TRANSACTION_DETAIL' => [
                                        'PurchasePriceAmount' => '0',
                                        'SubordinateLienAmount' => '0'
                                    ],
                                    'BORROWER' => [
                                        [
                                            'DECLARATION' => [
                                                'BankruptcyIndicator' => 'N',
                                                'HomeownerPastThreeYearsType' => 'Yes',
                                                'IntentToOccupyType' => 'Yes',
                                                'LoanForeclosureOrJudgementIndicator' => 'N',
                                                'OutstandingJudgementsIndicator' => 'N',
                                                'PropertyForeclosedPastSevenYearsIndicator' => 'N'
                                            ],
                                            'EMPLOYER' => [
                                                [
                                                    'EmploymentBorrowerSelfEmployedIndicator' => 'N',
                                                    'EmploymentCurrentIndicator' => 'Y'
                                                ]
                                            ],
                                            'PRESENT_HOUSING_EXPENSE' => [
                                                [
                                                    'HousingExpenseType' => 'FirstMortgagePrincipalAndInterest',
                                                    '_PaymentAmount' => '0'
                                                ],
                                                [
                                                    'HousingExpenseType' => 'HazardInsurance',
                                                    '_PaymentAmount' => '0'
                                                ],
                                                [
                                                    'HousingExpenseType' => 'HomeownersAssociationDuesAndCondominiumFees',
                                                    '_PaymentAmount' => '0'
                                                ],
                                                [
                                                    'HousingExpenseType' => 'MI',
                                                    '_PaymentAmount' => '0'
                                                ],
                                                [
                                                    'HousingExpenseType' => 'OtherHousingExpense',
                                                    '_PaymentAmount' => '550'
                                                ],
                                                [
                                                    'HousingExpenseType' => 'RealEstateTax',
                                                    '_PaymentAmount' => '0'
                                                ],
                                                [
                                                    'HousingExpenseType' => 'Rent',
                                                    '_PaymentAmount' => '550'
                                                ]
                                            ],
                                            'BorrowerID' => 'SSN333224444',
                                            '_FirstName' => 'Quote',
                                            '_LastName' => 'Receiver',
                                            '_PrintPositionType' => 'Borrower',
                                            '_SSN' => '333224444'
                                        ]
                                    ],
                                    'MISMOVersionID' => '2.3.1'
                                ],
                                'MISMOVersionID' => '2.3.1'
                            ]
                        ]
                    ],
                    'RequestDatetime' => $now,
                ]
            ],
            'MISMOVersionID' => '2.3.1'
        ];
    }

    public function setPayload(array $data): self
    {
        $this->payload = $this->populatePayload(
            $this->defaultPayload(),
            $data,
        );

        return $this;
    }

    public function getResponse(): array
    {
        if (empty($this->payload)) {
            return [];
        }

        try {
            $result = $this->getQuote($this->payload);

            return EssentQuote::fromResult($result)
                ->toArray();
        } catch (\Exception $exception) {
            Log::error($exception->getMessage());
            return [];
        }
    }
}
