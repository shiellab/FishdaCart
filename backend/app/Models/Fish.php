<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Fish extends Model
{
    protected $fillable = [
        'category_id', 'name', 'price', 'stock', 
        'sold_count', 'revenue',
        'size', 'temperament', 'description', 'image'
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
}
