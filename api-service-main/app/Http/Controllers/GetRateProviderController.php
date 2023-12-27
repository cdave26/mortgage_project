<?php

namespace App\Http\Controllers;

use App\Enums\LoanType;
use App\Enums\UserStatus;
use App\Facades\OptimalBlueService;
use App\Http\Requests\GetRateProviderRequest;
use App\Models\County;
use App\Models\OptimalBlueDefaultStrategy;
use App\Models\State;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Log;

class GetRateProviderController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(GetRateProviderRequest $request): JsonResponse
    {
        $data = $request->validated();
        try {
            $user = null;
            
            if ($request->has('url_identifier')) {
                $urlIdentifier = $request['url_identifier'];

                $user = User::firstWhere(function (Builder $query) use ($urlIdentifier) {
                    $query->where('url_identifier', $urlIdentifier)
                        ->whereIn('user_status', [
                            UserStatus::ACTIVE,
                            UserStatus::ACTIVE_TRIAL,
                        ])
                        ->whereNull('deleted_at');
                });

                if(!$user) {
                    return $this->error([
                        'message' => trans('messages.error.forbidden'),
                    ], JsonResponse::HTTP_FORBIDDEN);
                }
            } else {
                $user = Auth::user();
            }
            
            // check whether the user has OB strategy
            $strategy = $user->optimalBlueStrategy;
           
            // otherwise get company's default strategy
            if(!$strategy) {
                $strategy = OptimalBlueDefaultStrategy::where('company_id', $user->company_id)
                    ->first();
            }
    
            if(!$strategy) {
                throw new Exception(trans('messages.error.not_found', [
                    'resource' => 'strategy'
                ]), JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
            }

            $stateId = data_get($data, 'state_id');
            $countyId = data_get($data, 'county_id');
            $creditScore = data_get($data, 'credit_score');
            $firstTimeBuyer = data_get($data, 'is_first_time_buyer');
            $isSelfEmployed = data_get($data, 'is_self_employed');
            $occupancy = data_get($data, 'occupancy');
            $propertyType = data_get($data, 'property_type');
            $unitsCount = data_get($data, 'units_count');
            $loanPurpose = data_get($data, 'loan_purpose');
            $homeValue = (float) data_get($data, 'property_value');
            $homeownersInsurance = (float) data_get($data, 'homeowners_insurance');
            $loanAmount = (float) data_get($data, 'loan_amount');
            $helocLoanAmount = (float) data_get($data, 'heloc_loan_amount');
            $isVeteran = data_get($data, 'is_military_veteran', false);
            $buydown = data_get($data, 'buydown');

            // calculate downpayment based on property value and loan amount
            $downPayment = $homeValue - $loanAmount;
            
            $state = State::find($stateId);
            $county = County::find($countyId);

            $score = Str::of($creditScore)
                ->explode(',')
                ->first();

            $loanTypes = [
                LoanType::CONVENTIONAL,
                LoanType::FHA,
            ];
    
            if ($isVeteran) {
                $loanTypes = [
                    LoanType::CONVENTIONAL,
                    LoanType::VA,
                ];
            }

            $stateAbbreviation = $state->abbreviation;
            $propertyCounty = $county->name;

            $infoPayload = [
                'borrowerInformation.fico' => (int) $score,
                'borrowerInformation.state' => $state->name,
                'borrowerInformation.firstName' => "",
                'borrowerInformation.lastName' => "",
                'borrowerInformation.firstTimeHomeBuyer' => $firstTimeBuyer,
                'borrowerInformation.selfEmployed' => $isSelfEmployed,
                'loanInformation.buydown' => $buydown,
                'propertyInformation.appraisedValue' => $homeValue,
                'propertyInformation.occupancy' => $occupancy,
                'propertyInformation.propertyStreetAddress' => "",
                'propertyInformation.city' => "",
                'propertyInformation.county' => $propertyCounty,
                'propertyInformation.state' => $stateAbbreviation,
                'propertyInformation.propertyType' => $propertyType,
                'propertyInformation.salesPrice' => $homeValue,
                'propertyInformation.numberOfUnits' => $unitsCount,
                'loanInformation.loanPurpose' => $loanPurpose,
                'loanInformation.baseLoanAmount' => $loanAmount,
                'loanInformation.helocDrawnAmount' => $helocLoanAmount,
                'representativeFICO' => (int) $score,
            ];

            // transform data to cater function
            $payload = [
                ...$data,
                'tax' => (float) data_get($data, 'property_taxes'),
                'homeowners_association_fee' => (float) data_get($data, 'hoa_dues'),
                'occupancy_type_id' => data_get($data, 'occupancy'),
                'seller_credit' => (float) data_get($data, 'seller_credits'),
                'price' => $homeValue,
                'loan_amount' => $loanAmount,
                'down_payment' => $downPayment,
                'property_state' => $stateAbbreviation,
                'property_county' => $propertyCounty,
                'credit_score' => $score,
                'loan_purpose' => $loanPurpose,
                'insurance' => $homeownersInsurance
            ];

            $OBStrategy = OptimalBlueService::setStrategy($strategy)
                    ->setFullProductSearchPayload($infoPayload)
                    ->getPayments($payload, $loanTypes);
    
            return $this->success([
                'payments' => $OBStrategy
            ]);
        } catch (Exception $e) {
            Log::error($e);
            return $this->error([
                'message' => $e->getMessage()
            ], $e->getCode());
        }
    }
}
