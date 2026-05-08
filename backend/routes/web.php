<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    $recentOrders = \App\Models\Order::where('created_at', '>=', now()->subDays(6)->startOfDay())
        ->where('status', '!=', 'Cancelled')
        ->get(['created_at', 'total']);

    $revenueData = collect(range(0, 6))->map(function ($offset) use ($recentOrders) {
        $date = now()->subDays(6 - $offset);
        $revenue = $recentOrders
            ->filter(fn ($order) => $order->created_at->isSameDay($date))
            ->sum('total');

        return [
            'date' => $date->format('M d'),
            'revenue' => (float) $revenue,
        ];
    })->values();

    $fishData = \App\Models\Fish::orderByDesc('sold_count')
        ->take(10)
        ->get(['name', 'sold_count'])
        ->map(fn ($fish) => [
            'name' => $fish->name,
            'sold' => (int) $fish->sold_count,
        ])
        ->values();

    return Inertia::render('Dashboard', [
        'stats' => [
            'categories' => \App\Models\Category::count(),
            'fish' => \App\Models\Fish::count(),
            'orders' => \App\Models\Order::count(),
            'users' => \App\Models\User::count(),
            'revenue' => \App\Models\Order::where('status', '!=', 'Cancelled')->sum('total') ?? 5340,
        ],
        'revenueData' => $revenueData,
        'fishData' => $fishData,
    ]);
})->middleware(['auth', 'verified', 'role:Admin'])->name('dashboard');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth', 'verified', 'role:Admin'])->group(function () {
    Route::resource('categories', \App\Http\Controllers\CategoryController::class);
    Route::resource('fish', \App\Http\Controllers\FishController::class);
    Route::resource('orders', \App\Http\Controllers\OrderController::class);
    Route::resource('users', \App\Http\Controllers\UserController::class);
    Route::resource('vendors', \App\Http\Controllers\VendorController::class);
    Route::post('vendors/{vendor}/approve', [\App\Http\Controllers\VendorController::class, 'approve'])->name('vendors.approve');
});

require __DIR__.'/auth.php';
