<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Organization;
use App\Models\Item;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create Admin Master
        $adminMaster = User::create([
            'name' => 'Admin Master',
            'email' => 'admin@peminjaman.com',
            'password' => Hash::make('password123'),
            'role' => User::ROLE_ADMIN_MASTER,
            'status' => 'active',
        ]);

        echo "✅ Admin Master created: admin@peminjaman.com / password123\n";

        // Create sample organizations
        $org1 = Organization::create([
            'name' => 'OSIS SMA Negeri 1',
            'slug' => 'osis-sman1',
            'description' => 'Organisasi Siswa Intra Sekolah SMA Negeri 1',
            'address' => 'Jl. Pendidikan No. 1',
            'phone' => '021-1234567',
            'email' => 'osis@sman1.sch.id',
            'status' => 'active',
        ]);

        $org2 = Organization::create([
            'name' => 'Pramuka Gudep 001',
            'slug' => 'pramuka-gudep001',
            'description' => 'Gugus Depan Pramuka 001',
            'address' => 'Jl. Pramuka No. 10',
            'phone' => '021-7654321',
            'email' => 'pramuka@gudep001.org',
            'status' => 'active',
        ]);

        echo "✅ Sample organizations created\n";

        // Create Admin Org for each organization
        $adminOrg1 = User::create([
            'name' => 'Admin OSIS',
            'email' => 'admin.osis@peminjaman.com',
            'password' => Hash::make('password123'),
            'role' => User::ROLE_ADMIN_ORG,
            'organization_id' => $org1->id,
            'status' => 'active',
        ]);

        $adminOrg2 = User::create([
            'name' => 'Admin Pramuka',
            'email' => 'admin.pramuka@peminjaman.com',
            'password' => Hash::make('password123'),
            'role' => User::ROLE_ADMIN_ORG,
            'organization_id' => $org2->id,
            'status' => 'active',
        ]);

        echo "✅ Admin Org accounts created\n";

        // Create sample items for Org 1
        $items1 = [
            [
                'name' => 'Proyektor Epson',
                'category' => 'Elektronik',
                'description' => 'Proyektor untuk presentasi',
                'stock' => 3,
                'available_stock' => 3,
                'condition' => 'good',
                'is_loanable' => true,
            ],
            [
                'name' => 'Sound System JBL',
                'category' => 'Elektronik',
                'description' => 'Sound system portable',
                'stock' => 2,
                'available_stock' => 2,
                'condition' => 'good',
                'is_loanable' => true,
            ],
            [
                'name' => 'Meja Lipat',
                'category' => 'Furniture',
                'description' => 'Meja lipat untuk event',
                'stock' => 10,
                'available_stock' => 10,
                'condition' => 'good',
                'is_loanable' => true,
            ],
            [
                'name' => 'Laptop Asus',
                'category' => 'Elektronik',
                'description' => 'Laptop untuk kegiatan organisasi',
                'stock' => 2,
                'available_stock' => 2,
                'condition' => 'good',
                'is_loanable' => false,
                'not_loanable_reason' => 'Hanya untuk penggunaan internal OSIS',
            ],
        ];

        foreach ($items1 as $item) {
            Item::create(array_merge($item, ['organization_id' => $org1->id]));
        }

        // Create sample items for Org 2
        $items2 = [
            [
                'name' => 'Tenda Dome 4 Orang',
                'category' => 'Camping',
                'description' => 'Tenda camping kapasitas 4 orang',
                'stock' => 5,
                'available_stock' => 5,
                'condition' => 'good',
                'is_loanable' => true,
            ],
            [
                'name' => 'Sleeping Bag',
                'category' => 'Camping',
                'description' => 'Sleeping bag untuk tidur outdoor',
                'stock' => 20,
                'available_stock' => 20,
                'condition' => 'good',
                'is_loanable' => true,
            ],
            [
                'name' => 'Kompas',
                'category' => 'Navigasi',
                'description' => 'Kompas untuk navigasi',
                'stock' => 10,
                'available_stock' => 10,
                'condition' => 'fair',
                'is_loanable' => true,
            ],
            [
                'name' => 'Bendera Semaphore',
                'category' => 'Kepramukaan',
                'description' => 'Set bendera semaphore',
                'stock' => 10,
                'available_stock' => 10,
                'condition' => 'good',
                'is_loanable' => false,
                'not_loanable_reason' => 'Dalam proses perbaikan',
            ],
        ];

        foreach ($items2 as $item) {
            Item::create(array_merge($item, ['organization_id' => $org2->id]));
        }

        echo "✅ Sample items created\n";

        echo "\n=========================================\n";
        echo "🎉 Database seeded successfully!\n";
        echo "=========================================\n\n";
        echo "Login Credentials:\n";
        echo "----------------------------------------\n";
        echo "Admin Master:\n";
        echo "  Email: admin@peminjaman.com\n";
        echo "  Password: password123\n\n";
        echo "Admin OSIS:\n";
        echo "  Email: admin.osis@peminjaman.com\n";
        echo "  Password: password123\n\n";
        echo "Admin Pramuka:\n";
        echo "  Email: admin.pramuka@peminjaman.com\n";
        echo "  Password: password123\n";
        echo "----------------------------------------\n";
    }
}
