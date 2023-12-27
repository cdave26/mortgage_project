<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Str;
use Illuminate\Foundation\Bus\DispatchesJobs;
use App\Jobs\AdminReportJob;


use App\Helpers\AdminReport;

class GenerateReportCommand extends Command
{
    use DispatchesJobs;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'report:generate';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate the weekly report';

    /**
     * Execute the console command.
     */
    public function handle(): void
    {

        $adminReport = new AdminReport();
        $zipFilePath  = $adminReport->generateReport();

        $adminUser = User::where('user_type_id', 1)->get();

        foreach ($adminUser as $user) {
            $data = [
                'name' => $user->first_name,
                'email' => $user->email,
                'subject' => 'Uplist Admin Report',
                'body' => 'Please find the attached weekly report.',
                'attachment' => $zipFilePath,
            ];

            dispatch(new AdminReportJob($data));
        }

        $output = Str::swap([
            '{current_timestamp}' => \Carbon\Carbon::now(),
            '{env}' => config('app.env'),
        ], '[{current_timestamp}] - [{env}] - Weekly report generated successfully.');


        $this->info($output);
    }
}
