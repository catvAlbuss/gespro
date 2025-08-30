<?php

namespace App\Console\Commands;

use App\Models\actividadespersonal;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class UpdateElapsedTime extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:update-elapsed-time';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $updated = Actividadespersonal::where('status', 'doing')->update([
            'elapsed_time' => DB::raw('COALESCE(elapsed_time, 0) + 1')
        ]);

        $this->info("Se actualiz0 el elapsed_time de {$updated} actividades.");
    }
}
