<?php

use Illuminate\Support\Facades\Schedule;

Schedule::command('payments:process-recurring')->dailyAt('00:05');
