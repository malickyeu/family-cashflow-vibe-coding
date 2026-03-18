<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recurring_payments', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->decimal('amount', 12, 2);
            $table->enum('frequency', ['monthly', 'yearly']);
            $table->date('next_due_date');
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('send_reminder')->default(true);
            $table->integer('reminder_days_before')->default(3);
            $table->timestamps();

            $table->index(['next_due_date', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recurring_payments');
    }
};
