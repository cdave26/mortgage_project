<?php

namespace App\DTO;

use Illuminate\Support\Arr;

class EssentQuote
{
    public readonly int $quoteNumber;

    public readonly float $miInitialPremiumAmount;

    public static function fromResult(array $result): self
    {
        // (START) Debug Essent Rate Finder
        \Illuminate\Support\Facades\Storage::disk('public')
            ->put('api-ratefinder-test.essent.us/Get231Quote.json', json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
        // (END) Debug Essent Rate Finder

        $self = new self;

        $keys = Arr::get($result, 'RESPONSE.0.RESPONSE_DATA.0.MI_RESPONSE.KEY');

        $quoteNumber = Arr::first($keys, function (array $value) {
            return $value['_Name'] === 'QuoteNumber';
        });

        $self->quoteNumber = Arr::get($quoteNumber, '_Value', 0);

        $self->miInitialPremiumAmount = data_get($result, 'RESPONSE.0.RESPONSE_DATA.0.MI_RESPONSE.MIInitialPremiumAmount', 0);

        return $self;
    }

    public function toArray(): array
    {
        return [
            'quote_number' => $this->quoteNumber,
            'mortgage_insurance' => $this->miInitialPremiumAmount,
        ];
    }
}
