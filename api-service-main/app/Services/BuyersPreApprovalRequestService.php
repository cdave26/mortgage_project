<?php

namespace App\Services;

use App\Enums\DownPaymentType;
use App\Enums\LoanType;
use App\Facades\OptimalBlueService;
use App\Models\Buyer;
use App\Models\County;
use App\Models\OptimalBlueDefaultStrategy;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class BuyersPreApprovalRequestService extends Service
{
    public function create(array $data): void
    {
        try {
            DB::beginTransaction();

            $buyer = Buyer::firstWhere('borrower_id', Auth::id());

            $buyer->preApprovalRequest()
                ->delete();

            $buyer->preApprovalRequest()
                ->create($data);

            $payments = Arr::get($data, 'payments');

            $payments = Arr::map($payments, function (array $payment, string $key) {
                return [
                    ...$payment, 'loan_type' => $key,
                ];
            });

            $buyer->amortizations()
                ->delete();

            $buyer->amortizations()
                ->createMany($payments);

            DB::commit();
        } catch (\Exception $exception) {
            DB::rollBack();
            $this->abort($exception);
        }
    }

    public function getPayments(array $data): array
    {
        $price = Arr::get($data, 'price');
        $downPayment = Arr::get($data, 'down_payment');
        $loanAmount = Arr::get($data, 'loan_amount');
        $propertyType = Arr::get($data, 'property_type_id');
        $occupancyType = Arr::get($data, 'occupancy_type_id');
        $creditScoreRange = Arr::get($data, 'credit_score_range_id');
        $debtToIncomeRatio = Arr::get($data, 'debt_to_income_ratio');
        $veteransAffairs = Arr::get($data, 'veterans_affairs');
        $veteransAffairsApproved = Arr::get($data, 'veterans_affairs_approved');
        $firstTimeHomeBuyersApproved = Arr::get($data, 'first_time_home_buyers_approved');

        $downPaymentType = Arr::get($data, 'down_payment_type');
        $downPaymentType = DownPaymentType::from($downPaymentType);

        $downPayment = match ($downPaymentType) {
            DownPaymentType::PERCENTAGE => ($downPayment / 100) * $price,
            default => $downPayment,
        };

        $firstTimeHomeBuyers = Arr::get($data, 'first_time_home_buyers');
        $firstTimeHomeBuyers = filter_var($firstTimeHomeBuyers, FILTER_VALIDATE_BOOLEAN);

        $user = Auth::user();

        $strategy = $user->buyer
            ->loanOfficer
            ->optimalBlueStrategy;

        if (is_null($strategy)) {
            $strategy = OptimalBlueDefaultStrategy::where(
                'company_id', $user->company_id,
            )->first();
        }

        $creditScore = Str::of($creditScoreRange)
            ->explode(',')
            ->first();

        $loanTypes = [
            LoanType::CONVENTIONAL,
            LoanType::FHA,
        ];

        if ($veteransAffairs) {
            $loanTypes = [
                LoanType::CONVENTIONAL,
                LoanType::VA,
            ];
        }

        $propertyState = $user->buyer->propertyState->abbreviation;

        $county = Arr::get($data, 'county_id');
        $county = County::find($county);

        $payments = OptimalBlueService::setStrategy($strategy)
            ->setFullProductSearchPayload([
                'borrowerInformation.fico' => $creditScore,
                'borrowerInformation.firstName' => $user->first_name,
                'borrowerInformation.lastName' => $user->last_name,
                'borrowerInformation.firstTimeHomeBuyer' => $firstTimeHomeBuyers,
                'borrowerInformation.selfEmployed' => $user->buyer->self_employed,
                'borrowerInformation.state' => $user->buyer->borrowerState->name,
                'borrowerInformation.debtToIncomeRatio' => $debtToIncomeRatio,
                'propertyInformation.appraisedValue' => $price,
                'propertyInformation.occupancy' => $occupancyType,
                'propertyInformation.county' => $county->name,
                'propertyInformation.state' => $propertyState,
                'propertyInformation.propertyType' => $propertyType,
                'propertyInformation.salesPrice' => $price,
                'propertyInformation.numberOfUnits' => $user->buyer->unit_id,
                'loanInformation.baseLoanAmount' => $loanAmount,
                'representativeFICO' => $creditScore,
                'loanLevelDebtToIncomeRatio' => $debtToIncomeRatio,
            ])
            ->getPayments([
                ...$data,
                'property_state' => $propertyState,
                'property_county' => $county->name,
                'credit_score' => $creditScore,
            ], $loanTypes);

        $data = [
            'payments' => Arr::except($payments, [
                ...(!$firstTimeHomeBuyersApproved ? [
                        LoanType::FHA->value,
                ] : []),
                ...(!$veteransAffairsApproved ? [
                    LoanType::VA->value,
                ] : []),
            ]),
        ];

        if (empty($payments)) {
            return [
                'message' => trans('messages.get_payments.no_results'),
                ...$data,
            ];
        }

        if ($downPayment > $user->buyer->max_down_payment) {
            $maxDownPayment = match ($downPaymentType) {
                DownPaymentType::PERCENTAGE => percentage($user->buyer->max_down_payment, $price),
                default => currency_format($user->buyer->max_down_payment, 0),
            };

            return [
                'message' => trans('messages.get_payments.higher_down_payment', [
                    'max_down_payment' => $maxDownPayment,
                ]), ...$data,
            ];
        }

        foreach ($payments as $payment) {
            $totalPayment = Arr::get($payment, 'total_payment');
            $homeownersAssociationFee = Arr::get($payment, 'homeowners_association_fee');

            if (array_sum([$totalPayment, $homeownersAssociationFee]) > $user->buyer->max_qualifying_payment) {
                return [
                    'message' => trans('messages.get_payments.higher_total_payment_and_hoa_dues', [
                        'max_qualifying_payment' => currency_format($user->buyer->max_qualifying_payment, 0),
                    ]), ...$data,
                ];
            }
        }

        return $data;
    }
}
