<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

use App\Models\Fish;
use App\Models\Category;
use Inertia\Inertia;

class FishController extends Controller
{
    public function index()
    {
        return Inertia::render('Fish/Index', [
            'fish' => Fish::with('category')->get()
        ]);
    }

    public function create()
    {
        return Inertia::render('Fish/Create', [
            'categories' => Category::all()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'size' => 'nullable|string',
            'temperament' => 'nullable|string',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        $data = $request->except('image');

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('fish_images', 'public');
            $data['image'] = asset('storage/' . $imagePath);
        }

        Fish::create($data);

        return redirect()->route('fish.index');
    }

    public function edit(Fish $fish)
    {
        return Inertia::render('Fish/Edit', [
            'fish' => $fish,
            'categories' => Category::all()
        ]);
    }

    public function update(Request $request, Fish $fish)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'size' => 'nullable|string',
            'temperament' => 'nullable|string',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        $data = $request->except('image');

        if ($request->hasFile('image')) {
            if ($fish->image) {
                $oldPath = str_starts_with($fish->image, asset('storage/'))
                    ? str_replace(asset('storage/'), '', $fish->image)
                    : $fish->image;

                Storage::disk('public')->delete($oldPath);
            }

            $imagePath = $request->file('image')->store('fish_images', 'public');
            $data['image'] = asset('storage/' . $imagePath);
        }

        $fish->update($data);

        return redirect()->route('fish.index');
    }

    public function destroy(Fish $fish)
    {
        if ($fish->image) {
            $oldPath = str_starts_with($fish->image, asset('storage/'))
                ? str_replace(asset('storage/'), '', $fish->image)
                : $fish->image;

            Storage::disk('public')->delete($oldPath);
        }

        $fish->delete();
        return redirect()->route('fish.index');
    }
}