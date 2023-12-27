<?php

namespace App\Helpers;

use App\Enums\Environment;
use App\Enums\ListingStatus;
use App\Enums\MortgageStatus;
use App\Enums\MortgageTitle;
use App\Models\Company;
use App\Models\County;
use App\Models\License;
use App\Models\PricingEngine;
use App\Models\State;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use PhpOffice\PhpSpreadsheet\IOFactory;

class UplistDataMigration extends Migration
{
    public string $file;

    public string $company;

    public int $companiesEndRow;

    public int $companyStateLicensesEndRow;

    public int $usersEndRow;

    public int $licensesEndRow;

    public int $listingsEndRow;

    public function getStateId(string $name): ?int
    {
        $state = State::firstWhere('name', $name);
        return $state?->id;
    }

    public function getLicenseId(int $user, int $state): ?int
    {
        $license = License::firstWhere([
            ['user_id', $user],
            ['state_id', $state],
        ]);

        return $license?->id;
    }

    public function getCountyId(int $state, string $county): ?int
    {
        $county = County::firstWhere([
            ['state_id', $state],
            ['name', $county],
        ]);

        return $county?->id;
    }

    public function getExcelData(
        string $path,
        string $worksheet,
        array $attributes,
        int $startRow,
        int $endRow,
        string $startColumn = 'A',
    ): array {
        $spreadsheet = IOFactory::load($path);
        $worksheet = $spreadsheet->getSheetByNameOrThrow($worksheet);
        $records = [];

        foreach ($worksheet->getRowIterator($startRow, $endRow) as $row) {
            $record = [];

            foreach ($row->getCellIterator($startColumn) as $cell) {
                $column = $cell->getColumn();
                $value = $cell->getValue();
                $attribute = Arr::get($attributes, $column);

                if (is_null($attribute)) {
                    continue;
                }

                $profileLogo = fn (string $url) => implode([
                    'profile_logo/', basename($url),
                ]);

                $companyLogo = fn (string $url) => implode([
                    'company_logo/', basename($url),
                ]);

                $value = match ($attribute) {
                    'state_id' => $this->getStateId($value),
                    'listing_status' => ListingStatus::from($value),
                    'company_logo' => $value ? $companyLogo($value) : null,
                    'profile_logo' => $value ? $profileLogo($value) : null,
                    'password' => Hash::make(generate_password()),
                    'email' => fake()->unique()->safeEmail(),
                    default => $value,
                };

                Arr::set($record, $attribute, $value);
            }

            $records[] = $record;
        }

        return $records;
    }

    public function populateCompanies(int $endRow): array
    {
        return $this->getExcelData($this->file, 'companies', [
            'C' => 'name',
            'D' => 'has_company_msa',
            'E' => 'address',
            'F' => 'city',
            'G' => 'state',
            'H' => 'zip',
            'I' => 'equal_housing',
            'J' => 'company_logo',
            'K' => 'header_background_color',
            'L' => 'header_text_color',
            'N' => 'is_enterprise',
            'P' => 'hubspot_company_id',
            'S' => 'company_privacy_policy_URL',
            'U' => 'company_nmls_number',
            'V' => 'company_mobile_number',
            'AB' => 'allow_access_to_buyer_app',
            'AC' => 'allow_loan_officer_to_upload_logo',
        ], 4, $endRow, 'C');
    }

    public function populateCompanyStateLicenses(int $endRow): array
    {
        return $this->getExcelData($this->file, 'company_state_licenses', [
            'C' => 'state_id',
            'D' => 'license',
            'J' => 'lender_broker',
            'K' => 'servicer_lender_broker',
            'L' => 'lender_broker_depository',
            'M' => 'banker_broker',
            'N' => 'banker_broker_servicer',
            'O' => 'licensee_registrant',
            'P' => 'california_options',
            'Q' => 'address',
            'R' => 'city',
            'S' => 'zip',
        ], 4, $endRow, 'C');
    }

    public function populateUsers(int $endRow): array
    {
        $data = $this->getExcelData($this->file, 'users', [
            'D' => 'pricing_engine_id',
            'E' => 'user_type_id',
            'G' => 'first_name',
            'H' => 'last_name',
            'I' => 'email',
            'J' => 'alternative_email',
            'K' => 'job_title',
            'L' => 'profile_logo',
            'M' => 'username',
            'N' => 'password',
            'R' => 'mobile_number',
            'S' => 'nmls_num',
            'Y' => 'hubspot_contact_id',
            'AA' => 'first_time_login',
            'AE' => 'user_status',
            'AF' => 'iscomplete_onboarding',
        ], 4, $endRow, 'D');

        return $data;
    }

    public function populateLicenses(int $endRow): array
    {
        $data = $this->getExcelData($this->file, 'licenses', [
            'B' => 'user_id',
            'C' => 'state_id',
            'D' => 'license',
        ], 4, $endRow, 'B');

        $licenses = [];

        foreach ($data as $license) {
            $key = $license['user_id'];
            $licenses[$key][] = Arr::except($license, 'user_id');
        }

        return $licenses;
    }

    public function populateListings(int $endRow): array
    {
        $data = $this->getExcelData($this->file, 'listings', [
            'B' => 'user_id',
            'C' => 'company_id',
            'D' => 'user_license_id',
            'E' => 'state_id',
            'F' => 'county_id',
            'G' => 'mls_number',
            'H' => 'mls_link',
            'J' => 'page_design',
            'K' => 'flyer_id',
            'L' => 'listing_agent_name',
            'M' => 'listing_agent_email',
            'N' => 'property_address',
            'O' => 'property_apt_suite',
            'P' => 'property_city',
            'Q' => 'property_zip',
            'R' => 'property_type',
            'S' => 'units_count',
            'T' => 'property_value',
            'U' => 'seller_credits',
            'V' => 'credit_verified_by',
            'W' => 'default_down_payment',
            'X' => 'loan_amount',
            'Y' => 'hoa_dues',
            'Z' => 'property_taxes',
            'AA' => 'homeowners_insurance',
            'AB' => 'usda_lookup',
            'AC' => 'fha_condo_lookup',
            'AD' => 'va_condo_lookup',
            'AE' => 'listing_status',
            'AG' => 'pub_page_web_views',
        ], 4, $endRow, 'B');

        $listings = [];

        foreach ($data as $listing) {
            $key = $listing['user_id'];
            $listings[$key][] = Arr::except($listing, 'user_id');
        }

        return $listings;
    }

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!App::environment(Environment::PRODUCTION)) {
            return;
        }

        try {
            DB::beginTransaction();

            $companies = $this->populateCompanies($this->companiesEndRow);
            $companyStateLicenses = $this->populateCompanyStateLicenses($this->companyStateLicensesEndRow);
            $users = $this->populateUsers($this->usersEndRow);
            $licenses = $this->populateLicenses($this->licensesEndRow);
            $listings = $this->populateListings($this->listingsEndRow);

            $companyStateLicenses = Arr::map($companyStateLicenses, function ($license) {
                $state = $license['state_id'];
                $bankerbroker = MortgageTitle::tryFrom($license['banker_broker']);
                $bankerBrokerServicer = MortgageTitle::tryFrom($license['banker_broker_servicer']);
                $lenderBroker = MortgageTitle::tryFrom($license['lender_broker']);
                $lenderBrokerDepository = MortgageTitle::tryFrom($license['lender_broker_depository']);
                $servicerLenderBroker = MortgageTitle::tryFrom($license['servicer_lender_broker']);
                $licenseeRegistrant = MortgageStatus::tryFrom($license['licensee_registrant']);
                $californiaOptions = $license['california_options'];
                $address = $license['address'];
                $city = $license['city'];
                $zip = $license['zip'];

                $stateMetadata = match ($state) {
                    3 => StateMetadata::arizona($bankerbroker, $address, $city, $zip),
                    4 => StateMetadata::arkansas($bankerBrokerServicer, $address, $city, $zip),
                    5 => StateMetadata::california($californiaOptions),
                    7 => StateMetadata::connecticut($lenderBroker),
                    8 => StateMetadata::delaware($lenderBroker),
                    11 => StateMetadata::georgia($lenderBroker, $licenseeRegistrant, $address, $city, $zip),
                    22 => StateMetadata::massachusetts($lenderBroker),
                    27 => StateMetadata::montana($lenderBroker),
                    28 => StateMetadata::nebraska($licenseeRegistrant),
                    29 => StateMetadata::nevada($address, $city, $zip),
                    31 => StateMetadata::newJersey($lenderBrokerDepository, $licenseeRegistrant),
                    33 => StateMetadata::newYork($bankerbroker, $licenseeRegistrant),
                    36 => StateMetadata::ohio($address, $city, $zip),
                    41 => StateMetadata::rhodeIsland($lenderBroker),
                    42 => StateMetadata::southCarolina($servicerLenderBroker),
                    45 => StateMetadata::texas($licenseeRegistrant),
                    47 => StateMetadata::vermont($lenderBroker, $address, $city, $zip),
                    49 => StateMetadata::virginia($lenderBroker),
                    52 => StateMetadata::wisconsin($bankerbroker),
                    default => [],
                };

                return Arr::except([
                    ...$license,
                    'state_metadata' => empty($stateMetadata)
                        ? $stateMetadata : [$stateMetadata],
                ], ['lender_broker']);
            });

            $company = function ($company) use ($companyStateLicenses, &$users) {
                $company->companyStateLicenses()
                    ->createMany($companyStateLicenses);

                foreach ($users as $user) {
                    $user = $company->users()->create($user);

                    $user->update([
                        'url_identifier' => url_identifier($user->id),
                        'employee_id' => employee_id($user->company),
                    ]);
                }

                $users = $company->users;
            };

            PricingEngine::find(1)->companies()
                ->createManyQuietly($companies)
                ->each($company);

            foreach ($users as $user) {
                $userLicenses = Arr::get($licenses, $user->username);
                $userListings = Arr::get($listings, $user->username);

                if ($userLicenses) {
                    $user->licenses()->createMany($userLicenses);
                }

                if (is_null($userListings)) continue;

                $userListings = Arr::map($userListings, function ($listing) use ($user) {
                    $county = $this->getCountyId($listing['state_id'], $listing['county_id']);

                    if (is_null($county)) {
                        $message = Str::swap([
                            ':county' => $listing['county_id'],
                        ], 'County named ":county" not found');

                        dd($message);
                    }

                    $pageLink = fn (string $identifier, string $mls) => implode([
                        '/listing/', $identifier, '-', 'mls', $mls,
                    ]);

                    return [
                        ...$listing,
                        'company_id' => $user->company_id,
                        'user_license_id' => $this->getLicenseId($user->id, $listing['state_id']),
                        'county_id' => $this->getCountyId($listing['state_id'], $listing['county_id']),
                        'page_link' => $pageLink($user->url_identifier, $listing['mls_number']),
                    ];
                });

                $user->listings()->createManyQuietly($userListings);
            }

            DB::commit();
        } catch (\Exception $exception) {
            DB::rollBack();
            dd($exception->getMessage());
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (!App::environment(Environment::PRODUCTION)) {
            return;
        }

        try {
            DB::beginTransaction();

            $company = Company::firstWhere('name', $this->company);

            $company->companyStateLicenses()->forceDelete();

            $company->users()->each(function ($user) {
                $user->listings()->forceDelete();
                $user->licenses()->forceDelete();
                $user->forceDelete();
            });

            $company->forceDelete();

            DB::commit();
        } catch (\Exception $exception) {
            DB::rollBack();
            dd($exception->getMessage());
        }
    }
}
