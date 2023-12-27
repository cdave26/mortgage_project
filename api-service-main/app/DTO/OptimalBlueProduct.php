<?php

namespace App\DTO;

use App\Enums\LoanType;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;

class OptimalBlueProduct
{
    public readonly array $products;

    public readonly array $totalLoanAmountDetails;

    public static function fromFullProductSearch(array $result): self
    {
        $self = new self;

        $searchId = Arr::get($result, 'searchId', '');

        $desiredPrice = Arr::get($result, 'desiredPrice');

        $sellerCredit = Arr::get($result, 'sellerCredit');

        $totalLoanAmountDetails = Arr::get($result, 'totalLoanAmountDetails');

        $products = Arr::get($result, 'products', []);

        $products = Collection::make($products)
            ->map(function (array $product) use ($desiredPrice, $sellerCredit) {
                return [
                    ...$product,
                    'desiredPrice' => $desiredPrice,
                    'closestValueDiff' => $desiredPrice - $product['price'],
                    'sellerCredit' => $sellerCredit,
                ];
            })
            ->groupBy('loanType')
            ->map(function (Collection $products, string $key) use ($searchId, $totalLoanAmountDetails): array {
                // (START) Debug Optimal Blue
                \Illuminate\Support\Facades\Storage::disk('public')
                    ->put("marketplace.optimalblue.com/productsearch/$key.json", json_encode([
                        'products' => $products,
                        'totalLoanAmountDetails' => $totalLoanAmountDetails,
                    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
                // (END) Debug Optimal Blue

                $type = LoanType::from($key);

                // Product price is equal to $desiredPrice
                $closestValue = $products->where('closestValueDiff', 0)
                    ->sortBy([
                        ['rate', 'asc'],
                    ]);

                if ($closestValue->isEmpty()) {
                    // Product price is greater than $desiredPrice
                    $closestValue = $products->where('closestValueDiff', '<', 0)
                        ->sortBy([
                            ['rate', 'asc'],
                            ['closestValueDiff', 'desc'],
                        ]);
                }

                if ($closestValue->isEmpty()) {
                    // Product price is less than $desiredPrice
                    $closestValue = $products->where('closestValueDiff', '>', 0)
                        ->sortBy([
                            ['closestValueDiff', 'asc'],
                            ['rate', 'asc'],
                        ]);
                }

                $product = $closestValue->first();

                $mortgageInsurance = match($type) {
                    LoanType::VA => 0,
                    default => Arr::get($product, 'monthlyMI', 0),
                };

                return [
                    'search_id' => $searchId,
                    'product_id' => Arr::get($product, 'productId', 0),
                    'interest_rate' => Arr::get($product, 'rate', 0),
                    'annual_percentage_rate' => Arr::get($product, 'apr', 0),
                    'monthly_principal_interest' => Arr::get($product, 'principalAndInterest', 0),
                    'mortgage_insurance' => $mortgageInsurance,
                    'lock_period' => Arr::get($product, 'lockPeriod', 0),
                    'amortization_term' => (int) Arr::get($product, 'amortizationTerm', 0),
                ];
            });

        $hasConforming = $products->has(LoanType::CONFORMING->value);

        $conformingInterestRate = data_get($products, implode('.', [
            LoanType::CONFORMING->value, 'interest_rate',
        ]), 0);

        $nonConformingInterestRate = data_get($products, implode('.', [
            LoanType::NON_CONFORMING->value, 'interest_rate',
        ]), 0);

        if ($hasConforming && $conformingInterestRate < $nonConformingInterestRate) {
            $products->forget(LoanType::NON_CONFORMING->value);
        }

        $self->products = $products->all();

        $self->totalLoanAmountDetails = $totalLoanAmountDetails;

        return $self;
    }

    public function toArray(): array
    {
        return [
            'products' => $this->products,
            'totalLoanAmountDetails' => $this->totalLoanAmountDetails,
        ];
    }
}
