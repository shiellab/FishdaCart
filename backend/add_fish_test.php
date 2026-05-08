<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Fish;
use App\Models\Category;

// Ensure category exists
$category = Category::first();
if (!$category) {
    $category = Category::create(['name' => 'Freshwater', 'description' => 'Freshwater fish']);
    echo "Created category: {$category->name}\n";
}

// Create test fish with image
$fish = Fish::create([
    'category_id' => $category->id,
    'name' => 'Goldfish Test',
    'price' => 15.99,
    'stock' => 25,
    'size' => 'Small',
    'temperament' => 'Peaceful',
    'description' => 'Beautiful golden fish for aquarium',
    'image' => 'https://via.placeholder.com/300x200?text=Goldfish',
]);

echo "SUCCESS: Created fish ID {$fish->id} - {$fish->name}\n";
echo "Image URL: {$fish->image}\n";

// Show all fish
$allFish = Fish::all(['id', 'name', 'image', 'price']);
echo "\nAll fish in database:\n";
foreach ($allFish as $f) {
    echo "- ID {$f->id}: {$f->name} - \${$f->price} - Image: " . ($f->image ? 'Yes' : 'No') . "\n";
}
