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
        Schema::table('fish', function (Blueprint $table) {
            $table->integer('sold_count')->default(0)->after('stock');
            $table->decimal('revenue', 10, 2)->default(0)->after('sold_count');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('fish', function (Blueprint $table) {
            $table->dropColumn(['sold_count', 'revenue']);
        });
    }
};
