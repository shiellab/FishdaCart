<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Fish;

echo "=== API DATA VERIFICATION ===\n\n";

// Get all fish as API would return
$fish = Fish::with('category')->get();

echo "Total fish: " . $fish->count() . "\n\n";

// Show sample data for first 3 fish
foreach ($fish->take(3) as $f) {
    echo "Fish ID: {$f->id}\n";
    echo "  Name: {$f->name}\n";
    echo "  Price: \${$f->price}\n";
    echo "  Stock: {$f->stock}\n";
    echo "  Image: " . ($f->image ?? 'NULL') . "\n";
    echo "  Category: " . ($f->category->name ?? 'NULL') . "\n\n";
}

// Verify API JSON structure
echo "=== JSON API RESPONSE SAMPLE ===\n";
$sample = $fish->first()->toArray();
echo json_encode($sample, JSON_PRETTY_PRINT) . "\n";
