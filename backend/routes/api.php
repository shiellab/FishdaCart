<?php

use App\Http\Controllers\ApiController;
use Illuminate\Support\Facades\Route;

// Public routes (no auth required)
Route::get('/categories', [ApiController::class, 'categories']);
Route::get('/fish', [ApiController::class, 'fish']);
Route::get('/fish/{fish}', [ApiController::class, 'fishDetails']);
Route::get('/top-selling-fish', [ApiController::class, 'getTopSellingFish']);

// Public order placement (temporarily bypass Firebase auth for testing)
Route::post('/orders', [ApiController::class, 'placeOrder']);
Route::get('/orders/{uid}', [ApiController::class, 'userOrders']);
Route::post('/orders/{orderId}/cancel', [ApiController::class, 'cancelOrder']);

Route::middleware('firebase.auth')->group(function () {
    Route::post('/sync-user', [ApiController::class, 'syncUser']);
    Route::get('/user-stats/{uid}', [ApiController::class, 'getUserStats']);
    Route::get('/fish-stats/{fishId}', [ApiController::class, 'getFishStats']);

    Route::middleware('firebase.role:Admin,Vendor')->group(function () {
        Route::post('/fish', [ApiController::class, 'createFish']);
        Route::post('/fish/{id}', [ApiController::class, 'updateFish']);
        Route::delete('/fish/{id}', [ApiController::class, 'deleteFish']);
        Route::get('/all-orders', [ApiController::class, 'getAllOrders']);
        Route::put('/orders/{orderId}/status', [ApiController::class, 'updateOrderStatus']);
    });
});
