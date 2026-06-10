<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@tonightsound.studio'],
            [
                'name' => 'Администратор',
                'password' => 'admin123', // хэшируется кастом 'hashed'; в проде сменить!
                'is_admin' => true,
            ],
        );
    }
}
