<?php

namespace App\Jobs;

use App\Models\RecurringPayment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendRecurringPaymentReminder implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public RecurringPayment $payment) {}

    public function handle(): void
    {
        Log::info("Recurring payment reminder: {$this->payment->name} is due on {$this->payment->next_due_date->toDateString()} for user {$this->payment->user->email}");

        // Uncomment when mail is configured:
        // Mail::to($this->payment->user->email)->send(new RecurringPaymentReminderMail($this->payment));
    }
}
