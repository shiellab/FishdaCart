<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Fish;
use App\Models\Category;

echo "=== DATABASE CHECK ===\n";
echo "Fish count: " . Fish::count() . "\n";
echo "Categories: " . Category::count() . "\n\n";

if (Fish::count() > 0) {
    echo "Recent fish:\n";
    foreach (Fish::latest()->take(3)->get(['id', 'name', 'price']) as $fish) {
        echo "  ID {$fish->id}: {$fish->name} (\${$fish->price})\n";
    }
} else {
    echo "WARNING: No fish found in database!\n";
}
