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
        Schema::create('items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('code')->unique(); // Kode unik barang
            $table->string('category')->nullable();
            $table->text('description')->nullable();
            $table->integer('stock')->default(0);
            $table->integer('available_stock')->default(0); // Stok yang tersedia untuk dipinjam
            $table->string('condition')->default('good'); // good, fair, poor
            $table->string('image')->nullable();
            $table->boolean('is_loanable')->default(false); // Boleh dipinjam atau tidak
            $table->text('not_loanable_reason')->nullable(); // Alasan tidak boleh dipinjam
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('items');
    }
};
