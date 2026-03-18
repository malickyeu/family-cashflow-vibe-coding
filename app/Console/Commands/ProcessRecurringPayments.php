<?php

namespace App\Console\Commands;

use App\Models\RecurringPayment;
use App\Models\Transaction;
use App\Jobs\SendRecurringPaymentReminder;
use Illuminate\Console\Command;

class ProcessRecurringPayments extends Command
{
    protected $signature   = 'payments:process-recurring';
    protected $description = 'Auto-generate transactions for due recurring payments and dispatch reminders';

    public function handle(): int
    {
        // Process payments that are due today or overdue
        $due = RecurringPayment::with('user')
            ->where('is_active', true)
            ->where('next_due_date', '<=', today())
            ->get();

        foreach ($due as $payment) {
            // Avoid duplicate auto-generated transactions for the same payment+date
            $exists = Transaction::where('recurring_payment_id', $payment->id)
                ->where('date', $payment->next_due_date)
                ->where('is_auto_generated', true)
                ->exists();

            if (! $exists) {
                Transaction::create([
                    'type'                 => 'expense',
                    'amount'               => $payment->amount,
                    'category_id'          => $payment->category_id,
                    'date'                 => $payment->next_due_date,
                    'description'          => "Auto: {$payment->name}",
                    'user_id'              => $payment->user_id,
                    'created_by'           => $payment->user_id,
                    'recurring_payment_id' => $payment->id,
                    'is_auto_generated'    => true,
                ]);

                $this->info("Processed: {$payment->name} ({$payment->next_due_date->toDateString()})");
            }

            // Advance next_due_date regardless (catches up even if payment was missed)
            $payment->advanceDueDate();
        }

        // Send reminders for payments upcoming within reminder_days_before days
        $upcoming = RecurringPayment::with('user')
            ->where('is_active', true)
            ->where('send_reminder', true)
            ->whereRaw("next_due_date <= CURRENT_DATE + (reminder_days_before * INTERVAL '1 day')")
            ->whereRaw('next_due_date > CURRENT_DATE')
            ->get();

        foreach ($upcoming as $payment) {
            SendRecurringPaymentReminder::dispatch($payment);
            $this->line("Reminder dispatched: {$payment->name}");
        }

        $this->info("Done. Processed {$due->count()} payments, dispatched {$upcoming->count()} reminders.");

        return Command::SUCCESS;
    }
}
