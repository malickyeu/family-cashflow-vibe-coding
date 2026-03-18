<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('color', 7)->default('#6c757d');
            $table->string('icon')->nullable();
            $table->enum('type', ['income', 'expense', 'both'])->default('both');
            $table->boolean('is_predefined')->default(false);
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();

            $table->unique(['name', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
