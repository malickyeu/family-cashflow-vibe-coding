<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['income', 'expense']);
            $table->decimal('amount', 12, 2);
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->date('date');
            $table->string('description')->nullable();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->foreignId('recurring_payment_id')->nullable()->constrained()->nullOnDelete();
            $table->boolean('is_auto_generated')->default(false);
            $table->timestamps();

            $table->index(['date', 'type']);
            $table->index('user_id');
            $table->index('category_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
