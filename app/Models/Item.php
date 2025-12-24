<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Item extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'organization_id',
        'name',
        'code',
        'category',
        'description',
        'stock',
        'available_stock',
        'condition',
        'image',
        'is_loanable',
        'not_loanable_reason',
        'status',
    ];

    protected $casts = [
        'is_loanable' => 'boolean',
        'stock' => 'integer',
        'available_stock' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->code)) {
                $model->code = 'ITM-' . strtoupper(Str::random(8));
            }
            if ($model->available_stock === null) {
                $model->available_stock = $model->stock;
            }
        });
    }

    // Relationships
    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function loans()
    {
        return $this->hasMany(Loan::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeLoanable($query)
    {
        return $query->where('is_loanable', true)
                     ->where('available_stock', '>', 0)
                     ->where('status', 'active');
    }

    public function scopeByOrganization($query, $organizationId)
    {
        return $query->where('organization_id', $organizationId);
    }

    // Accessors
    public function getImageUrlAttribute()
    {
        return $this->image ? asset('storage/' . $this->image) : null;
    }

    public function getIsAvailableAttribute()
    {
        return $this->is_loanable && $this->available_stock > 0 && $this->status === 'active';
    }

    // Methods
    public function decreaseStock($quantity = 1)
    {
        $this->available_stock = max(0, $this->available_stock - $quantity);
        $this->save();
    }

    public function increaseStock($quantity = 1)
    {
        $this->available_stock = min($this->stock, $this->available_stock + $quantity);
        $this->save();
    }
}
