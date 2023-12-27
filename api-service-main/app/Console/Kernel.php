<?php

namespace App\Console;

use App\Enums\Environment;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use Illuminate\Support\Facades\App;

class Kernel extends ConsoleKernel
{
    protected $commands = [
        \App\Console\Commands\GenerateReportCommand::class,
        \App\Console\Commands\UpdateUserStatusFromHubspot::class,
    ];
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // $schedule->command('inspire')->hourly();
        if (App::environment(Environment::PRODUCTION)) {
            $schedule->command('report:generate')
                    ->timezone('America/Los_Angeles')
                    ->weekly()
                    ->appendOutputTo('storage/logs/admin-report-cron.log');
        }
    
        if (App::environment([Environment::PRODUCTION, Environment::STAGING, Environment::DEVELOPMENT])) {
            $schedule->command('user_status:update')
                    ->timezone('America/Los_Angeles')
                    ->twiceDaily(3, 20)
                    ->appendOutputTo('storage/logs/update-user-status.log');
        }
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__ . '/Commands');

        require base_path('routes/console.php');
    }
}
