# Sistem Peminjaman Barang Organisasi

Sistem peminjaman barang organisasi yang modern dan responsive menggunakan Laravel, React, dan Tailwind CSS.

## 🚀 Fitur

### Roles & Akses

#### Admin Master
- ✅ Kelola organisasi (CRUD)
- ✅ Kelola akun admin organisasi
- ✅ Reset password admin
- ✅ Suspend/aktivasi akun admin
- ✅ Monitoring semua data (read-only)
- ✅ Audit log global

#### Admin Organisasi
- ✅ Kelola barang organisasi
- ✅ Tentukan barang boleh/tidak dipinjam
- ✅ Verifikasi peminjaman
- ✅ Verifikasi pengembalian
- ✅ Laporan inventaris & peminjaman

#### User Peminjam (Tanpa Login)
- ✅ Lihat daftar organisasi
- ✅ Lihat barang yang tersedia
- ✅ Pinjam barang dengan foto selfie LIVE
- ✅ Cek status peminjaman
- ✅ Kembalikan barang dengan foto kondisi

## 📋 Status Peminjaman

```
MENUNGGU VERIFIKASI
      ├── DITOLAK
      └── DIPINJAM
              ↓
        MENUNGGU CEK
              ↓
        SELESAI
           ├── NORMAL
           ├── RUSAK
           └── HILANG
```

## 🛠️ Tech Stack

- **Backend**: Laravel 12
- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **API Client**: Axios
- **Auth**: Laravel Sanctum

## 📦 Instalasi

### 1. Install PHP Dependencies

```bash
composer install
composer require laravel/sanctum
```

### 2. Environment Setup

```bash
cp .env.example .env
php artisan key:generate
```

### 3. Database Setup

```bash
# Untuk SQLite (default)
touch database/database.sqlite

# Atau update .env untuk MySQL:
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=peminjaman
# DB_USERNAME=root
# DB_PASSWORD=

# Jalankan migration
php artisan migrate

# Seed data awal
php artisan db:seed
```

### 4. Storage Link

```bash
php artisan storage:link
```

### 5. Install Node Dependencies

```bash
npm install
```

### 6. Build Assets

```bash
# Development
npm run dev

# Production
npm run build
```

### 7. Jalankan Server

```bash
# Laravel Server
php artisan serve

# Atau gunakan Laragon/XAMPP
```

## 🔐 Default Credentials

Setelah menjalankan `php artisan db:seed`:

| Role | Email | Password |
|------|-------|----------|
| Admin Master | admin@peminjaman.com | password123 |
| Admin OSIS | admin.osis@peminjaman.com | password123 |
| Admin Pramuka | admin.pramuka@peminjaman.com | password123 |

## 📂 Struktur Project

```
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Api/
│   │   │       ├── AuthController.php
│   │   │       ├── AdminMasterController.php
│   │   │       ├── AdminOrgController.php
│   │   │       └── PublicController.php
│   │   └── Middleware/
│   │       ├── AdminMasterMiddleware.php
│   │       └── AdminOrgMiddleware.php
│   └── Models/
│       ├── Organization.php
│       ├── User.php
│       ├── Item.php
│       ├── Loan.php
│       └── AuditLog.php
├── resources/
│   ├── js/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── stores/
│   │   └── app.jsx
│   └── css/
│       └── app.css
└── routes/
    ├── api.php
    └── web.php
```

## 🌐 API Endpoints

### Public (Tanpa Auth)
- `GET /api/public/organizations` - List organisasi
- `GET /api/public/organizations/{slug}/items` - List barang
- `POST /api/public/organizations/{slug}/loans` - Submit peminjaman
- `POST /api/public/loans/check-status` - Cek status
- `POST /api/public/loans/return` - Submit pengembalian

### Auth
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Admin Master (Requires Auth + Role)
- `GET /api/admin-master/dashboard` - Dashboard
- CRUD `/api/admin-master/organizations`
- CRUD `/api/admin-master/admins`
- `GET /api/admin-master/audit-logs`

### Admin Org (Requires Auth + Role)
- `GET /api/admin-org/dashboard` - Dashboard
- CRUD `/api/admin-org/items`
- `GET /api/admin-org/loans/pending` - Pending loans
- `POST /api/admin-org/loans/{id}/approve` - Approve
- `POST /api/admin-org/loans/{id}/reject` - Reject
- `GET /api/admin-org/returns/pending` - Pending returns
- `POST /api/admin-org/returns/{id}/complete` - Complete return
- `GET /api/admin-org/reports/inventory` - Inventory report
- `GET /api/admin-org/reports/loans` - Loan report

## 📱 Screenshots

Aplikasi ini menggunakan design:
- Dark mode dengan glassmorphism effects
- Gradient backgrounds dan glow effects
- Responsive untuk mobile dan desktop
- Modern animations dan transitions

## ⚠️ Aturan Sistem

1. Barang dengan `is_loanable = false` tidak bisa dipinjam
2. User wajib upload foto selfie LIVE (tidak bisa dari galeri)
3. Stok 0 = peminjaman ditutup otomatis
4. Semua aksi admin tercatat di audit log
5. Data peminjam bersifat read-only

## 📝 License

MIT License
