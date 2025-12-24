<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = App\Models\User::where('email', 'admin@peminjaman.com')->first();
if ($user) {
    echo "Found user with ID: " . $user->id . "\n";
    echo "Current stored password (start): " . substr($user->getAttributes()['password'], 0, 10) . "...\n";
    
    // Update password
    $user->password = 'password123';
    $user->save();
    
    // Check result
    echo "Saved user.\n";
    $user->refresh();
    // access raw attribute to see if it is hashed
    $rawPassword = $user->getAttributes()['password'];
    echo "New stored password: " . $rawPassword . "\n";
    
    if (password_get_info($rawPassword)['algo']) {
        echo "Password IS hashed correctly.\n";
    } else {
        echo "Password IS NOT hashed (plain text).\n";
    }
} else {
    echo "User NOT found.\n";
}
