<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Artisan;
use App\Helpers\AdminReport;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Auth;

class AdminReportController extends Controller
{

    public function adminReport()
    {
        /**
         * Uncoment this code, for development purpose only
         * postman: http://localhost:8000/api/admin-report
         */

        // Artisan::call('report:generate');
        // Optional: Get the command output
        // $output = Artisan::output();
        // You can process the command output or return a response
        // return response()->json(['message' => 'Report generate started']);

        $userTypeId = Auth::user()->user_type_id;

        if ($userTypeId != 1) {
            return response()->json(['message' => 'You are not authorized to access this resource'], 403);
        }

        $adminReport = new AdminReport();
        $zipFilePath  = $adminReport->generateReport();

        $headers = [
            'Content-Type' => 'application/vnd.ms-excel',
            'Content-Disposition' => 'attachment; filename="report.xlsx"',
        ];

        return response()->file($zipFilePath, $headers);
    }
}
