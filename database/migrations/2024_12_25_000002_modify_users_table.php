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
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['admin_master', 'admin_org'])->default('admin_org')->after('email');
            $table->foreignId('organization_id')->nullable()->after('role')->constrained()->nullOnDelete();
            $table->string('phone')->nullable()->after('organization_id');
            $table->string('avatar')->nullable()->after('phone');
            $table->enum('status', ['active', 'suspended'])->default('active')->after('avatar');
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['organization_id']);
            $table->dropColumn(['role', 'organization_id', 'phone', 'avatar', 'status']);
            $table->dropSoftDeletes();
        });
    }
};
