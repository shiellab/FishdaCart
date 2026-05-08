<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Fish;
use App\Models\Category;

class AddTestFish extends Command
{
    protected $signature = 'add:test-fish {--image=} {--count=1}';
    protected $description = 'Add test fish to database with optional image URL';

    public function handle()
    {
        $image = $this->option('image') ?? 'https://via.placeholder.com/300x200?text=Fish';
        $count = (int) $this->option('count');
        
        // Ensure a category exists
        $category = Category::first();
        if (!$category) {
            $category = Category::create(['name' => 'Freshwater', 'description' => 'Freshwater fish']);
            $this->info("Created category: {$category->name}");
        }

        $fishNames = ['Goldfish', 'Betta', 'Guppy', 'Angelfish', 'Tetra', 'Cichlid', 'Molly', 'Platy'];
        
        for ($i = 0; $i < $count; $i++) {
            $fish = Fish::create([
                'category_id' => $category->id,
                'name' => $fishNames[array_rand($fishNames)] . ' ' . rand(1, 999),
                'price' => rand(10, 100) + 0.99,
                'stock' => rand(5, 50),
                'size' => ['Small', 'Medium', 'Large'][rand(0, 2)],
                'temperament' => ['Peaceful', 'Aggressive', 'Social'][rand(0, 2)],
                'description' => 'Beautiful fish for your aquarium',
                'image' => $image,
            ]);
            $this->info("Created fish: {$fish->name} (ID: {$fish->id}) with image: {$image}");
        }

        return 0;
    }
}
