<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Order;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index()
    {
        return Inertia::render('Orders/Index', [
            'orders' => Order::with('items.fish')->latest()->get()
        ]);
    }

    public function show(Order $order)
    {
        return Inertia::render('Orders/Show', [
            'order' => $order->load('items.fish.category')
        ]);
    }

    public function update(Request $request, Order $order)
    {
        $request->validate([
            'status' => 'required|string|in:Pending,Processing,Shipped,Delivered,Cancelled',
        ]);

        $newStatus = $request->status;
        $oldStatus = $order->status;

        // If cancelling and wasn't already cancelled, restore stock
        if ($newStatus === 'Cancelled' && $oldStatus !== 'Cancelled') {
            $order->load('items.fish');
            foreach ($order->items as $item) {
                $fish = $item->fish;
                if ($fish) {
                    $fish->increment('stock', $item->quantity);
                    $fish->decrement('sold_count', $item->quantity);
                    $fish->decrement('revenue', $item->quantity * $item->price);
                }
            }
        }

        // If uncancelling (from Cancelled to something else), deduct stock again
        if ($oldStatus === 'Cancelled' && $newStatus !== 'Cancelled') {
            $order->load('items.fish');
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

        return back()->with('success', 'Order status updated successfully.');
    }

    public function destroy(Order $order)
    {
        $order->delete();
        return redirect()->route('orders.index');
    }
}