<?php

use App\Http\Controllers\AdminReportController;
use App\Http\Controllers\AgentListingInquiryController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\BuyerController;
use App\Http\Controllers\BuyersPreApprovalRequestController;
use App\Http\Controllers\BuyersPreApprovalRequestGetPaymentController;
use App\Http\Controllers\CheckUserController;
use App\Http\Controllers\FlyerController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\CountyController;
use App\Http\Controllers\CreditScoreRangeController;
use App\Http\Controllers\GeneratedFlyerController;
use App\Http\Controllers\GenerateOTPController;
use App\Http\Controllers\GetCompanyByCodeController;
use App\Http\Controllers\GetRateProviderController;
use App\Http\Controllers\HtmlToPdfController;
use App\Http\Controllers\HubspotController;
use App\Http\Controllers\ListingController;
use App\Http\Controllers\LicenseController;
use App\Http\Controllers\ListingActivityLogController;
use App\Http\Controllers\ListingGetPaymentController;
use App\Http\Controllers\ListingStatusController;
use App\Http\Controllers\LoanOfficerController;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\OptimalBlueController;
use App\Http\Controllers\OptimalBlueDefaultStrategyController;
use App\Http\Controllers\OptimalBlueUserStrategiesController;
use App\Http\Controllers\OccupancyTypeController;
use App\Http\Controllers\OptimalBluePipelineLoanController;
use App\Http\Controllers\PricingEngineController;
use App\Http\Controllers\PropertyTypeController;
use App\Http\Controllers\RegisterBorrowerController;
use App\Http\Controllers\SendLiveInHomeRatesInquiryEmail;
use App\Http\Controllers\StateController;
use App\Http\Controllers\StripeController;
use App\Http\Controllers\UnitController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\UserTypeController;
use App\Http\Controllers\PDFCoController;
use App\Http\Controllers\QuickQuoteInquiryController;
use App\Http\Controllers\RecaptchaController;
use App\Http\Controllers\ResetPasswordController;
use App\Http\Controllers\ResendInvitationEmailController;
use App\Http\Controllers\SendContactRequestController;
use App\Http\Controllers\VerifyOTPController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

/*
| Input protected routes here
*/

Route::middleware(['auth:sanctum'])->group(function () {

    /**
     * LICENSES
     */
    Route::group(['prefix' => 'licenses'], function () {
        Route::get('/{user_id}/{page}/{limit}', [LicenseController::class, 'index']);
        Route::post('/', [LicenseController::class, 'store']);
        Route::get('/{id}', [LicenseController::class, 'view']);
        Route::get('/state/{state_id}/user/{user_id}', [LicenseController::class, 'getLicensePerState']);
        Route::put('/{id}', [LicenseController::class, 'update']);
        Route::delete('/{id}', [LicenseController::class, 'delete']);
    });

    /**
     * LISTINGS
     */
    Route::group(['prefix' => 'listings'], function () {
        Route::get('/{page}/{limit}', [ListingController::class, 'index']);
        Route::get('/all', [ListingController::class, 'getAll']);
        Route::get('/{id}', [ListingController::class, 'view']);
        Route::put('/{id}', [ListingController::class, 'update']);
        Route::delete('/{id}', [ListingController::class, 'delete']);
        Route::get('/activity-logs/{id}/{page}/{limit}', [ListingActivityLogController::class, 'getAll']);
    });

    // PRIVATE OPTIMAL BLUE API
    Route::group(['prefix' => 'optimal-blue'], function () {
        Route::get('/get-latest-company-strategies/{companyId}', [OptimalBlueController::class, 'getCompanyStrategies']);
        Route::get('/users-strategy/{page}/{limit}', [OptimalBlueUserStrategiesController::class, 'getAll']);
        Route::get('/company-strategy', [OptimalBlueUserStrategiesController::class, 'getCompanyStrategy']);
        Route::put('/users-strategy/{id}', [OptimalBlueUserStrategiesController::class, 'createOrUpdateUserStrategy']);
        Route::get('/users-strategy/{id}', [OptimalBlueUserStrategiesController::class, 'getUserStrategy']);
        Route::put('/mass-update-strategy', [OptimalBlueUserStrategiesController::class, 'massUpdateUsersStrategy']);

        Route::group(['prefix' => 'default-strategy'], function () {
            Route::get('/', [OptimalBlueDefaultStrategyController::class, 'view']);
            Route::put('/', [OptimalBlueDefaultStrategyController::class, 'createOrUpdateDefaultStrategy']);
        });

        Route::get('/pipeline/loans/{id}', OptimalBluePipelineLoanController::class);
    });

    /**
     * Todo: Group these routes
     * USERS
     */
    //Get user list
    Route::get('/users/{id}/{company_id}/{page}/{limit}', [UserController::class, 'usersList']);
    Route::get('/users/all', [UserController::class, 'getAll']);

    //check if email address exists
    Route::post('/check-email', [UserController::class, 'checkEmailIfExisted']);

    //get user base on company_id
    Route::get('/user/{company_id}/{id}', [UserController::class, 'user']);

    //update user
    Route::post('/update-user', [UserController::class, 'updateUser']);

    //delete user
    Route::delete('/delete-user', [UserController::class, 'deleteUser']);

    // get list of users per company
    Route::get('/users/company/{companyId}', [UserController::class, 'usersPerCompany']);

    // complete on boarding
    Route::post('/complete-on-boarding', [UserController::class, 'completeOnBoarding']);
    Route::get('/full-user-list', [UserController::class, 'getFullUserList']);


    /**
     * COMPANIES
     */
    Route::group(['prefix' => 'companies'], function () {
        Route::get('/', [CompanyController::class, 'index']);
        Route::post('/', [CompanyController::class, 'store']);
        Route::get('/{id}', [CompanyController::class, 'view']);
        Route::post('/{id}', [CompanyController::class, 'update']);
        Route::delete('/{id}', [CompanyController::class, 'delete']);
    });
    Route::get('/company-per-user', [CompanyController::class, 'companyPerUser']);
    Route::get('/company-list', [CompanyController::class, 'companyList']);
    //on check unique to database 
    Route::post('/check-unique-company', [CompanyController::class, 'checkUnique']);

    Route::prefix('buyers')->group(function () {
        Route::get('/all', [BuyerController::class, 'getAll']);
        Route::apiResource('/', BuyerController::class)
            ->parameters(['' => 'buyer'])
            ->except(['create', 'edit'])
            ->names('buyers');

        Route::prefix('pre-approval-requests')->group(function () {
            Route::apiResource('/', BuyersPreApprovalRequestController::class)
                ->only(['store'])
                ->names('buyers.pre-approval-requests');
            Route::get('get-payments', BuyersPreApprovalRequestGetPaymentController::class);
            Route::post('send-email', SendContactRequestController::class);
        });
    });

    Route::get('/loan-officers/{id}', LoanOfficerController::class);

    // rate provider get payments
    Route::post('/get-rate-provider', GetRateProviderController::class);

    //admin report
    Route::get('/admin-report', [AdminReportController::class, 'adminReport']);


    //Generate Flyers
    Route::get('/flyer-images/{page}/{limit}', [FlyerController::class, 'getFlyerImages']);
    Route::post('/generate-flyers',  [PDFCoController::class, 'generateFlyers']);
    Route::get('/get-generated-flyers/{id}/{page}/{limit}', [FlyerController::class, 'getGeneratedFlyers']);
    Route::get('/generated-flyer/{listingId}', [FlyerController::class, 'getGeneratedFlyer']);


    //list of flyers active and archive
    Route::get('/flyers/{active_archive}/{page}/{limit}', [GeneratedFlyerController::class, 'viewAllFlyers']);
    Route::get('/generated-flyers/all', [GeneratedFlyerController::class, 'getGeneratedFlyers']);

    //archive flyer (soft delete)
    Route::delete('/archive-flyer', [GeneratedFlyerController::class, 'archiveFlyer']);

    //download flyer pdf
    Route::get('/download-flyer', [GeneratedFlyerController::class, 'downloadFlyer']);

    Route::post('html-to-pdf', HtmlToPdfController::class);

    Route::post('/resend-invitation-email/{id}', ResendInvitationEmailController::class);
});

Route::post('/borrowers/register', RegisterBorrowerController::class);

// STRIPE PUBLIC API
Route::post('/stripe/checkout', [StripeController::class, 'createCheckout']);
Route::post('/stripe/success-checkout', [StripeController::class, 'checkoutSuccess']);

// HUBSPOT PUBLIC API
Route::post('/get-hubspot-contact', [HubspotController::class, 'getContact']);
Route::post('/get-hubspot-company', [HubspotController::class, 'getCompany']);
Route::get('/get-hubspot-company-list/{limit}', [HubspotController::class, 'getHubspotCompanyList']);
Route::post('/process-contact', [HubspotController::class, 'processHubspotContact']);
Route::post('/process-hubspot-without-contact', [HubspotController::class, 'processHubspotWithoutContact']);
Route::get('/serach-hubspot-company', [HubspotController::class, 'searchHubspotCompany']);

// UPLIST PUBLIC API
Route::post('/register', [RegisterController::class, 'create']);
Route::post('/tokens/create', [UserController::class, 'createToken']);
Route::post('login', LoginController::class);
Route::post('reset-password', ResetPasswordController::class);
Route::post('request-otp', GenerateOTPController::class);
Route::post('verify-otp', VerifyOTPController::class);

Route::post('/send-verification-email', [UserController::class, 'sendVerificationEmail']);
Route::post('/verify-email', [UserController::class, 'verifyEmail']);
Route::get('/listing/{id}/mls-number/{mls_number}', [ListingController::class, 'getPublicListing']);
Route::post('/live-in-home-rates-inquiry', SendLiveInHomeRatesInquiryEmail::class);
Route::post('/public-quick-quote-inquiry', QuickQuoteInquiryController::class);
Route::post('/agent-listing-inquiry', AgentListingInquiryController::class);
Route::post('/get-public-rate-provider', GetRateProviderController::class);

Route::post('/listings', [ListingController::class, 'store']);
Route::get('/licenses/user/{user_id}', [LicenseController::class, 'getLicensesPerUser']);
Route::post('/verify-recaptcha', RecaptchaController::class);

// LOOK-UP API
Route::get('/pricing-engines', [PricingEngineController::class, 'index']);
Route::get('user-types', UserTypeController::class);
Route::get('/states', [StateController::class, 'index']);
Route::get('/company/{id}/states', [StateController::class, 'getStatesPerCompany']);
Route::get('/counties/{state_id}', [CountyController::class, 'index']);
Route::get('property-types', PropertyTypeController::class);
Route::get('occupancy-types', OccupancyTypeController::class);
Route::get('credit-score-ranges', CreditScoreRangeController::class);
Route::get('units', UnitController::class);
Route::get('listing-statuses', ListingStatusController::class);
Route::get('check-user', CheckUserController::class);
Route::get('get-user-details', [CheckUserController::class, 'checkUser']);
Route::get('/get-company-by-code/{code}', GetCompanyByCodeController::class);

// get payments
Route::post('/listing/{id}/get-payments', ListingGetPaymentController::class);
