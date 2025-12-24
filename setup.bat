@echo off
echo ==========================================
echo  SETUP SISTEM PEMINJAMAN BARANG
echo ==========================================
echo.

echo [1/6] Installing PHP dependencies...
call composer require laravel/sanctum
echo.

echo [2/6] Generating application key...
call php artisan key:generate
echo.

echo [3/6] Creating storage link...
call php artisan storage:link
echo.

echo [4/6] Running database migrations...
call php artisan migrate
echo.

echo [5/6] Seeding database with sample data...
call php artisan db:seed
echo.

echo [6/6] Installing Node.js dependencies...
call npm install
echo.

echo ==========================================
echo  SETUP COMPLETE!
echo ==========================================
echo.
echo Run the following commands to start:
echo.
echo   npm run dev      (in one terminal)
echo   php artisan serve (in another terminal)
echo.
echo Then open http://localhost:8000
echo.
echo Login Credentials:
echo   Admin Master: admin@peminjaman.com / password123
echo   Admin OSIS: admin.osis@peminjaman.com / password123
echo.
pause
