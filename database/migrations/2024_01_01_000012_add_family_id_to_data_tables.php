<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $tables = ['transactions', 'categories', 'recurring_payments', 'todos', 'shopping_lists'];

        foreach ($tables as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->foreignId('family_id')->nullable()->after('id')->constrained()->nullOnDelete();
            });
        }
    }

    public function down(): void
    {
        $tables = ['transactions', 'categories', 'recurring_payments', 'todos', 'shopping_lists'];

        foreach ($tables as $tableName) {
            Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                $table->dropForeign([$tableName === 'shopping_lists' ? 'family_id' : 'family_id']);
                $table->dropColumn('family_id');
            });
        }
    }
};
