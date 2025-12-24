<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = App\Models\User::where('email', 'admin@peminjaman.com')->first();
if ($user) {
    echo "User found: " . $user->email . "\n";
    echo "Password hash: " . $user->password . "\n";
    $check = Illuminate\Support\Facades\Hash::check('password123', $user->password);
    echo "Password check 'password123': " . ($check ? 'TRUE' : 'FALSE') . "\n";
} else {
    echo "User NOT found.\n";
}
