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
        Schema::create('loans', function (Blueprint $table) {
            $table->id();
            $table->string('loan_code')->unique(); // Kode peminjaman unik
            $table->foreignId('item_id')->constrained()->cascadeOnDelete();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            
            // Data Peminjam (tanpa login)
            $table->string('borrower_name');
            $table->string('borrower_class')->nullable(); // Kelas
            $table->string('borrower_organization')->nullable(); // Organisasi peminjam
            $table->string('borrower_phone');
            $table->string('borrower_photo'); // Foto LIVE peminjam
            
            // Data Peminjaman
            $table->integer('quantity')->default(1);
            $table->text('loan_purpose')->nullable(); // Tujuan peminjaman
            $table->timestamp('loan_date')->useCurrent();
            $table->timestamp('expected_return_date')->nullable();
            
            // Status Peminjaman
            $table->enum('status', [
                'pending',      // Menunggu verifikasi
                'rejected',     // Ditolak
                'borrowed',     // Sedang dipinjam
                'return_pending', // Menunggu cek pengembalian
                'completed',    // Selesai (normal)
                'completed_damaged', // Selesai (rusak)
                'completed_lost'     // Selesai (hilang)
            ])->default('pending');
            
            // Data Pengembalian
            $table->timestamp('actual_return_date')->nullable();
            $table->string('return_photo')->nullable(); // Foto kondisi saat dikembalikan
            $table->text('return_condition_notes')->nullable();
            
            // Data Verifikasi
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            $table->text('rejection_reason')->nullable();
            
            // Data Pengecekan Pengembalian
            $table->foreignId('return_checked_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('return_checked_at')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('loans');
    }
};
