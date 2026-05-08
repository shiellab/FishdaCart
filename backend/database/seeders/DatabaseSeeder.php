<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $admin = User::firstOrCreate(
            ['email' => 'admin@fishdacart.com'],
            [
                'name' => 'Admin User',
                'password' => bcrypt('password'),
                'role' => 'Admin',
            ]
        );

        $categories = [
            ['name' => 'Betta', 'slug' => 'betta'],
            ['name' => 'Goldfish', 'slug' => 'goldfish'],
            ['name' => 'Guppies', 'slug' => 'guppies'],
            ['name' => 'Cichlids', 'slug' => 'cichlids'],
        ];

        foreach ($categories as $cat) {
            $category = \App\Models\Category::firstOrCreate($cat);

            if ($cat['slug'] === 'betta') {
                \App\Models\Fish::firstOrCreate([
                    'name' => 'Halfmoon Betta',
                    'category_id' => $category->id,
                    'price' => 15.99,
                    'stock' => 10,
                    'size' => 'Small',
                    'temperament' => 'Aggressive',
                    'description' => 'Beautiful long fins.',
                ]);
            }

            if ($cat['slug'] === 'goldfish') {
                \App\Models\Fish::firstOrCreate([
                    'name' => 'Oranda Goldfish',
                    'category_id' => $category->id,
                    'price' => 25.00,
                    'stock' => 5,
                    'size' => 'Medium',
                    'temperament' => 'Peaceful',
                    'description' => 'Classic fancy goldfish.',
                ]);
            }
        }
    }
}
