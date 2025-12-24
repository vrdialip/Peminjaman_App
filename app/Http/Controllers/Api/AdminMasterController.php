<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AdminMasterController extends Controller
{
    /**
     * Dashboard statistics
     */
    public function dashboard()
    {
        $stats = [
            'total_organizations' => Organization::count(),
            'active_organizations' => Organization::active()->count(),
            'total_admins' => User::adminOrg()->count(),
            'active_admins' => User::adminOrg()->active()->count(),
            'total_items' => \App\Models\Item::count(),
            'total_loans' => \App\Models\Loan::count(),
            'active_loans' => \App\Models\Loan::borrowed()->count(),
            'pending_loans' => \App\Models\Loan::pending()->count(),
        ];

        $recentLogs = AuditLog::with('user')
            ->latest()
            ->take(10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => $stats,
                'recent_logs' => $recentLogs,
            ],
        ]);
    }

    // ==================== ORGANIZATION MANAGEMENT ====================

    /**
     * List all organizations
     */
    public function listOrganizations(Request $request)
    {
        $query = Organization::withCount(['items', 'loans', 'users']);

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $organizations = $query->latest()->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $organizations,
        ]);
    }

    /**
     * Create organization
     */
    public function createOrganization(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email',
            'logo' => 'nullable|image|max:2048',
        ]);

        $data = $request->except('logo');
        $data['slug'] = Str::slug($request->name);

        if ($request->hasFile('logo')) {
            $data['logo'] = $request->file('logo')->store('organizations', 'public');
        }

        $organization = Organization::create($data);

        AuditLog::log(
            'create',
            "Membuat organisasi baru: {$organization->name}",
            'Organization',
            $organization->id,
            null,
            $organization->toArray()
        );

        return response()->json([
            'success' => true,
            'message' => 'Organisasi berhasil dibuat',
            'data' => $organization,
        ], 201);
    }

    /**
     * Show organization detail
     */
    public function showOrganization(Organization $organization)
    {
        $organization->load(['users', 'items', 'loans' => function ($q) {
            $q->latest()->take(10);
        }]);

        return response()->json([
            'success' => true,
            'data' => $organization,
        ]);
    }

    /**
     * Update organization
     */
    public function updateOrganization(Request $request, Organization $organization)
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email',
            'status' => 'sometimes|in:active,inactive',
            'logo' => 'nullable|image|max:2048',
        ]);

        $oldValues = $organization->toArray();
        $data = $request->except('logo');

        if ($request->has('name')) {
            $data['slug'] = Str::slug($request->name);
        }

        if ($request->hasFile('logo')) {
            $data['logo'] = $request->file('logo')->store('organizations', 'public');
        }

        $organization->update($data);

        AuditLog::log(
            'update',
            "Memperbarui organisasi: {$organization->name}",
            'Organization',
            $organization->id,
            $oldValues,
            $organization->fresh()->toArray()
        );

        return response()->json([
            'success' => true,
            'message' => 'Organisasi berhasil diperbarui',
            'data' => $organization->fresh(),
        ]);
    }

    /**
     * Delete (soft) organization
     */
    public function deleteOrganization(Organization $organization)
    {
        $oldValues = $organization->toArray();
        $organization->delete();

        AuditLog::log(
            'delete',
            "Menghapus organisasi: {$organization->name}",
            'Organization',
            $organization->id,
            $oldValues,
            null
        );

        return response()->json([
            'success' => true,
            'message' => 'Organisasi berhasil dihapus',
        ]);
    }

    // ==================== ADMIN ORG MANAGEMENT ====================

    /**
     * List all admin org
     */
    public function listAdmins(Request $request)
    {
        $query = User::adminOrg()->with('organization');

        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->has('organization_id')) {
            $query->where('organization_id', $request->organization_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $admins = $query->latest()->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $admins,
        ]);
    }

    /**
     * Create admin org
     */
    public function createAdmin(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'organization_id' => 'required|exists:organizations,id',
            'phone' => 'nullable|string|max:20',
        ]);

        $admin = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password,
            'role' => User::ROLE_ADMIN_ORG,
            'organization_id' => $request->organization_id,
            'phone' => $request->phone,
            'status' => 'active',
        ]);

        AuditLog::log(
            'create',
            "Membuat admin organisasi baru: {$admin->name}",
            'User',
            $admin->id,
            null,
            $admin->toArray()
        );

        return response()->json([
            'success' => true,
            'message' => 'Admin organisasi berhasil dibuat',
            'data' => $admin->load('organization'),
        ], 201);
    }

    /**
     * Reset admin password
     */
    public function resetAdminPassword(Request $request, User $admin)
    {
        if ($admin->role !== User::ROLE_ADMIN_ORG) {
            return response()->json([
                'success' => false,
                'message' => 'User bukan admin organisasi',
            ], 400);
        }

        $request->validate([
            'password' => 'required|string|min:8',
        ]);

        $admin->password = $request->password;
        $admin->save();

        AuditLog::log(
            'password_reset',
            "Reset password admin: {$admin->name}",
            'User',
            $admin->id
        );

        return response()->json([
            'success' => true,
            'message' => 'Password admin berhasil direset',
        ]);
    }

    /**
     * Suspend/Activate admin
     */
    public function toggleAdminStatus(User $admin)
    {
        if ($admin->role !== User::ROLE_ADMIN_ORG) {
            return response()->json([
                'success' => false,
                'message' => 'User bukan admin organisasi',
            ], 400);
        }

        $oldStatus = $admin->status;
        $admin->status = $admin->status === 'active' ? 'suspended' : 'active';
        $admin->save();

        $action = $admin->status === 'active' ? 'mengaktifkan' : 'menonaktifkan';

        AuditLog::log(
            'status_change',
            "Admin Master {$action} akun: {$admin->name}",
            'User',
            $admin->id,
            ['status' => $oldStatus],
            ['status' => $admin->status]
        );

        return response()->json([
            'success' => true,
            'message' => 'Status admin berhasil diubah',
            'data' => $admin->fresh(),
        ]);
    }

    // ==================== MONITORING ====================

    /**
     * Get all items (read-only)
     */
    public function allItems(Request $request)
    {
        $query = \App\Models\Item::with('organization');

        if ($request->has('organization_id')) {
            $query->where('organization_id', $request->organization_id);
        }

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $items = $query->latest()->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $items,
        ]);
    }

    /**
     * Get all loans (read-only)
     */
    public function allLoans(Request $request)
    {
        $query = \App\Models\Loan::with(['item', 'organization', 'verifier']);

        if ($request->has('organization_id')) {
            $query->where('organization_id', $request->organization_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $query->where('borrower_name', 'like', '%' . $request->search . '%');
        }

        $loans = $query->latest()->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $loans,
        ]);
    }

    /**
     * Get audit logs
     */
    public function auditLogs(Request $request)
    {
        $query = AuditLog::with('user');

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('action')) {
            $query->where('action', $request->action);
        }

        if ($request->has('model_type')) {
            $query->where('model_type', $request->model_type);
        }

        $logs = $query->latest()->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $logs,
        ]);
    }
}
