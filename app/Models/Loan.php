<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Loan extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'loan_code',
        'item_id',
        'organization_id',
        'borrower_name',
        'borrower_class',
        'borrower_organization',
        'borrower_phone',
        'borrower_photo',
        'quantity',
        'loan_purpose',
        'loan_date',
        'expected_return_date',
        'status',
        'actual_return_date',
        'return_photo',
        'return_condition_notes',
        'verified_by',
        'verified_at',
        'rejection_reason',
        'return_checked_by',
        'return_checked_at',
    ];

    protected $casts = [
        'loan_date' => 'datetime',
        'expected_return_date' => 'datetime',
        'actual_return_date' => 'datetime',
        'verified_at' => 'datetime',
        'return_checked_at' => 'datetime',
        'quantity' => 'integer',
    ];

    // Status Constants
    const STATUS_PENDING = 'pending';
    const STATUS_REJECTED = 'rejected';
    const STATUS_BORROWED = 'borrowed';
    const STATUS_RETURN_PENDING = 'return_pending';
    const STATUS_COMPLETED = 'completed';
    const STATUS_COMPLETED_DAMAGED = 'completed_damaged';
    const STATUS_COMPLETED_LOST = 'completed_lost';

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->loan_code)) {
                $model->loan_code = 'LOAN-' . date('Ymd') . '-' . strtoupper(Str::random(6));
            }
        });
    }

    // Relationships
    public function item()
    {
        return $this->belongsTo(Item::class);
    }

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function returnChecker()
    {
        return $this->belongsTo(User::class, 'return_checked_by');
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    public function scopeBorrowed($query)
    {
        return $query->where('status', self::STATUS_BORROWED);
    }

    public function scopeReturnPending($query)
    {
        return $query->where('status', self::STATUS_RETURN_PENDING);
    }

    public function scopeCompleted($query)
    {
        return $query->whereIn('status', [
            self::STATUS_COMPLETED,
            self::STATUS_COMPLETED_DAMAGED,
            self::STATUS_COMPLETED_LOST
        ]);
    }

    public function scopeByOrganization($query, $organizationId)
    {
        return $query->where('organization_id', $organizationId);
    }

    // Accessors
    public function getBorrowerPhotoUrlAttribute()
    {
        return $this->borrower_photo ? asset('storage/' . $this->borrower_photo) : null;
    }

    public function getReturnPhotoUrlAttribute()
    {
        return $this->return_photo ? asset('storage/' . $this->return_photo) : null;
    }

    public function getStatusLabelAttribute()
    {
        return match($this->status) {
            self::STATUS_PENDING => 'Menunggu Verifikasi',
            self::STATUS_REJECTED => 'Ditolak',
            self::STATUS_BORROWED => 'Dipinjam',
            self::STATUS_RETURN_PENDING => 'Menunggu Cek Pengembalian',
            self::STATUS_COMPLETED => 'Selesai',
            self::STATUS_COMPLETED_DAMAGED => 'Selesai (Rusak)',
            self::STATUS_COMPLETED_LOST => 'Selesai (Hilang)',
            default => ucfirst($this->status),
        };
    }

    public function getStatusColorAttribute()
    {
        return match($this->status) {
            self::STATUS_PENDING => 'yellow',
            self::STATUS_REJECTED => 'red',
            self::STATUS_BORROWED => 'blue',
            self::STATUS_RETURN_PENDING => 'orange',
            self::STATUS_COMPLETED => 'green',
            self::STATUS_COMPLETED_DAMAGED => 'red',
            self::STATUS_COMPLETED_LOST => 'red',
            default => 'gray',
        };
    }

    // Methods
    public function approve(User $admin)
    {
        $this->status = self::STATUS_BORROWED;
        $this->verified_by = $admin->id;
        $this->verified_at = now();
        $this->save();
        
        $this->item->decreaseStock($this->quantity);
    }

    public function reject(User $admin, string $reason)
    {
        $this->status = self::STATUS_REJECTED;
        $this->verified_by = $admin->id;
        $this->verified_at = now();
        $this->rejection_reason = $reason;
        $this->save();
    }

    public function submitReturn(string $photoPath, ?string $notes = null)
    {
        $this->status = self::STATUS_RETURN_PENDING;
        $this->return_photo = $photoPath;
        $this->return_condition_notes = $notes;
        $this->save();
    }

    public function completeReturn(User $admin, string $condition = 'normal')
    {
        $this->status = match($condition) {
            'damaged' => self::STATUS_COMPLETED_DAMAGED,
            'lost' => self::STATUS_COMPLETED_LOST,
            default => self::STATUS_COMPLETED,
        };
        $this->actual_return_date = now();
        $this->return_checked_by = $admin->id;
        $this->return_checked_at = now();
        $this->save();

        // Only restore stock if not lost
        if ($condition !== 'lost') {
            $this->item->increaseStock($this->quantity);
        }
    }
}
