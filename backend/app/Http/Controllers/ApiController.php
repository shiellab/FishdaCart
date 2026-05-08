<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Category;
use App\Models\Fish;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ApiController extends Controller
{
    public function categories()
    {
        return response()->json(Category::all());
    }

    public function fish(Request $request)
    {
        $query = Fish::with('category');

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        return response()->json($query->get());
    }

    public function fishDetails(Fish $fish)
    {
        return response()->json($fish->load('category'));
    }

    public function placeOrder(Request $request)
    {
        $request->validate([
            'firebase_uid' => 'nullable|string',
            'address' => 'required|string',
            'phone' => 'required|string',
            'total' => 'required|numeric',
            'items' => 'required|array',
            'items.*.id' => 'required|exists:fish,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
        ]);

        return DB::transaction(function () use ($request) {
            // Get firebase_uid from middleware OR request body
            $firebaseUid = $request->attributes->get('firebase_uid') 
                        ?? $request->input('firebase_uid') 
                        ?? 'Guest';

            $order = Order::create([
                'firebase_uid' => $firebaseUid,
                'total' => $request->total,
                'address' => $request->address,
                'phone' => $request->phone,
                'status' => 'Pending',
            ]);

            foreach ($request->items as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'fish_id' => $item['id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                ]);

                // Update sold count and revenue on Fish
                $fish = Fish::lockForUpdate()->find($item['id']);
                if ($fish) {
                    if ($fish->stock < $item['quantity']) {
                        abort(422, "{$fish->name} does not have enough stock.");
                    }

                    $fish->increment('sold_count', $item['quantity']);
                    $fish->increment('revenue', $item['quantity'] * $item['price']);
                    $fish->decrement('stock', $item['quantity']);
                }
            }

            return response()->json([
                'message' => 'Order placed successfully',
                'order_id' => $order->id
            ], 201);
        });
    }

    public function userOrders(Request $request, $uid)
    {
        if (! $this->canAccessUid($request, $uid)) {
            return response()->json(['message' => 'You can only view your own orders.'], 403);
        }

        $orders = Order::with('items.fish')
            ->where('firebase_uid', $uid)
            ->latest()
            ->get();

        return response()->json($orders);
    }

    public function syncUser(Request $request)
    {
        $request->validate([
            'firebase_uid' => 'required|string',
            'email' => 'required|email',
            'name' => 'nullable|string',
            'role' => 'nullable|string|in:Customer,Vendor,Breeder,Admin',
        ]);

        $firebaseUid = $request->attributes->get('firebase_uid');

        if ($firebaseUid !== $request->firebase_uid) {
            return response()->json(['message' => 'Firebase UID does not match authenticated user.'], 403);
        }

        $existingUser = User::where('firebase_uid', $firebaseUid)
            ->orWhere('email', $request->email)
            ->first();
        $requestedRole = $request->role === 'Breeder' ? 'Vendor' : ($request->role ?? 'Customer');
        $safeRole = $existingUser?->role === 'Admin'
            ? 'Admin'
            : ($requestedRole === 'Vendor' ? 'Vendor' : 'Customer');

        if ($existingUser) {
            $existingUser->update([
                'firebase_uid' => $firebaseUid,
                'email' => $request->email,
                'name' => $request->name ?? explode('@', $request->email)[0],
                'role' => $safeRole,
            ]);
            $user = $existingUser;
        } else {
            $user = User::create([
                'firebase_uid' => $firebaseUid,
                'email' => $request->email,
                'name' => $request->name ?? explode('@', $request->email)[0],
                'role' => $safeRole,
                'password' => bcrypt(uniqid()),
            ]);
        }

        return response()->json([
            'message' => 'User synced successfully',
            'user' => $user
        ], 200);
    }

    public function getUserStats(Request $request, $uid)
    {
        if (! $this->canAccessUid($request, $uid)) {
            return response()->json(['message' => 'You can only view your own stats.'], 403);
        }

        $user = User::where('firebase_uid', $uid)->first();

        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        $orders = Order::where('firebase_uid', $uid)->get();
        $totalOrders = $orders->count();
        $totalSpent = $orders->where('status', '!=', 'Cancelled')->sum('total');

        return response()->json([
            'user_id' => $user->id,
            'firebase_uid' => $user->firebase_uid,
            'email' => $user->email,
            'name' => $user->name,
            'role' => $user->role,
            'total_orders' => $totalOrders,
            'total_spent' => $totalSpent,
            'joined_at' => $user->created_at,
        ]);
    }

    public function getFishStats($fishId)
    {
        $fish = Fish::find($fishId);

        if (!$fish) {
            return response()->json(['error' => 'Fish not found'], 404);
        }

        return response()->json([
            'fish_id' => $fish->id,
            'name' => $fish->name,
            'stock' => $fish->stock,
            'sold_count' => $fish->sold_count,
            'revenue' => $fish->revenue,
        ]);
    }

    public function getTopSellingFish()
    {
        $topFish = Fish::orderBy('sold_count', 'desc')
            ->take(10)
            ->get(['id', 'name', 'price', 'sold_count', 'revenue', 'image']);

        return response()->json($topFish);
    }

    public function updateOrderStatus(Request $request, $orderId)
    {
        $request->validate([
            'status' => 'required|string|in:Pending,Processing,Shipped,Delivered,Cancelled',
        ]);

        return DB::transaction(function () use ($request, $orderId) {
            $order = Order::with('items.fish')->lockForUpdate()->find($orderId);

            if (!$order) {
                return response()->json(['error' => 'Order not found'], 404);
            }

            $oldStatus = $order->status;
            $newStatus = $request->status;

            if ($newStatus === 'Cancelled' && $oldStatus !== 'Cancelled') {
                foreach ($order->items as $item) {
                    $fish = $item->fish;
                    if ($fish) {
                        $fish->increment('stock', $item->quantity);
                        $fish->decrement('sold_count', $item->quantity);
                        $fish->decrement('revenue', $item->quantity * $item->price);
                    }
                }
            }

            if ($oldStatus === 'Cancelled' && $newStatus !== 'Cancelled') {
                foreach ($order->items as $item) {
                    $fish = $item->fish;
                    if ($fish) {
                        $fish->decrement('stock', $item->quantity);
                        $fish->increment('sold_count', $item->quantity);
                        $fish->increment('revenue', $item->quantity * $item->price);
                    }
                }
            }

            $order->update(['status' => $newStatus]);

            return response()->json([
                'message' => 'Order status updated successfully',
                'order' => $order
            ]);
        });
    }

    public function getAllOrders()
    {
        $orders = Order::with('items.fish', 'items.fish.category')
            ->latest()
            ->get();

        return response()->json($orders);
    }

    public function cancelOrder(Request $request, $orderId)
    {
        $order = Order::with('items.fish')->find($orderId);

        if (!$order) {
            return response()->json(['error' => 'Order not found'], 404);
        }

        if (! $this->canAccessUid($request, $order->firebase_uid)) {
            return response()->json(['message' => 'You can only cancel your own orders.'], 403);
        }

        // Only allow cancel if order is Pending or Processing
        if (!in_array($order->status, ['Pending', 'Processing'])) {
            return response()->json(['error' => 'Order cannot be cancelled at this stage'], 400);
        }

        // Restore stock for each item
        foreach ($order->items as $item) {
            $fish = $item->fish;
            if ($fish) {
                $fish->increment('stock', $item->quantity);
                $fish->decrement('sold_count', $item->quantity);
                $fish->decrement('revenue', $item->quantity * $item->price);
            }
        }

        $order->update(['status' => 'Cancelled']);

        return response()->json([
            'message' => 'Order cancelled successfully',
            'order' => $order
        ]);
    }

    private function canAccessUid(Request $request, ?string $uid): bool
    {
        $firebaseUid = $request->attributes->get('firebase_uid');

        if ($firebaseUid && $uid && $firebaseUid === $uid) {
            return true;
        }

        $apiUser = User::where('firebase_uid', $firebaseUid)->first();

        return $apiUser && in_array($apiUser->role, ['Admin', 'Vendor'], true);
    }

    // Fish CRUD with image upload
    public function createFish(Request $request)
    {
        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'size' => 'nullable|string|max:50',
            'temperament' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $data = $request->except('image');

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('fish_images', 'public');
            $data['image'] = asset('storage/' . $imagePath);
        }

        $fish = Fish::create($data);

        return response()->json([
            'message' => 'Fish created successfully',
            'fish' => $fish
        ], 201);
    }

    public function updateFish(Request $request, $id)
    {
        $fish = Fish::find($id);
        if (!$fish) {
            return response()->json(['error' => 'Fish not found'], 404);
        }

        $request->validate([
            'category_id' => 'sometimes|exists:categories,id',
            'name' => 'sometimes|string|max:255',
            'price' => 'sometimes|numeric|min:0',
            'stock' => 'sometimes|integer|min:0',
            'size' => 'nullable|string|max:50',
            'temperament' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $data = $request->except('image');

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($fish->image) {
                $oldPath = str_replace(asset('storage/'), '', $fish->image);
                Storage::disk('public')->delete($oldPath);
            }
            $imagePath = $request->file('image')->store('fish_images', 'public');
            $data['image'] = asset('storage/' . $imagePath);
        }

        $fish->update($data);

        return response()->json([
            'message' => 'Fish updated successfully',
            'fish' => $fish
        ]);
    }

    public function deleteFish($id)
    {
        $fish = Fish::find($id);
        if (!$fish) {
            return response()->json(['error' => 'Fish not found'], 404);
        }

        // Delete image if exists
        if ($fish->image) {
            $oldPath = str_replace(asset('storage/'), '', $fish->image);
            Storage::disk('public')->delete($oldPath);
        }

        $fish->delete();

        return response()->json(['message' => 'Fish deleted successfully']);
    }
}
