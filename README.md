# 📦 Sistem Peminjaman Barang

Aplikasi manajemen peminjaman barang berbasis web yang dibangun menggunakan **Laravel 12** (Backend) dan **React + Tailwind CSS** (Frontend).

## 🛠️ Persyaratan Sistem (Requirements)

Sebelum memulai, pastikan komputer Anda sudah terinstall:

*   **PHP**: Versi 8.2 atau lebih baru.
*   **Composer**: Untuk manajemen dependensi PHP.
*   **Node.js & NPM**: Untuk manajemen dependensi Frontend.
*   **MySQL**: Database server (Bisa menggunakan XAMPP, Laragon, atau Docker).
*   **Git**: (Opsional) Untuk clone repository.

---

## 🚀 Panduan Instalasi (Step-by-Step)

Ikuti langkah-langkah berikut secara berurutan untuk menjalankan aplikasi ini di komputer lokal Anda.

### 1. Clone atau Download Project
Jika menggunakan Git:
```bash
git clone https://github.com/username/peminjaman.git
cd peminjaman
```
Atau download ZIP dan ekstrak, lalu buka folder tersebut di terminal/CMD.

### 2. Install Dependensi Backend (Laravel)
Jalankan perintah berikut untuk menginstall library PHP yang dibutuhkan:
```bash
composer install
```

### 3. Install Dependensi Frontend (React)
Jalankan perintah berikut untuk menginstall library JavaScript yang dibutuhkan:
```bash
npm install
```

### 4. Konfigurasi Environment (`.env`)
Salin file contoh `.env` menjadi `.env`:
```bash
copy .env.example .env
```
*(Di Linux/Mac gunakan `cp .env.example .env`)*

Buka file `.env` dengan text editor (Notepad, VS Code, dll) dan sesuaikan pengaturan database:
```ini
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=peminjaman
DB_USERNAME=root
DB_PASSWORD=
```
*Pastikan Anda membuat database kosong bernama `peminjaman` di MySQL Anda sebelum lanjut.*

### 5. Generate Application Key
```bash
php artisan key:generate
```

### 6. Setup Database (Migrasi & Seeding)
Langkah ini akan membuat tabel-tabel di database dan mengisi data awal (akun admin, dll).
```bash
php artisan migrate:fresh --seed
```
*Catatan: Jika muncul error "personal_access_tokens table not found", jalankan perintah ini dulu:*
```bash
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate
```

### 7. Jalankan Server
Anda perlu menjalankan **dua terminal** secara bersamaan.

**Terminal 1 (Backend Laravel):**
```bash
php artisan serve
```
Server akan berjalan di `http://127.0.0.1:8000`

**Terminal 2 (Frontend React):**
```bash
npm run dev
```

Buka browser dan akses alamat yang muncul di Terminal 2 (biasanya `http://localhost:5173` atau `http://127.0.0.1:8000` tergantung konfigurasi Vite).

---

## 🔑 Akun Login Default

Gunakan akun berikut untuk masuk ke aplikasi setelah menajalankan `db:seed`:

### 1. Admin Master (Super Admin)
*   **Email**: `admin@peminjaman.com`
*   **Password**: `password123`

### 2. Admin OSIS (Organisasi)
*   **Email**: `admin.osis@sekolah.sch.id`
*   **Password**: `password123`

### 3. Admin Pramuka (Organisasi)
*   **Email**: `admin.pramuka@sekolah.sch.id`
*   **Password**: `password123`

---

## ❓ Troubleshooting (Masalah Umum)

**Q: Error `Table 'peminjaman.personal_access_tokens' doesn't exist` saat login?**
A: Jalankan perintah berikut untuk memperbaiki tabel token:
```bash
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate
```

**Q: Tidak bisa login dengan password yang benar?**
A: Pastikan Anda sudah menjalankan seeding dengan benar. Coba reset database:
```bash
php artisan migrate:fresh --seed
```

**Q: Halaman kosong atau putih?**
A: Pastikan `npm run dev` sedang berjalan. Cek console browser (F12) untuk melihat error JavaScript.

**Q: Error `Vite manifest not found`?**
A: Jika Anda menjalankan di mode produksi, jalankan `npm run build`. Untuk development, pastikan `npm run dev` aktif.

---

## 💻 Tech Stack

*   **Framework**: Laravel 12
*   **Frontend**: React.js
*   **Styling**: Tailwind CSS
*   **Icons**: Lucide React
*   **Database**: MySQL
*   **Auth**: Laravel Sanctum
