# 📦 Sistem Peminjaman Barang Organisasi (Digital Loan System)

Aplikasi berbasis web modern untuk mengelola peminjaman inventaris organisasi (OSIS, Pramuka, Ekstrakurikuler, dll). Aplikasi ini mendigitalkan proses peminjaman konvensional menjadi sistem yang transparan, mudah dilacak, dan efisien dengan verifikasi berbasis foto.

Dibangun dengan teknologi terbaru: **Laravel 12 (Backend)** dan **React + Tailwind CSS (Frontend)**.

---

## ✨ Fitur Utama

Aplikasi ini dibagi menjadi 3 role utama dengan fitur spesifik:

### 1. 🌐 User Public (Peminjam)
Fitur untuk siswa/guru yang ingin meminjam barang:
- **Katalog Online**: Melihat daftar barang yang tersedia di setiap organisasi beserta info stok real-time.
- **Ajukan Peminjaman**: Form peminjaman mudah dengan input data diri.
- **📸 Verifikasi Selfie**: Wajib mengambil foto selfie secara langsung (live camera) saat mengajukan peminjaman sebagai bukti valid. Mendukung kamera Laptop & HP.
- **Cek Status**: Melacak status pengajuan (Pending/Disetujui/Ditolak) menggunakan **Kode Peminjaman** unik.
- **Pengembalian Barang**: Mengajukan pengembalian barang dengan menyertakan **Foto Bukti Kondisi Barang**.
- **🔔 Notifikasi Real-time**: Mendapatkan notifikasi browser saat admin menyetujui atau menolak peminjaman.

### 2. 🏢 Admin Organisasi
Fitur untuk pengurus organisasi yang mengelola barang:
- **Dashboard Organisasi**: Ringkasan jumlah barang, peminjaman aktif, dan pengembalian pending.
- **Manajemen Barang**: Tambah, edit, hapus inventaris barang (Upload foto, set stok, kategori).
- **Verifikasi Peminjaman**: 
  - Melihat foto selfie peminjam.
  - Menyetujui atau Menolak pengajuan (dengan alasan).
- **Verifikasi Pengembalian**:
  - Mengecek foto kondisi barang saat dikembalikan.
  - Menyelesaikan status peminjaman.
- **🔔 Lonceng Notifikasi**: Notifikasi *real-time* saat ada pengajuan baru masuk tanpa perlu refresh halaman.
- **Laporan**: Cetak laporan inventaris dan riwayat peminjaman.

### 3. 👑 Admin Master (Super Admin)
Fitur untuk pembina atau admin utama sekolah:
- **Multi-Organisasi**: Membuat dan mengelola banyak organisasi (OSIS, MPK, Rohis, dll).
- **Manajemen Admin**: Membuat akun untuk Admin Organisasi.
- **Monitoring Global**: Melihat semua aktivitas peminjaman di seluruh organisasi.
- **Audit Logs**: Riwayat aktivitas sistem untuk keamanan.

---

## 🛠️ Tech Stack

- **Backend**: Laravel 12, MySQL, Sanctum (Auth).
- **Frontend**: React 18, React Router v7, Zustand (State Management), React Query (Data Fetching).
- **Styling**: Tailwind CSS v4, Lucide React (Icons).
- **Features**: 
  - 📷 **Camera.jsx**: Komponen kamera custom dengan pendeteksi perangkat & fallback cerdas.
  - 🔔 **Notification System**: Polling otomatis & Browser Notification API.

---

## 🚀 Panduan Instalasi (Step-by-Step)

Ikuti langkah ini untuk menjalankan project di komputer lokal (Windows/Mac/Linux).

### Prersyaratan
- PHP 8.3+
- Composer
- Node.js & NPM
- MySQL Database

### 1. Clone Project
```bash
git clone https://github.com/username/peminjaman.git
cd Peminjaman
```

### 2. Setup Backend (Laravel)
Install dependensi PHP:
```bash
composer install
```

Salin konfigurasi environment:
```bash
cp .env.example .env
# Windows: copy .env.example .env
```

**Buka file `.env`** dan atur koneksi database:
```ini
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=peminjaman_db  # Pastikan buat database ini di MySQL
DB_USERNAME=root
DB_PASSWORD=
```

Generate key aplikasi & link storage (untuk gambar):
```bash
php artisan key:generate
php artisan storage:link
```

Jalankan migrasi database & seeder data awal:
```bash
php artisan migrate:fresh --seed
```

### 3. Setup Frontend (React)
Install dependensi Node.js:
```bash
npm install
```

### 4. Menjalankan Aplikasi
Anda perlu menjalankan **dua terminal** secara bersamaan.

**Terminal 1 (Laravel Server):**
```bash
php artisan serve
```
*Server berjalan di: http://127.0.0.1:8000*

**Terminal 2 (Vite Dev Server):**
```bash
npm run dev
```

Buka browser dan akses **`http://127.0.0.1:8000`**.

---

## 🔑 Akun Login Default

Gunakan akun ini untuk masuk ke sistem setelah menjalankan `db:seed`.

### 1. Super Admin (Admin Master)
*Akses penuh ke semua organisasi.*
- **Email**: `admin@peminjaman.com`
- **Password**: `password123`

### 2. Admin OSIS
*Hanya mengelola barang & peminjaman OSIS.*
- **Email**: `admin.osis@peminjaman.com`
- **Password**: `password123`

### 3. Admin Pramuka
*Hanya mengelola barang & peminjaman Pramuka.*
- **Email**: `admin.pramuka@peminjaman.com`
- **Password**: `password123`

---

## ❓ Pemecahan Masalah (Troubleshooting)

**Q: Kamera tidak muncul (Blank Screen / Error Permission)?**
A: 
1. Pastikan browser mengizinkan akses kamera.
2. Jika mengetes lewat HP/Jaringan lokal, **WAJIB** menggunakan HTTPS atau akses via `localhost`. Browser memblokir kamera di `http://192.168.x.x` (Unsecure Context).
3. Coba refresh halaman.

**Q: Notifikasi tidak muncul?**
A: Pastikan Anda menekan "Allow" saat browser meminta izin notifikasi di pojok kiri atas.

**Q: Gambar/Foto tidak muncul?**
A: Jalankan `php artisan storage:link` untuk menghubungkan folder publik ke storage.
