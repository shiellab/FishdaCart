<?php

namespace App\Http\Controllers;

use App\Models\Vendor;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VendorController extends Controller
{
    public function index()
    {
        $vendors = Vendor::with('user')->latest()->get();
        $users = User::all();
        return Inertia::render('Vendors/Index', ['vendors' => $vendors, 'users' => $users]);
    }

    public function store(Request $request)
    {
        $request->validate(['store_name' => 'required|string', 'user_id' => 'required|exists:users,id']);
        Vendor::create($request->all());
        return redirect()->back();
    }

    public function update(Request $request, Vendor $vendor)
    {
        $request->validate(['store_name' => 'required|string', 'status' => 'required|in:pending,approved,rejected']);
        $vendor->update($request->all());
        return redirect()->back();
    }

    public function approve(Vendor $vendor)
    {
        $vendor->update(['status' => 'approved']);
        $vendor->user->update(['role' => 'Vendor']);
        return redirect()->back();
    }

    public function destroy(Vendor $vendor)
    {
        $vendor->delete();
        return redirect()->back();
    }
}
