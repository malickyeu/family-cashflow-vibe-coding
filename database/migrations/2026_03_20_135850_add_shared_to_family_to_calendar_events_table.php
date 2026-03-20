<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::table('calendar_events', function (Blueprint $table) {
            $table->boolean('shared_to_family')->default(false)->after('family_id');
        });
    }
    public function down(): void {
        Schema::table('calendar_events', function (Blueprint $table) {
            $table->dropColumn('shared_to_family');
        });
    }
};
