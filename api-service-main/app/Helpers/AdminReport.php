<?php

namespace App\Helpers;

use App\Enums\UserStatus;
use App\Enums\UserType;
use Carbon\Carbon;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Exception;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Arr;
// use stdClass;
// use ZipArchive;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class AdminReport
{

    protected $headersForAllCompaniesSummary = ["", "Company", "Total LO in co (HS)", "Total LO users", "Total Listings", "Total Flyers", 'Total Logins'];
    protected $dynamicHeaders = ["Company", "Loan Officer", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    protected $lastRow = null;
    protected $column = null;

    public function generateReport()
    {
        try {
            // $zipArchive = new ZipArchive();
            $year = Carbon::now()->year;
            $spreadsheet = new Spreadsheet();

            $sheet = $spreadsheet->getActiveSheet();

            /**
             * Dynamic sheet for each per company Listing
             */
            $companies = DB::table('companies')
                ->select(['id', 'name'])
                ->where('id', '!=', 1)
                ->whereNull('deleted_at')
                ->get();

            /**
             * Sheet for all companies summary
             */
            $sheet->setTitle('All Companies Summary');
            $this->allCompaniesSummary('All Companies Summary', $year, $sheet, $companies);

            /**
             * Sheet for all companies create per month
             */
            $sheet1 = $spreadsheet->createSheet();
            $sheet1->setTitle('List Of Companies ');
            $this->allCompaniesSummary('Companies Created Per Month', $year, $sheet1, $companies);

            if (count($companies) > 0) {
                /**
                 * Dynamic sheet for each per company Listing
                 */
                foreach ($companies as  $compListing) {
                    $sheet2 = $spreadsheet->createSheet();
                    $companyNameParts = explode(' ', $compListing->name);
                    $companyNameFirstWord = implode(' ', array_slice($companyNameParts, 0, 2));
                    $companyNameFirstWord = str_replace(',', '', $companyNameFirstWord);
                    $sheet2->setTitle($companyNameFirstWord . ' Listing');

                    $this->column = 'A';
                    foreach ($this->dynamicHeaders as $header) {
                        $sheet2->setCellValue($this->column . '1', $header);
                        $sheet2->getColumnDimension($this->column)
                            ->setAutoSize(true);
                        $this->cellBold($sheet2, $this->column . '1');
                        $this->column++;
                    }

                    $this->column = 'A';
                    $users = DB::table('users')
                        ->select(['id', 'first_name', 'last_name'])
                        ->where('company_id', $compListing->id)
                        ->where('user_type_id', UserType::LOAN_OFFICER->id())
                        ->get();
                    
                    $userIds = $users->map(function ($user) {
                        return $user->id;
                    });

                    foreach ($this->dynamicHeaders as $header) {
                        if ($header === 'Company') {
                            $this->lastRow = $sheet2->getHighestRow() + 1;
                            $sheet2->setCellValue($this->column . $this->lastRow, $compListing->name);
                        } 
                        
                        if ($header === 'Loan Officer') {
                            if (count($users) > 0) {
                                $this->lastRow = $sheet2->getHighestRow();
                                foreach ($users as $key => $user) {
                                    $sheet2->setCellValue($this->column . $this->lastRow, $user->first_name . ' ' . $user->last_name);
                                    $this->lastRow++;
                                }
                            } else {
                                $this->lastRow = $sheet2->getHighestRow();
                                $sheet2->setCellValue($this->column . $this->lastRow, '--');
                            }
                        }

                        if ($header === 'January') {
                            $this->helperFunctionForListings($sheet2, $userIds, $year, 1);
                        }
                        if ($header === 'February') {
                            $this->helperFunctionForListings($sheet2, $userIds, $year, 2);
                        }
                        if ($header === 'March') {
                            $this->helperFunctionForListings($sheet2, $userIds, $year, 3);
                        }
                        if ($header === 'April') {
                            $this->helperFunctionForListings($sheet2, $userIds, $year, 4);
                        }
                        if ($header === 'May') {
                            $this->helperFunctionForListings($sheet2, $userIds, $year, 5);
                        }

                        if ($header === 'June') {
                            $this->helperFunctionForListings($sheet2, $userIds, $year, 6);
                        }

                        if ($header === 'July') {
                            $this->helperFunctionForListings($sheet2, $userIds, $year, 7);
                        }

                        if ($header === 'August') {
                            $this->helperFunctionForListings($sheet2, $userIds, $year, 8);
                        }

                        if ($header === 'September') {
                            $this->helperFunctionForListings($sheet2, $userIds, $year, 9);
                        }

                        if ($header === 'October') {
                            $this->helperFunctionForListings($sheet2, $userIds, $year, 10);
                        }

                        if ($header === 'November') {
                            $this->helperFunctionForListings($sheet2, $userIds, $year, 11);
                        }

                        if ($header === 'December') {
                            $this->helperFunctionForListings($sheet2, $userIds, $year, 12);
                        }

                        $this->column++;
                    }

                    $this->column = 'A';
                    $totalRowListing = $sheet2->getHighestRow() + 1;
                    $totalsListing = null;
                    foreach ($this->dynamicHeaders as $header) {
                        if ($header === 'Company') {
                            $sheet2->setCellValue($this->column .  $totalRowListing,  'Total');
                            $this->cellBold($sheet2, $this->column . $totalRowListing);
                        }
                        if ($header === 'Loan Officer') {
                            if (count($users) > 0) {
                                $sheet2->setCellValue($this->column .  $totalRowListing, count($users));
                                $this->cellBold($sheet2, $this->column .  $totalRowListing);
                            } else {
                                $sheet2->setCellValue($this->column .  $totalRowListing, 0);
                                $this->cellBold($sheet2, $this->column .  $totalRowListing);
                            }
                        }
                        if ($header === 'January') {
                            $totalsListing =  $this->helperFunctionListingsTotals($userIds, $year, 1);
                            $sheet2->setCellValue($this->column .  $totalRowListing, $totalsListing);
                            $this->cellBold($sheet2, $this->column .  $totalRowListing);
                        }
                        if ($header === 'February') {
                            $totalsListing =  $this->helperFunctionListingsTotals($userIds, $year, 2);
                            $sheet2->setCellValue($this->column . $totalRowListing,  $totalsListing);
                            $this->cellBold($sheet2, $this->column . $totalRowListing);
                        }
                        if ($header === 'March') {
                            $totalsListing = $this->helperFunctionListingsTotals($userIds, $year, 3);
                            $sheet2->setCellValue($this->column . $totalRowListing, $totalsListing);
                            $this->cellBold($sheet2, $this->column . $totalRowListing);
                        }
                        if ($header === 'April') {
                            $totalsListing =  $this->helperFunctionListingsTotals($userIds, $year, 4);
                            $sheet2->setCellValue($this->column . $totalRowListing, $totalsListing);
                            $this->cellBold($sheet2, $this->column . $totalRowListing);
                        }
                        if ($header === 'May') {
                            $totalsListing =  $this->helperFunctionListingsTotals($userIds, $year, 5);
                            $sheet2->setCellValue($this->column . $totalRowListing, $totalsListing);
                            $this->cellBold($sheet2, $this->column . $totalRowListing);
                        }

                        if ($header === 'June') {
                            $totalsListing = $this->helperFunctionListingsTotals($userIds, $year, 6);
                            $sheet2->setCellValue($this->column . $totalRowListing, $totalsListing);
                            $this->cellBold($sheet2, $this->column . $totalRowListing);
                        }

                        if ($header === 'July') {
                            $totalsListing =  $this->helperFunctionListingsTotals($userIds, $year, 7);
                            $sheet2->setCellValue($this->column . $totalRowListing, $totalsListing);
                            $this->cellBold($sheet2, $this->column . $totalRowListing);
                        }

                        if ($header === 'August') {
                            $totalsListing =  $this->helperFunctionListingsTotals($userIds, $year, 8);
                            $sheet2->setCellValue($this->column . $totalRowListing, $totalsListing);
                            $this->cellBold($sheet2, $this->column . $totalRowListing);
                        }

                        if ($header === 'September') {
                            $totalsListing = $this->helperFunctionListingsTotals($userIds, $year, 9);
                            $sheet2->setCellValue($this->column . $totalRowListing, $totalsListing);
                            $this->cellBold($sheet2, $this->column . $totalRowListing);
                        }

                        if ($header === 'October') {
                            $totalsListing =  $this->helperFunctionListingsTotals($userIds, $year, 10);
                            $sheet2->setCellValue($this->column . $totalRowListing, $totalsListing);
                            $this->cellBold($sheet2, $this->column . $totalRowListing);
                        }

                        if ($header === 'November') {
                            $totalsListing = $this->helperFunctionListingsTotals($userIds, $year, 11);
                            $sheet2->setCellValue($this->column . $totalRowListing, $totalsListing);
                            $this->cellBold($sheet2, $this->column . $totalRowListing);
                        }

                        if ($header === 'December') {
                            $totalsListing =  $this->helperFunctionListingsTotals($userIds, $year, 12);
                            $sheet2->setCellValue($this->column . $totalRowListing, $totalsListing);
                            $this->cellBold($sheet2, $this->column . $totalRowListing);
                        }


                        $this->column++;
                    }
                }

                /**
                 *Dynamic sheet for company Flyers
                */
                foreach ($companies as $compFlyers) {
                    $sheet3 = $spreadsheet->createSheet();
                    $flyersNameParts = explode(' ', $compFlyers->name);
                    $flyerFirstWord = implode(' ', array_slice($flyersNameParts, 0, 2));
                    $flyerFirstWord = str_replace(',', '', $flyerFirstWord);
                    $sheet3->setTitle($flyerFirstWord. ' Flyers');

                    $this->column = 'A';
                    foreach ($this->dynamicHeaders as $header) {
                        $sheet3->setCellValue($this->column . '1', $header);
                        $sheet3->getColumnDimension($this->column)
                            ->setAutoSize(true);
                        $this->cellBold($sheet3, $this->column . '1');
                        $this->column++;
                    }

                    $this->column = 'A';
                    $users = DB::table('users')
                        ->select(['id', 'first_name', 'last_name'])
                        ->where('company_id', $compFlyers->id)
                        ->where('user_type_id', UserType::LOAN_OFFICER->id())
                        ->get();
                    
                    $userIds = $users->map(function ($user) {
                        return $user->id;
                    });

                    foreach ($this->dynamicHeaders as $header) {
                        if ($header === 'Company') {
                            $this->lastRow = $sheet3->getHighestRow() + 1;
                            $sheet3->setCellValue($this->column . $this->lastRow, $compFlyers->name);
                        }

                        if ($header === 'Loan Officer') {
                            if (count($users) > 0) {
                                $this->lastRow =  $sheet3->getHighestRow();
                                foreach ($users as $key => $user) {
                                    $sheet3->setCellValue($this->column . $this->lastRow, $user->first_name . ' ' . $user->last_name);
                                    $this->lastRow++;
                                }
                            } else {
                                $this->lastRow =  $sheet3->getHighestRow();
                                $sheet3->setCellValue($this->column . $this->lastRow, '--');
                            }
                        }

                        if ($header === 'January') {
                            $this->helperFunctionForFlyers($sheet3, $userIds, $year, 1);
                        }
                        if ($header === 'February') {
                            $this->helperFunctionForFlyers($sheet3, $userIds, $year, 2);
                        }
                        if ($header === 'March') {
                            $this->helperFunctionForFlyers($sheet3, $userIds, $year, 3);
                        }
                        if ($header === 'April') {
                            $this->helperFunctionForFlyers($sheet3, $userIds, $year, 4);
                        }
                        if ($header === 'May') {
                            $this->helperFunctionForFlyers($sheet3, $userIds, $year, 5);
                        }
                        if ($header === 'June') {
                            $this->helperFunctionForFlyers($sheet3, $userIds, $year, 6);
                        }
                        if ($header === 'July') {
                            $this->helperFunctionForFlyers($sheet3, $userIds, $year, 7);
                        }
                        if ($header === 'August') {
                            $this->helperFunctionForFlyers($sheet3, $userIds, $year, 8);
                        }
                        if ($header === 'September') {
                            $this->helperFunctionForFlyers($sheet3, $userIds, $year, 9);
                        }
                        if ($header === 'October') {
                            $this->helperFunctionForFlyers($sheet3, $userIds, $year, 10);
                        }
                        if ($header === 'November') {
                            $this->helperFunctionForFlyers($sheet3, $userIds, $year, 11);
                        }
                        if ($header === 'December') {
                            $this->helperFunctionForFlyers($sheet3, $userIds, $year, 12);
                        }

                        $this->column++;
                    }

                    $this->column = 'A';
                    $totalRowFlyers =   $sheet3->getHighestRow() + 1;
                    $totalFlyers = null;
                    foreach ($this->dynamicHeaders as $header) {
                        if ($header === 'Company') {
                            $sheet3->setCellValue($this->column .  $totalRowFlyers,  'Total');
                            $this->cellBold($sheet3, $this->column .  $totalRowFlyers);
                        }

                        if ($header === 'Loan Officer') {
                            if (count($users) > 0) {
                                $sheet3->setCellValue($this->column .   $totalRowFlyers, count($users));
                                $this->cellBold($sheet3, $this->column .   $totalRowFlyers);
                            } else {
                                $sheet3->setCellValue($this->column .   $totalRowFlyers, 0);
                                $this->cellBold($sheet3, $this->column .   $totalRowFlyers);
                            }
                        }

                        if ($header === 'January') {
                            $totalFlyers =  $this->helperFunctionFlyersTotals($userIds, $year, 1);
                            $sheet3->setCellValue($this->column .   $totalRowFlyers, $totalFlyers);
                            $this->cellBold($sheet3, $this->column .   $totalRowFlyers);
                        }
                        if ($header === 'February') {
                            $totalFlyers =  $this->helperFunctionFlyersTotals($userIds, $year, 2);
                            $sheet3->setCellValue($this->column .  $totalRowFlyers,  $totalFlyers);
                            $this->cellBold($sheet3, $this->column .  $totalRowFlyers);
                        }
                        if ($header === 'March') {
                            $totalFlyers = $this->helperFunctionFlyersTotals($userIds, $year, 3);
                            $sheet3->setCellValue($this->column .  $totalRowFlyers, $totalFlyers);
                            $this->cellBold($sheet3, $this->column .  $totalRowFlyers);
                        }
                        if ($header === 'April') {
                            $totalFlyers =  $this->helperFunctionFlyersTotals($userIds, $year, 4);
                            $sheet3->setCellValue($this->column .  $totalRowFlyers, $totalFlyers);
                            $this->cellBold($sheet3, $this->column .  $totalRowFlyers);
                        }
                        if ($header === 'May') {
                            $totalFlyers =  $this->helperFunctionFlyersTotals($userIds, $year, 5);
                            $sheet3->setCellValue($this->column .  $totalRowFlyers, $totalFlyers);
                            $this->cellBold($sheet3, $this->column .  $totalRowFlyers);
                        }

                        if ($header === 'June') {
                            $totalFlyers = $this->helperFunctionFlyersTotals($userIds, $year, 6);
                            $sheet3->setCellValue($this->column .  $totalRowFlyers, $totalFlyers);
                            $this->cellBold($sheet3, $this->column .  $totalRowFlyers);
                        }

                        if ($header === 'July') {
                            $totalFlyers =  $this->helperFunctionFlyersTotals($userIds, $year, 7);
                            $sheet3->setCellValue($this->column .  $totalRowFlyers, $totalFlyers);
                            $this->cellBold($sheet3, $this->column .  $totalRowFlyers);
                        }

                        if ($header === 'August') {
                            $totalFlyers =  $this->helperFunctionFlyersTotals($userIds, $year, 8);
                            $sheet3->setCellValue($this->column .  $totalRowFlyers, $totalFlyers);
                            $this->cellBold($sheet3, $this->column .  $totalRowFlyers);
                        }

                        if ($header === 'September') {
                            $totalFlyers = $this->helperFunctionFlyersTotals($userIds, $year, 9);
                            $sheet3->setCellValue($this->column .  $totalRowFlyers, $totalFlyers);
                            $this->cellBold($sheet3, $this->column .  $totalRowFlyers);
                        }

                        if ($header === 'October') {
                            $totalFlyers =  $this->helperFunctionFlyersTotals($userIds, $year, 10);
                            $sheet3->setCellValue($this->column . $totalRowFlyers, $totalFlyers);
                            $this->cellBold($sheet3, $this->column .  $totalRowFlyers);
                        }

                        if ($header === 'November') {
                            $totalFlyers = $this->helperFunctionFlyersTotals($userIds, $year, 11);
                            $sheet3->setCellValue($this->column .  $totalRowFlyers, $totalFlyers);
                            $this->cellBold($sheet3, $this->column .  $totalRowFlyers);
                        }

                        if ($header === 'December') {
                            $totalFlyers =  $this->helperFunctionFlyersTotals($userIds, $year, 12);
                            $sheet3->setCellValue($this->column .  $totalRowFlyers, $totalFlyers);
                            $this->cellBold($sheet3, $this->column .  $totalRowFlyers);
                        }

                        $this->column++;
                    }
                }

                /**
                 * Dynamic sheet for company Logins
                 */
                foreach ($companies as $compLogins) {
                    $sheet4 = $spreadsheet->createSheet();
                    $compLoginsNameParts = explode(' ', $compLogins->name);
                    $companyFirstWord = implode(' ', array_slice($compLoginsNameParts, 0, 2));
                    $companyFirstWord = str_replace(',', '', $companyFirstWord);
                    $sheet4->setTitle($companyFirstWord . ' Logins');

                    $this->column = 'A';
                    foreach ($this->dynamicHeaders as $header) {
                        $sheet4->setCellValue($this->column . '1', $header);
                        $sheet4->getColumnDimension($this->column)
                            ->setAutoSize(true);
                        $this->cellBold($sheet4, $this->column . '1');
                        $this->column++;
                    }

                    $this->column = 'A';
                    $users = DB::table('users')
                        ->select(['id', 'first_name', 'last_name'])
                        ->where('company_id', $compLogins->id)
                        ->where('user_type_id', UserType::LOAN_OFFICER->id())
                        ->get();

                    $userIds = $users->map(function ($user) {
                        return $user->id;
                    });
                    
                    foreach ($this->dynamicHeaders as $header) {
                        if ($header === 'Company') {
                            $this->lastRow = $sheet4->getHighestRow() + 1;
                            $sheet4->setCellValue($this->column . $this->lastRow, $compLogins->name);
                        }

                        if ($header === 'Loan Officer') {
                            if (count($users) > 0) {
                                $this->lastRow =  $sheet4->getHighestRow();
                                foreach ($users as $key => $user) {
                                    $sheet4->setCellValue($this->column . $this->lastRow, $user->first_name . ' ' . $user->last_name);
                                    $this->lastRow++;
                                }
                            } else {
                                $this->lastRow =  $sheet4->getHighestRow();
                                $sheet4->setCellValue($this->column . $this->lastRow, '--');
                            }
                        }

                        if ($header === 'January') {
                            $this->helperFunctionForLogins($sheet4, $userIds, $year, 1);
                        }
                        if ($header === 'February') {
                            $this->helperFunctionForLogins($sheet4, $userIds, $year, 2);
                        }
                        if ($header === 'March') {
                            $this->helperFunctionForLogins($sheet4, $userIds, $year, 3);
                        }
                        if ($header === 'April') {
                            $this->helperFunctionForLogins($sheet4, $userIds, $year, 4);
                        }
                        if ($header === 'May') {
                            $this->helperFunctionForLogins($sheet4, $userIds, $year, 5);
                        }
                        if ($header === 'June') {
                            $this->helperFunctionForLogins($sheet4, $userIds, $year, 6);
                        }
                        if ($header === 'July') {
                            $this->helperFunctionForLogins($sheet4, $userIds, $year, 7);
                        }
                        if ($header === 'August') {
                            $this->helperFunctionForLogins($sheet4, $userIds, $year, 8);
                        }
                        if ($header === 'September') {
                            $this->helperFunctionForLogins($sheet4, $userIds, $year, 9);
                        }
                        if ($header === 'October') {
                            $this->helperFunctionForLogins($sheet4, $userIds, $year, 10);
                        }
                        if ($header === 'November') {
                            $this->helperFunctionForLogins($sheet4, $userIds, $year, 11);
                        }
                        if ($header === 'December') {
                            $this->helperFunctionForLogins($sheet4, $userIds, $year, 12);
                        }

                        $this->column++;
                    }

                    $this->column = 'A';
                    $totalRowLgins =   $sheet4->getHighestRow() + 1;
                    $totalLogins = null;
                    foreach ($this->dynamicHeaders as $header) {
                        if ($header === 'Company') {
                            $sheet4->setCellValue($this->column .  $totalRowLgins,  'Total');
                            $this->cellBold($sheet4, $this->column . $totalRowLgins);
                        }

                        if ($header === 'Loan Officer') {
                            if (count($users) > 0) {
                                $sheet4->setCellValue($this->column .   $totalRowLgins, count($users));
                                $this->cellBold($sheet4, $this->column .   $totalRowLgins);
                            } else {
                                $sheet4->setCellValue($this->column .   $totalRowLgins, 0);
                                $this->cellBold($sheet4, $this->column .   $totalRowLgins);
                            }
                        }

                        if ($header === 'January') {
                            $totalLogins =  $this->helperFunctionLoginsTotals($userIds, $year, 1);
                            $sheet4->setCellValue($this->column .   $totalRowLgins, $totalLogins);
                            $this->cellBold($sheet4, $this->column .   $totalRowLgins);
                        }
                        if ($header === 'February') {
                            $totalLogins =  $this->helperFunctionLoginsTotals($userIds, $year, 2);
                            $sheet4->setCellValue($this->column .  $totalRowLgins,  $totalLogins);
                            $this->cellBold($sheet4, $this->column .  $totalRowLgins);
                        }
                        if ($header === 'March') {
                            $totalLogins = $this->helperFunctionLoginsTotals($userIds, $year, 3);
                            $sheet4->setCellValue($this->column .  $totalRowLgins, $totalLogins);
                            $this->cellBold($sheet4, $this->column .  $totalRowLgins);
                        }
                        if ($header === 'April') {
                            $totalLogins =  $this->helperFunctionLoginsTotals($userIds, $year, 4);
                            $sheet4->setCellValue($this->column .  $totalRowLgins, $totalLogins);
                            $this->cellBold($sheet4, $this->column .  $totalRowLgins);
                        }
                        if ($header === 'May') {
                            $totalLogins =  $this->helperFunctionLoginsTotals($userIds, $year, 5);
                            $sheet4->setCellValue($this->column .  $totalRowLgins, $totalLogins);
                            $this->cellBold($sheet4, $this->column .  $totalRowLgins);
                        }

                        if ($header === 'June') {
                            $totalLogins = $this->helperFunctionLoginsTotals($userIds, $year, 6);
                            $sheet4->setCellValue($this->column .  $totalRowLgins, $totalLogins);
                            $this->cellBold($sheet4, $this->column .  $totalRowLgins);
                        }

                        if ($header === 'July') {
                            $totalLogins =  $this->helperFunctionLoginsTotals($userIds, $year, 7);
                            $sheet4->setCellValue($this->column .  $totalRowLgins, $totalLogins);
                            $this->cellBold($sheet4, $this->column .  $totalRowLgins);
                        }

                        if ($header === 'August') {
                            $totalLogins =  $this->helperFunctionLoginsTotals($userIds, $year, 8);
                            $sheet4->setCellValue($this->column .  $totalRowLgins, $totalLogins);
                            $this->cellBold($sheet4, $this->column .  $totalRowLgins);
                        }

                        if ($header === 'September') {
                            $totalLogins = $this->helperFunctionLoginsTotals($userIds, $year, 9);
                            $sheet4->setCellValue($this->column .  $totalRowLgins, $totalLogins);
                            $this->cellBold($sheet4, $this->column .  $totalRowLgins);
                        }

                        if ($header === 'October') {
                            $totalLogins =  $this->helperFunctionLoginsTotals($userIds, $year, 10);
                            $sheet4->setCellValue($this->column . $totalRowLgins, $totalLogins);
                            $this->cellBold($sheet4, $this->column .  $totalRowLgins);
                        }

                        if ($header === 'November') {
                            $totalLogins = $this->helperFunctionLoginsTotals($userIds, $year, 11);
                            $sheet4->setCellValue($this->column .  $totalRowLgins, $totalLogins);
                            $this->cellBold($sheet4, $this->column .  $totalRowLgins);
                        }

                        if ($header === 'December') {
                            $totalLogins =  $this->helperFunctionLoginsTotals($userIds, $year, 12);
                            $sheet4->setCellValue($this->column .  $totalRowLgins, $totalLogins);
                            $this->cellBold($sheet4, $this->column .  $totalRowLgins);
                        }

                        $this->column++;
                    }
                }
            }

            $spreadsheet->setActiveSheetIndex(0);
            $writer = new Xlsx($spreadsheet);
            $writer->save(Storage::disk('public')->path('report.xlsx'));

            // $zipFilePath =  Storage::disk('public')->path('report.zip');
            $spreadsheetPath = Storage::disk('public')->path('report.xlsx');

            return $spreadsheetPath;

            // if ($zipArchive->open($zipFilePath, ZipArchive::CREATE | ZipArchive::OVERWRITE) === true) {
            //     $zipArchive->addFile($spreadsheetPath, 'report.xlsx');
            //     $zipArchive->close();
            //     unlink($spreadsheetPath);
            //     return $zipFilePath;
            // }
        } catch (Exception $e) {
            echo "Error: " . $e->getMessage();
        }
    }

    private function helperFunctionForAllCompaniesSummary($valueBinder, $year, $monthName, $sheet, $month, $sheetTittle, $company)
    {
        if ($sheetTittle === "All Companies Summary") {
            $this->column = 'A';
            array_shift($this->headersForAllCompaniesSummary);
            array_unshift($this->headersForAllCompaniesSummary, $monthName . ' ' . $year);
            $totalRow = null;

            foreach ($this->headersForAllCompaniesSummary as $header) {
                $sheet->setCellValue($this->column . $valueBinder, $header);
                $sheet->getColumnDimension($this->column)
                    ->setAutoSize(true);
                $this->cellBold($sheet, $this->column .  $valueBinder);
                $this->column++;
            }

            if (count($company) > 0) {
                foreach ($company as $companySummaryData) {
                    $this->lastRow = $sheet->getHighestRow() + 1;
                    $this->cellValue($sheet, $this->headersForAllCompaniesSummary, $companySummaryData, $this->lastRow,  $year, $month, $sheetTittle);
                }
                $this->column = 'A';
                $totalRow = $sheet->getHighestRow() + 1;
                $result = null;
                foreach ($this->headersForAllCompaniesSummary as $header) {

                    if ($header === 'Company') {
                        $sheet->setCellValue('A' . $totalRow, 'Total');
                        $this->cellBold($sheet, 'A' . $totalRow);
                    } else if ($header === 'Total LO in co (HS)') {
                        $result =   $this->allCompaniesSummaryTotal($company, $year, $month, 'totalLoanOfficerHubspot');
                        $sheet->setCellValue($this->column . $totalRow, $result);
                        $this->cellBold($sheet, $this->column . $totalRow);
                    } else if ($header === 'Total LO users') {
                        $result =   $this->allCompaniesSummaryTotal($company, $year, $month, 'totalLoanOfficerUser');
                        $sheet->setCellValue($this->column . $totalRow, $result);
                        $this->cellBold($sheet, $this->column . $totalRow);
                    } else if ($header === 'Total Listings') {
                        $result =   $this->allCompaniesSummaryTotal($company, $year, $month, 'totalListing');
                        $sheet->setCellValue($this->column . $totalRow, $result);
                        $this->cellBold($sheet, $this->column . $totalRow);
                    } else if ($header === 'Total Flyers') {
                        $result =   $this->allCompaniesSummaryTotal($company, $year, $month, 'totalFlyers');
                        $sheet->setCellValue($this->column . $totalRow, $result);
                        $this->cellBold($sheet, $this->column . $totalRow);
                    } else if ($header === 'Total Logins') {
                        $result =   $this->allCompaniesSummaryTotal($company, $year, $month, 'totalLogins');
                        $sheet->setCellValue($this->column . $totalRow, $result);
                        $this->cellBold($sheet, $this->column . $totalRow);
                    }
                    $this->column++;
                }
            } else {
                $this->lastRow = $sheet->getHighestRow() + 1;
                $this->cellValueIfEmpty($sheet, $this->lastRow, count($this->headersForAllCompaniesSummary) - 1, 0);
                $this->column = 'A';
                $totalRow = $sheet->getHighestRow() + 1;
                foreach ($this->headersForAllCompaniesSummary as $header) {
                    if ($header === 'Company') {
                        $sheet->setCellValue('A' . $totalRow, 'Total');
                    } else if ($header === 'Total LO in co (HS)') {
                        $sheet->setCellValue($this->column . $totalRow, 0);
                        $this->cellBold($sheet, $this->column . $totalRow);
                    } else if ($header === 'Total LO users') {
                        $sheet->setCellValue($this->column . $totalRow, 0);
                        $this->cellBold($sheet, $this->column . $totalRow);
                    } else if ($header === 'Total Listings') {
                        $sheet->setCellValue($this->column . $totalRow, 0);
                        $this->cellBold($sheet, $this->column . $totalRow);
                    } else if ($header === 'Total Flyers') {
                        $sheet->setCellValue($this->column . $totalRow, 0);
                        $this->cellBold($sheet, $this->column . $totalRow);
                    } else if ($header === 'Total Logins') {
                        $sheet->setCellValue($this->column . $totalRow, 0);
                        $this->cellBold($sheet, $this->column . $totalRow);
                    }
                    $this->column++;
                }
            }
        }

        if ($sheetTittle === "Companies Created Per Month") {
            $this->column = 'A';
            array_shift($this->headersForAllCompaniesSummary);
            array_unshift($this->headersForAllCompaniesSummary, $monthName . ' ' . $year);
            $output =  array_slice($this->headersForAllCompaniesSummary, 0, 2);
            $this->headersForAllCompaniesSummary = $output;


            $totalRow = null;
            foreach ($this->headersForAllCompaniesSummary as $header) {
                $sheet->setCellValue($this->column . $valueBinder, $header);
                $sheet->getColumnDimension($this->column)
                    ->setAutoSize(true);
                $this->cellBold($sheet, $this->column .  $valueBinder);
                $this->column++;
            }

            $startDate = $this->createStartOfMonthDate($year, $month);
            $endDate = $this->createEndOfMonthDate($year, $month);
            
            $company = DB::table('companies')
                ->select(['id', 'name'])
                ->whereBetween('created_at', [$startDate, $endDate])
                ->where('id', '!=', 1)
                ->whereNull('deleted_at')
                ->get();

            if (count($company) > 0) {
                foreach ($company as $data) {
                    $this->lastRow = $sheet->getHighestRow() + 1;
                    $this->cellValue($sheet, $this->headersForAllCompaniesSummary, $data, $this->lastRow,  $year, $month, $sheetTittle);
                }

                $this->column = 'A';
                $totalRow = $sheet->getHighestRow() + 1;
                $result = null;
                foreach ($this->headersForAllCompaniesSummary as $header) {
                    if ($header === 'Company') {
                        $sheet->setCellValue('A' . $totalRow, 'Total');
                        $this->cellBold($sheet, 'A' . $totalRow);
                        $sheet->setCellValue($this->column . $totalRow, count($company));
                        $this->cellBold($sheet, $this->column . $totalRow);
                    }

                    $this->column++;
                }
            } else {
                $this->lastRow = $sheet->getHighestRow() + 1;

                $this->cellValueIfEmpty($sheet, $this->lastRow, count($this->headersForAllCompaniesSummary) - 1, '--');
                $this->column = 'A';
                $totalRow = $sheet->getHighestRow() + 1;
                foreach ($this->headersForAllCompaniesSummary as $header) {
                    if ($header === 'Company') {
                        $sheet->setCellValue('A' . $totalRow, 'Total');
                        $this->cellBold($sheet, 'A' . $totalRow);
                        $sheet->setCellValue('B' . $totalRow, 0);
                        $this->cellBold($sheet, 'B' . $totalRow);
                    }
                    $this->column++;
                }
            }
        }
    }


    private function cellValueIfEmpty($sheet, $row, $headerLength, $value)
    {
        $column = 'B';
        for ($i = 0; $i < $headerLength; $i++) {
            $sheet->setCellValue($column . $row, $value);
            $column++;
        }
    }

    private function getTotalHubspotUsersCount($companyId, $startDate, $endDate)
    {
        $usersCount = DB::table('users')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->where('company_id', $companyId)
            ->where('user_type_id', UserType::LOAN_OFFICER->id())
            ->where(function (Builder $query) {
                $query->where('user_status', UserStatus::ACTIVE)
                    ->orWhere('user_status', UserStatus::ACTIVE_TRIAL);
            })
            ->whereNull('deleted_at')
            ->count();

        return $usersCount;
    }

    private function getTotalUsersCount($companyId, $startDate, $endDate) {
        $usersCount = DB::table('users')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->where('company_id', $companyId)
            ->where('user_type_id', UserType::LOAN_OFFICER->id())
            ->where(function (Builder $query) {
                $query->where('user_status', UserStatus::ACTIVE)
                    ->orWhere('user_status', UserStatus::ACTIVE_TRIAL);
            })
            ->whereNull('deleted_at')
            ->count();

        return $usersCount;
    }

    private function getTotalListingsCount($companyId, $startDate, $endDate) {
        $totalListings = DB::table('listings')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->where('company_id', $companyId)
            ->whereNull('deleted_at')
            ->count();

        return $totalListings;
    }

    private function getTotalFlyersCount($companyId, $startDate, $endDate) {
        $totalFlyers = DB::table('generated_flyers')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->where('company_id', $companyId)
            ->whereNull('deleted_at')
            ->count();

        return $totalFlyers;
    }

    private function getTotalLoginsCount($companyId, $startDate, $endDate) {
        $totalLogins = DB::table('login_logs')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->where('company_id', $companyId)
            ->count();

        return $totalLogins;
    }

    private function cellValue($sheet, $headers, $company, $row, $year, $month, $sheetTittle)
    {
        $startDate = $this->createStartOfMonthDate($year, $month);
        $endDate = $this->createEndOfMonthDate($year, $month);

        $this->column = 'A';
        foreach ($headers as $header) {
            if ($sheetTittle === 'All Companies Summary') {
                if ($header === 'Company') {
                    $sheet->setCellValue($this->column . $row, $company->name);
                } else if ($header === 'Total LO in co (HS)') {
                    $totalLOinCO = $this->getTotalHubspotUsersCount($company->id, $startDate, $endDate);
                    $sheet->setCellValue($this->column . $row, $totalLOinCO);
                } else if ($header === 'Total LO users') {
                    $totalLOusers = $this->getTotalUsersCount($company->id, $startDate, $endDate);
                    $sheet->setCellValue($this->column . $row, $totalLOusers);
                } else if ($header === 'Total Listings') {
                    $totalListings = $this->getTotalListingsCount($company->id, $startDate, $endDate);
                    $sheet->setCellValue($this->column . $row, $totalListings);
                } else if ($header === 'Total Flyers') {
                    $totalFlyers = $this->getTotalFlyersCount($company->id, $startDate, $endDate);
                    $sheet->setCellValue($this->column . $row, $totalFlyers);
                } else if ($header === 'Total Logins') {
                    $totalLogins = $this->getTotalLoginsCount($company->id, $startDate, $endDate);
                    $sheet->setCellValue($this->column . $row, $totalLogins);
                }
            }

            if ($sheetTittle === 'Companies Created Per Month') {
                if ($header === 'Company') {
                    $sheet->setCellValue($this->column . $row, $company->name);
                }
            }
            $this->column++;
        }
    }

    private function cellBold($sheet, $column)
    {
        $sheet->getStyle($column)->getFont()->setBold(true);
    }

    private function createStartOfMonthDate($year, $monthNum) {
        return Carbon::create($year, $monthNum, 1)->startOfMonth();
    }

    private function createEndOfMonthDate($year, $monthNum) {
        return Carbon::create($year, $monthNum, 1)->endOfMonth();
    }

    private function helperFunctionForListings($sheet2, $userIds, $year, $monthNum)
    {
        $row = 2;
        
        if (count($userIds) > 0) {
            $startDate = $this->createStartOfMonthDate($year, $monthNum);
            $endDate = $this->createEndOfMonthDate($year, $monthNum);
            $listingsUserIds = DB::table('listings')
                ->select(['user_id'])
                ->whereIn('user_id', $userIds->toArray())
                ->whereBetween('created_at', [$startDate, $endDate])
                ->whereNull('deleted_at')
                ->get();

            foreach ($userIds->toArray() as $userId) {
                $listingCount = Arr::where($listingsUserIds->toArray(), function ($listingUserId) use ($userId) {
                    return $listingUserId->user_id === $userId;
                });

                if (count($listingCount) > 0) {
                    $this->lastRow = $sheet2->getHighestRow();
                    $sheet2->setCellValue($this->column . $row, count($listingCount));
                } else {
                    $sheet2->setCellValue($this->column . $row, 0);
                }
                $row++;
            }
        } else {
            $this->lastRow = $sheet2->getHighestRow();
            $sheet2->setCellValue($this->column . $row, 0);
        }
    }

    private function helperFunctionListingsTotals($userIds, $year, $monthNum)
    {
        $startDate = $this->createStartOfMonthDate($year, $monthNum);
        $endDate = $this->createEndOfMonthDate($year, $monthNum);

        $totalListingCount = DB::table('listings')
            ->whereIn('user_id', $userIds->toArray())
            ->whereBetween('created_at', [$startDate, $endDate])
            ->whereNull('deleted_at')
            ->count();
        
        return $totalListingCount;
    }

    private function helperFunctionForLogins($sheet4, $userIds, $year, $monthNum)
    {
        $row = 2;
        
        if (count($userIds) > 0) {
            $startDate = $this->createStartOfMonthDate($year, $monthNum);
            $endDate = $this->createEndOfMonthDate($year, $monthNum);
    
            $loginUserIds = DB::table('login_logs')
                ->select(['user_id'])
                ->whereIn('user_id', $userIds->toArray())
                ->whereBetween('created_at', [$startDate, $endDate])
                ->get();

            foreach ($userIds->toArray() as  $userId) {
                $loginCount = Arr::where($loginUserIds->toArray(), function ($loginUserId) use ($userId) {
                    return $loginUserId->user_id === $userId;
                });

                if (count($loginCount) > 0) {
                    $this->lastRow = $sheet4->getHighestRow();
                    $sheet4->setCellValue($this->column .  $row, count($loginCount));
                } else {
                    $sheet4->setCellValue($this->column . $row, 0);
                }
                $row++;
            }
        } else {
            $this->lastRow = $sheet4->getHighestRow();
            $sheet4->setCellValue($this->column . $row, 0);
        }
    }

    private function helperFunctionLoginsTotals($userIds, $year, $monthNum)
    {
        $startDate = $this->createStartOfMonthDate($year, $monthNum);
        $endDate = $this->createEndOfMonthDate($year, $monthNum);

        $totalUsersLoginCount = DB::table('login_logs')
            ->whereIn('user_id', $userIds->toArray())
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();
        
        return $totalUsersLoginCount;
    }

    private function helperFunctionForFlyers($sheet3, $userIds, $year, $monthNum)
    {
        $row = 2;

        if (count($userIds) > 0) {
            $startDate = $this->createStartOfMonthDate($year, $monthNum);
            $endDate = $this->createEndOfMonthDate($year, $monthNum);
    
            $flyerUserIds = DB::table('generated_flyers')
                ->select(['user_id'])
                ->whereIn('user_id', $userIds->toArray())
                ->whereBetween('created_at', [$startDate, $endDate])
                ->whereNull('deleted_at')
                ->get();
            foreach ($userIds->toArray() as $userId) {
                $flyerCount = Arr::where($flyerUserIds->toArray(), function ($flyerUserId) use ($userId) {
                    return $flyerUserId->user_id === $userId;
                });

                if (count($flyerCount) > 0) {
                    $this->lastRow = $sheet3->getHighestRow();
                    $sheet3->setCellValue($this->column . $row, count($flyerCount));
                } else {
                    $sheet3->setCellValue($this->column . $row, 0);
                }
                $row++;
            }
        } else {
            $this->lastRow = $sheet3->getHighestRow();
            $sheet3->setCellValue($this->column . $row, 0);
        }
    }

    private function helperFunctionFlyersTotals($userIds, $year, $monthNum)
    {
        $startDate = $this->createStartOfMonthDate($year, $monthNum);
        $endDate = $this->createEndOfMonthDate($year, $monthNum);

        $flyersTotals = DB::table('generated_flyers')
            ->whereIn('user_id', $userIds->toArray())
            ->whereBetween('created_at', [$startDate, $endDate])
            ->whereNull('deleted_at')
            ->count();

        return $flyersTotals;
    }

    private function allCompaniesSummaryTotal($company, $year, $monthNum, $summary)
    {
        $startDate = $this->createStartOfMonthDate($year, $monthNum);
        $endDate = $this->createEndOfMonthDate($year, $monthNum);
        $totals = 0;

        foreach ($company as $comp) {
            if ($summary === 'totalLoanOfficerHubspot') {
                $totalLOinCO = $this->getTotalHubspotUsersCount($comp->id, $startDate, $endDate);
                $totals += $totalLOinCO;
            }

            if ($summary === 'totalLoanOfficerUser') {
                $overAllUser = $this->getTotalUsersCount($comp->id, $startDate, $endDate);
                $totals += $overAllUser;
            }

            if ($summary === 'totalListing') {
                $totalListing = $this->getTotalListingsCount($comp->id, $startDate, $endDate);
                $totals += $totalListing;
            }

            if ($summary === 'totalFlyers') {
                $totalFlyers = $this->getTotalFlyersCount($comp->id, $startDate, $endDate);
                $totals += $totalFlyers;
            }

            if ($summary === 'totalLogins') {
                $totalLogins = $this->getTotalLoginsCount($comp->id, $startDate, $endDate);
                $totals += $totalLogins;
            }
        }

        return $totals;
    }

    private function allCompaniesSummary($sheetTittle, $year, $sheet, $companies)
    {
        for ($month = 1; $month <= 12; $month++) {
            $monthName = Carbon::create($year, $month)->format('F');
            
            if ($monthName == 'January') {
                $this->helperFunctionForAllCompaniesSummary($sheet->getHighestRow(), $year, $monthName, $sheet, $month, $sheetTittle, $companies);
                continue;
            } else {
                $this->helperFunctionForAllCompaniesSummary($sheet->getHighestRow() + 3, $year, $monthName, $sheet, $month, $sheetTittle, $companies);
                continue;
            }
        }
    }
}
