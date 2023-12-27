<?php

namespace App\Jobs;

use App\Facades\SendGridService;
use App\Mail\AdminReport;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class AdminReportJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $data;
    protected $report;

    /**
     * Create a new job instance.
     */
    public function __construct($data)
    {
        $this->data = $data;
        $this->report = new AdminReport();
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $adminReport = $this->report->__invoke($this->data);
        SendGridService::send($adminReport);
    }
}
