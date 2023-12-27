<?php

namespace App\Services;

use App\Enums\PricingEngine as PricingEngineEnum;
use App\Enums\UserStatus;
use App\Enums\UserType as UserTypeEnum;
use App\Models\Buyer;
use App\Models\PricingEngine;
use App\Models\User;
use App\Models\UserType;
use Illuminate\Database\Query\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class BuyerService extends Service
{
    public function all(array $data): LengthAwarePaginator
    {
        $name = Arr::get($data, 'name');
        $propertyType = Arr::get($data, 'property_type');
        $state = Arr::get($data, 'state');
        $loanOfficer = Arr::get($data, 'loan_officer');
        $company = Arr::get($data, 'company');
        $orderBy = Arr::get($data, 'order_by', []);
        $perPage = Arr::get($data, 'per_page', 10);

        $user = Auth::user();

        $query = DB::table('buyers')
            ->join('users', 'buyers.borrower_id', '=', 'users.id')
            ->join('users as loan_officers', 'buyers.loan_officer_id', '=', 'loan_officers.id')
            ->join('occupancy_types', 'buyers.occupancy_type_id', '=', 'occupancy_types.id')
            ->join('property_types', 'buyers.property_type_id', '=', 'property_types.id')
            ->join('states', 'buyers.property_state_id', '=', 'states.id')
            ->whereNull('buyers.deleted_at')
            ->selectRaw(<<<SELECT
                buyers.id,
                CONCAT(loan_officers.first_name, ' ', loan_officers.last_name) AS loan_officer_name,
                users.first_name AS borrower_first_name,
                users.last_name AS borrower_last_name,
                occupancy_types.description AS occupancy_type,
                property_type_id,
                property_types.description AS property_type,
                property_state_id,
                CONCAT(states.abbreviation, ' - ', states.name) AS property_state,
                CONCAT(buyers.agent_first_name, ' ', buyers.agent_last_name) AS agent_name,
                buyers.created_at
            SELECT);

        if ($name) {
            $query->where(function (Builder $query) use ($name) {
                $query->where('users.first_name', 'like', "%$name%")
                    ->orWhere('users.last_name', 'like', "%$name%");
            });
        }

        if ($propertyType) {
            $query->whereIn('property_type_id', $propertyType);
        }

        if ($state) {
            $query->whereIn('property_state_id', $state);
        }

        if ($loanOfficer) {
            $query->where(function (Builder $query) use ($loanOfficer) {
                $query->where('loan_officers.first_name', 'like', "%$loanOfficer%")
                    ->orWhere('loan_officers.last_name', 'like', "%$loanOfficer%");
            });
        }

        if ($company) {
            $query->where('users.company_id', $company);
        }

        if ($user->user_type_id === UserTypeEnum::LOAN_OFFICER->id()) {
            $query->where('loan_officers.id', $user->id);
        }

        if (Arr::exists($orderBy, 'borrower_first_name')) {
            $query->orderBy(
                'borrower_first_name',
                Arr::get($orderBy, 'borrower_first_name'),
            );
        }

        if (Arr::exists($orderBy, 'borrower_last_name')) {
            $query->orderBy(
                'borrower_last_name',
                Arr::get($orderBy, 'borrower_last_name'),
            );
        }

        if (Arr::exists($orderBy, 'occupancy_type')) {
            $query->orderBy(
                'occupancy_type',
                Arr::get($orderBy, 'occupancy_type'),
            );
        }

        if (Arr::exists($orderBy, 'property_type')) {
            $query->orderBy(
                'property_type',
                Arr::get($orderBy, 'property_type'),
            );
        }

        if (Arr::exists($orderBy, 'property_state')) {
            $query->orderBy(
                'property_state',
                Arr::get($orderBy, 'property_state'),
            );
        }

        if (Arr::exists($orderBy, 'agent_name')) {
            $query->orderBy(
                'agent_name',
                Arr::get($orderBy, 'agent_name'),
            );
        }

        if (Arr::exists($orderBy, 'loan_officer_name')) {
            $query->orderBy(
                'loan_officer_name',
                Arr::get($orderBy, 'loan_officer_name'),
            );
        }

        if (Arr::exists($orderBy, 'created_at')) {
            $query->orderBy(
                'created_at',
                Arr::get($orderBy, 'created_at'),
            );
        }

        return $query->paginate($perPage)
            ->withQueryString();
    }

    public function create(array $data): void
    {
        try {
            DB::beginTransaction();

            $userType = UserType::where(
                'name',
                UserTypeEnum::BUYER,
            )->first();

            $pricingEngine = PricingEngine::where(
                'name',
                PricingEngineEnum::OPTIMAL_BLUE,
            )->first();

            $borrower = User::firstOrCreate(
                [
                    'email' => Arr::get($data, 'borrower_email'),
                    'user_type_id' => $userType->id,
                ],
                [
                    'first_name' => Arr::get($data, 'borrower_first_name'),
                    'last_name' => Arr::get($data, 'borrower_last_name'),
                    'username' => Str::random(10),
                    'password' => Hash::make(Str::random(10)),
                    'company_id' => Arr::get($data, 'company_id'),
                    'pricing_engine_id' => $pricingEngine->id,
                    'job_title' => '',
                    'nmls_num' => '',
                    'mobile_number' => Arr::get($data, 'borrower_mobile_number'),
                    'first_time_login' => true,
                    'user_status' => UserStatus::INACTIVE,
                ],
            );

            $characters = range('A', 'Z');

            $code = implode([
                ...Arr::random($characters, 2),
                random_int(10000, 99999),
            ]);

            Buyer::create(array_merge([
                'borrower_id' => $borrower->id,
                'loan_officer_id' => Auth::id(),
                'code' => $code,
            ], $data));

            DB::commit();
        } catch (\Exception $exception) {
            DB::rollBack();
            $this->abort($exception);
        }
    }

    public function find(string $id): Buyer
    {
        return Buyer::with($this->getRelations())
            ->findOrFail($id);
    }

    public function update(string $id, array $data): void
    {
        $buyer = Buyer::findOrFail($id);
        $buyer->fill($data);
        $buyer->save();

        $buyer->borrower()->update([
            'first_name' => Arr::get($data, 'borrower_first_name'),
            'last_name' => Arr::get($data, 'borrower_last_name'),
            'email' => Arr::get($data, 'borrower_email'),
            'mobile_number' => Arr::get($data, 'borrower_mobile_number'),
        ]);
    }

    public function delete(string $id): void
    {
        $buyer = Buyer::findOrFail($id);
        $buyer->delete();

        $buyer->borrower()
            ->delete();
    }

    protected function getRelations(): array
    {
        return [
            'borrower:id,first_name,last_name,email,mobile_number,company_id',
            'borrowerState:id,name,abbreviation',
            'propertyType:id,description',
            'occupancyType:id,description',
            'unit:id,description',
            'propertyState:id,name,abbreviation',
            'propertyCounty:id,name,county_fips',
            'creditScoreRange:id,description',
            'loanOfficer:id,first_name,last_name,email,custom_logo_flyers',
        ];
    }

    public function getAll(array $data)
    {
        $user = Auth::user();
        $name = Arr::get($data, 'name');
        $propertyType = Arr::get($data, 'property_type');
        $state = Arr::get($data, 'state');
        $loanOfficer = Arr::get($data, 'loan_officer');

        $query = DB::table('buyers as b')
            ->join('users as u', 'b.borrower_id', '=', 'u.id')
            ->join('users as loan_officers', 'b.loan_officer_id', '=', 'loan_officers.id')
            ->join('occupancy_types', 'b.occupancy_type_id', '=', 'occupancy_types.id')
            ->join('property_types', 'b.property_type_id', '=', 'property_types.id')
            ->join('states as s', 'b.property_state_id', '=', 's.id')
            ->join('counties as c', 'b.property_county_id', '=', 'c.id')
            ->join('states as bs', 'b.borrower_state_id', '=', 'bs.id')
            ->join('units', 'b.unit_id', '=', 'units.id')
            ->join('credit_score_ranges as csr', 'b.credit_score_range_id', '=', 'csr.id')
            ->whereNull('b.deleted_at')
            ->selectRaw(<<<SELECT
                b.id,
                CONCAT(loan_officers.first_name, ' ', loan_officers.last_name) AS loan_officer_name,
                u.first_name AS borrower_first_name,
                u.last_name AS borrower_last_name,
                u.email AS borrower_email,
                u.mobile_number AS borrower_mobile_number,
                b.co_borrower_first_name,
                b.co_borrower_last_name,
                b.co_borrower_email,
                b.borrower_address,
                b.borrower_city,
                b.purchase_price,
                b.debt_to_income_ratio,
                b.veterans_affairs,
                b.max_qualifying_payment,
                b.max_down_payment,
                b.first_time_home_buyers,
                b.default_down_payment_value,
                b.default_down_payment_type,
                b.homeowners_insurance,
                b.self_employed,
                CONCAT(bs.abbreviation, ' - ', bs.name) AS borrower_state,
                b.borrower_zip,
                occupancy_types.description AS occupancy_type,
                property_type_id,
                property_types.description AS property_type,
                units.description AS units_count,
                csr.description as credit_score_range,
                property_state_id,
                CONCAT(s.abbreviation, ' - ', s.name) AS property_state,
                c.name AS property_county,
                b.agent_first_name,
                b.agent_last_name,
                b.agent_email,
                b.created_at,
                b.updated_at
            SELECT);
        
            if ($name) {
                $query->where(function (Builder $query) use ($name) {
                    $query->where('u.first_name', 'like', "%$name%")
                        ->orWhere('u.last_name', 'like', "%$name%");
                });
            }
    
            if ($propertyType) {
                $query->whereIn('property_type_id', $propertyType);
            }
    
            if ($state) {
                $query->whereIn('property_state_id', $state);
            }
    
            if ($loanOfficer) {
                $query->where(function (Builder $query) use ($loanOfficer) {
                    $query->where('loan_officers.first_name', 'like', "%$loanOfficer%")
                        ->orWhere('loan_officers.last_name', 'like', "%$loanOfficer%");
                });
            }

        if ($user->user_type_id === UserTypeEnum::COMPANY_ADMIN->id()) {
            $query->where('u.company_id', $user->company_id);
        }

        if ($user->user_type_id === UserTypeEnum::LOAN_OFFICER->id()) {
            $query->where('loan_officers.id', $user->id);
        }

        return $query->orderBy('b.created_at')->get();
    }
}
