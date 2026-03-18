<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shopping_list_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shopping_list_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->decimal('quantity', 8, 2)->default(1);
            $table->string('unit')->nullable();
            $table->text('notes')->nullable();
            $table->boolean('is_checked')->default(false);
            $table->foreignId('checked_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('checked_at')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index(['shopping_list_id', 'is_checked']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shopping_list_items');
    }
};
