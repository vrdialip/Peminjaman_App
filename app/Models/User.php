<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable, SoftDeletes, HasApiTokens;

    // Role Constants
    const ROLE_ADMIN_MASTER = 'admin_master';
    const ROLE_ADMIN_ORG = 'admin_org';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'organization_id',
        'phone',
        'avatar',
        'status',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
        ];
    }

    // Relationships
    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function verifiedLoans()
    {
        return $this->hasMany(Loan::class, 'verified_by');
    }

    public function checkedReturns()
    {
        return $this->hasMany(Loan::class, 'return_checked_by');
    }

    public function auditLogs()
    {
        return $this->hasMany(AuditLog::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeAdminMaster($query)
    {
        return $query->where('role', self::ROLE_ADMIN_MASTER);
    }

    public function scopeAdminOrg($query)
    {
        return $query->where('role', self::ROLE_ADMIN_ORG);
    }

    // Accessors
    public function getAvatarUrlAttribute()
    {
        return $this->avatar ? asset('storage/' . $this->avatar) : null;
    }

    public function getRoleLabelAttribute()
    {
        return match($this->role) {
            self::ROLE_ADMIN_MASTER => 'Admin Master',
            self::ROLE_ADMIN_ORG => 'Admin Organisasi',
            default => ucfirst($this->role),
        };
    }

    // Helper Methods
    public function isAdminMaster(): bool
    {
        return $this->role === self::ROLE_ADMIN_MASTER;
    }

    public function isAdminOrg(): bool
    {
        return $this->role === self::ROLE_ADMIN_ORG;
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function canManageOrganization(int $organizationId): bool
    {
        if ($this->isAdminMaster()) {
            return true;
        }
        
        return $this->isAdminOrg() && $this->organization_id === $organizationId;
    }
}
