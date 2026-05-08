<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        return Inertia::render('Users/Index', ['users' => User::latest()->get()]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:6',
            'role' => 'required|string'
        ]);
        
        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
            'role' => $request->role,
        ]);
        
        return redirect()->back();
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users,email,'.$user->id,
            'role' => 'required|string'
        ]);
        
        $data = $request->only('name', 'email', 'role');
        if ($request->password) {
            $data['password'] = bcrypt($request->password);
        }
        
        $user->update($data);
        return redirect()->back();
    }

    public function destroy(User $user)
    {
        $user->delete();
        return redirect()->back();
    }
}
