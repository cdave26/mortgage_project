<?php

namespace App\Http\Controllers;

use App\Enums\LoanType;
use App\Facades\OptimalBlueService;
use App\Http\Requests\ListingGetPaymentsRequest;
use App\Models\Listing;
use App\Models\OptimalBlueDefaultStrategy;
use App\Models\OptimalBlueUserStrategy;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ListingGetPaymentController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(int $id, ListingGetPaymentsRequest $request): JsonResponse
    {
        $data = $request->validated();

        try {
            $listing = Listing::query()->find($id);

            if(!$listing) {
                throw new Exception(trans('messages.error.not_found', [
                    'resource' => 'listing'
                ]), JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
            }
    
            // check whether the user has OB strategy
            $strategy = OptimalBlueUserStrategy::where('user_id', $listing->user_id)->first();
           
            // otherwise get company's default strategy
            if(!$strategy) {
                $strategy = OptimalBlueDefaultStrategy::where('company_id', $listing->company_id)
                    ->first();
            }
    
            if(!$strategy) {
                throw new Exception(trans('messages.error.not_found', [
                    'resource' => 'strategy'
                ]), JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
            }

            $firstTimeBuyer = data_get($data, 'is_first_time_buyer');
            $occupancy = data_get($data, 'occupancy');
            $creditScore = data_get($data, 'credit_score');
            $isVeteran = data_get($data, 'is_military_veteran', false);
            $loanAmount = (float) data_get($data, 'loan_amount');
            $homeValue = (float) data_get($data, 'property_value');
            $downPayment = (float) data_get($data, 'down_payment');
            $buydown = data_get($data, 'buydown');

            $stateAbbreviation = $listing->state->abbreviation;
            $propertyCounty = $listing->county->name;

            $score = Str::of($creditScore)
                ->explode(',')
                ->first();

            $loanTypes = [
                LoanType::CONVENTIONAL,
            ];

            // check if FHA lookup has been checked from listing
            if($listing->fha_condo_lookup) {
                $loanTypes = [
                    LoanType::CONVENTIONAL,
                    LoanType::FHA,
                ];
            }
    
            if ($isVeteran) {
                $loanTypes = [
                    LoanType::CONVENTIONAL,
                    LoanType::VA,
                ];
            }

            $infoPayload = [
                'borrowerInformation.fico' => (int) $score,
                'borrowerInformation.state' => $listing->state->name,
                'borrowerInformation.firstName' => "",
                'borrowerInformation.lastName' => "",
                'borrowerInformation.firstTimeHomeBuyer' => $firstTimeBuyer,
                'borrowerInformation.selfEmployed' => false,
                'loanInformation.buydown' => $buydown,
                'propertyInformation.appraisedValue' => $homeValue,
                'propertyInformation.occupancy' => $occupancy,
                'propertyInformation.propertyStreetAddress' => $listing->property_apt_suite . ' ' . $listing->property_address,
                'propertyInformation.city' => $listing->property_city,
                'propertyInformation.county' => $propertyCounty,
                'propertyInformation.state' => $stateAbbreviation,
                'propertyInformation.propertyType' => $listing->property_type,
                'propertyInformation.salesPrice' => $homeValue,
                'propertyInformation.numberOfUnits' => $listing->units_count,
                'loanInformation.baseLoanAmount' => $loanAmount,
                'representativeFICO' => (int) $score,
            ];

            // transform data to cater function
            $payload = [
                ...$data,
                'tax' => (float) $listing->property_taxes, 
                'homeowners_association_fee' => (float) $listing->hoa_dues,
                'insurance' => (float) $listing->homeowners_insurance,
                'occupancy_type_id' => data_get($data, 'occupancy'),
                'seller_credit' => (float) data_get($data, 'seller_credits'),
                'price' => $homeValue,
                'loan_amount' => $loanAmount,
                'down_payment' => $downPayment,
                'property_state' => $stateAbbreviation,
                'property_county' => $propertyCounty,
                'credit_score' => $score,
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
