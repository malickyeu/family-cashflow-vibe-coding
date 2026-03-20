<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('calendar_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('family_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->dateTime('start_datetime');
            $table->dateTime('end_datetime');
            $table->boolean('all_day')->default(false);
            $table->string('location')->nullable();
            $table->string('color')->default('#0d6efd');
            $table->boolean('is_recurring')->default(false);
            $table->string('recurrence_type')->nullable();
            $table->integer('recurrence_interval')->nullable()->default(1);
            $table->json('recurrence_days')->nullable();
            $table->date('recurrence_end_date')->nullable();
            $table->foreignId('parent_event_id')->nullable()->constrained('calendar_events')->cascadeOnDelete();
            $table->integer('reminder_minutes')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'start_datetime']);
            $table->index(['family_id', 'start_datetime']);
        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('calendar_events');
    }
};
