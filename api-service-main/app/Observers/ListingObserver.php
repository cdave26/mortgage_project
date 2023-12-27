<?php

namespace App\Observers;

use App\Enums\ListingStatus;
use App\Enums\PropertyType;
use App\Enums\Unit;
use App\Models\ActivityLog;
use App\Models\Company;
use App\Models\County;
use App\Models\GeneratedFlyer;
use App\Models\License;
use App\Models\Listing;
use App\Models\State;
use App\Models\User;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Auth;

class ListingObserver
{
    private function getFromQuery(string $model, int $id): string
    {
        switch($model) {
            case 'state_id':
                $state = State::query()->find($id);
                return $state->name;
                break;
            case 'county_id':
                $county = County::query()->find($id);
                return $county->name;
                break;
            case 'user_license_id':
                $userLicense = License::query()->find($id);
                return $userLicense->license;
                break;
            case 'user_id':
                $user = User::query()->find($id);
                return $user->first_name . ' ' . $user->last_name;
                break;
            case 'company_id':
                $company = Company::query()->find($id);
                return $company->name;
                break;
            default:
                return '';
        }
    }

    private function getFromEnum(string $model, string $value): string
    {

        switch($model) {
            case 'listing_status':
                return ListingStatus::from($value)->description();
                break;
            case 'units_count':
                return Unit::from($value)->description();
                break;
            case 'property_type':
                return PropertyType::from($value)->description();
                break;
            default:
                return '';
        }
    }

    private function convertBooleanToString($val): string
    {
        return $val === TRUE ? 'True' : 'False';
    }
    
    /**
     * Handle the Listing "created" event.
     */
    public function created(Listing $listing): void
    {
        ActivityLog::query()->create([
            'user_id' => $listing->user_id,
            'model_name' => 'listing',
            'model_id' => $listing->id,
            'operation' => 'create',
            'original_data' => "",
            'updated_data' => "",
        ]);
    }

    private function checkFloatValues($originalData, $updatedData): bool
    {
        return (float) $originalData === (float) $updatedData;
    }

    /**
     * Handle the Listing "updated" event.
     */
    public function updated(Listing $listing): void
    {
        $fields = $listing->getOriginal();
        $difference = $listing->getChanges();
        
        $formattedLogsArray = [];

        $condoLookups = ['usda_lookup', 'fha_condo_lookup', 'va_condo_lookup'];
        $queryLookups = ['state_id', 'county_id', 'user_license_id', 'user_id', 'company_id'];
        $enumLookups = ['listing_status', 'property_type', 'units_count'];

        foreach($difference as $diff => $updatedData) {
            $originalData = $fields[$diff];

            // remove key if the value has not changed to avoid parsing
            if($diff === 'default_down_payment' && $this->checkFloatValues($originalData, $updatedData)) {
                $fields = Arr::except($fields, ['default_down_payment']);
            }

            if(array_key_exists($diff, $fields) && !in_array($diff, [Listing::CREATED_AT, Listing::UPDATED_AT])) {
                if($diff === 'listing_status') {
                    $generatedFlyers = GeneratedFlyer::where('listing_id', $listing->id);

                    if($updatedData === ListingStatus::ARCHIVED->value) {
                        $generatedFlyers->update(['deleted_by' => Auth::id()]);
                        $generatedFlyers->delete();
                    } else {
                        $generatedFlyers->restore();
                        $generatedFlyers->update(['deleted_by' => null ]);
                    }
                }

                if($diff === 'default_down_payment') {
                    $originalData = (float) $originalData;
                    $updatedData = (float) $updatedData;
                }

                if(in_array($diff, $condoLookups)) {
                    $updatedData = $this->convertBooleanToString($updatedData);
                    $originalData = $this->convertBooleanToString($originalData);
                };

                if(in_array($diff, $queryLookups)) {
                    $updatedData = $this->getFromQuery($diff, $updatedData);
                    $originalData = $this->getFromQuery($diff, $originalData);
                }

                if(in_array($diff, $enumLookups)) {
                    $updatedData = $this->getFromEnum($diff, $updatedData);
                    $originalData = $this->getFromEnum($diff, $originalData);
                }

                $formattedLogsArray[] = array(
                    'user_id' => Auth::id(),
                    'model_name' => 'listing',
                    'model_id' => $listing->id,
                    'column_name' => $diff,
                    'operation' => 'update',
                    'original_data' => $originalData ?? "",
                    'updated_data' => $updatedData ?? "",
                );
            }
        }

        ActivityLog::insert($formattedLogsArray);
    }

    /**
     * Handle the Listing "deleted" event.
     */
    public function deleted(Listing $listing): void
    {
        $generatedFlyers = GeneratedFlyer::where('listing_id', $listing->id);
        $generatedFlyers->update(['deleted_by' => Auth::id()]);
        $generatedFlyers->delete();

        ActivityLog::query()->create([
            'user_id' => Auth::id(),
            'model_name' => 'listing',
            'model_id' => $listing->id,
            'operation' => 'delete',
            'original_data' => "",
            'updated_data' => "",
        ]);
    }

    /**
     * Handle the Listing "restored" event.
     */
    public function restored(Listing $listing): void
    {
        //
    }

    /**
     * Handle the Listing "force deleted" event.
     */
    public function forceDeleted(Listing $listing): void
    {
        //
    }
}
