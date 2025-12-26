<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Item;
use App\Models\Loan;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class AdminOrgController extends Controller
{
    /**
     * Dashboard statistics for organization
     */
    public function dashboard(Request $request)
    {
        $user = $request->user();
        $orgId = $user->organization_id;

        $stats = [
            'total_items' => Item::byOrganization($orgId)->count(),
            'loanable_items' => Item::byOrganization($orgId)->loanable()->count(),
            'total_loans' => Loan::byOrganization($orgId)->count(),
            'pending_loans' => Loan::byOrganization($orgId)->pending()->count(),
            'active_loans' => Loan::byOrganization($orgId)->borrowed()->count(),
            'return_pending' => Loan::byOrganization($orgId)->returnPending()->count(),
            'completed_loans' => Loan::byOrganization($orgId)->completed()->count(),
        ];

        $recentLoans = Loan::with('item')
            ->byOrganization($orgId)
            ->latest()
            ->take(5)
            ->get();

        $pendingLoans = Loan::with('item')
            ->byOrganization($orgId)
            ->pending()
            ->latest()
            ->take(5)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => $stats,
                'recent_loans' => $recentLoans,
                'pending_loans' => $pendingLoans,
            ],
        ]);
    }

    // ==================== ITEM MANAGEMENT ====================

    /**
     * List items for organization
     */
    public function listItems(Request $request)
    {
        $user = $request->user();
        $query = Item::byOrganization($user->organization_id);

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('code', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->has('is_loanable')) {
            $query->where('is_loanable', $request->boolean('is_loanable'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $items = $query->latest()->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $items,
        ]);
    }

    /**
     * Create item
     */
    public function createItem(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'stock' => 'required|integer|min:0',
            'condition' => 'required|in:good,fair,poor',
            'image' => 'nullable|image|max:2048',
            'is_loanable' => 'required|boolean',
            'not_loanable_reason' => 'nullable|required_if:is_loanable,false|string',
        ]);

        $data = $request->except('image');
        $data['organization_id'] = $user->organization_id;
        $data['available_stock'] = $request->stock;

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('items', 'public');
        }

        $item = Item::create($data);

        AuditLog::log(
            'create',
            "Membuat barang baru: {$item->name}",
            'Item',
            $item->id,
            null,
            $item->toArray()
        );

        return response()->json([
            'success' => true,
            'message' => 'Barang berhasil ditambahkan',
            'data' => $item,
        ], 201);
    }

    /**
     * Show item detail
     */
    public function showItem(Request $request, Item $item)
    {
        $user = $request->user();

        if ($item->organization_id !== $user->organization_id) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak',
            ], 403);
        }

        $item->load(['loans' => function ($q) {
            $q->latest()->take(10);
        }]);

        return response()->json([
            'success' => true,
            'data' => $item,
        ]);
    }

    /**
     * Update item
     */
    public function updateItem(Request $request, Item $item)
    {
        $user = $request->user();

        if ($item->organization_id !== $user->organization_id) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak',
            ], 403);
        }

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'category' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'stock' => 'sometimes|integer|min:0',
            'condition' => 'sometimes|in:good,fair,poor',
            'image' => 'nullable|image|max:2048',
            'is_loanable' => 'sometimes|boolean',
            'not_loanable_reason' => 'nullable|string',
            'status' => 'sometimes|in:active,inactive',
        ]);

        $oldValues = $item->toArray();
        $data = $request->except('image');

        // Adjust available stock if stock is changed
        if ($request->has('stock')) {
            $stockDiff = $request->stock - $item->stock;
            $data['available_stock'] = max(0, $item->available_stock + $stockDiff);
        }

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('items', 'public');
        }

        $item->update($data);

        AuditLog::log(
            'update',
            "Memperbarui barang: {$item->name}",
            'Item',
            $item->id,
            $oldValues,
            $item->fresh()->toArray()
        );

        return response()->json([
            'success' => true,
            'message' => 'Barang berhasil diperbarui',
            'data' => $item->fresh(),
        ]);
    }

    /**
     * Delete (soft) item
     */
    public function deleteItem(Request $request, Item $item)
    {
        $user = $request->user();

        if ($item->organization_id !== $user->organization_id) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak',
            ], 403);
        }

        $oldValues = $item->toArray();
        $item->delete();

        AuditLog::log(
            'delete',
            "Menghapus barang: {$item->name}",
            'Item',
            $item->id,
            $oldValues,
            null
        );

        return response()->json([
            'success' => true,
            'message' => 'Barang berhasil dihapus',
        ]);
    }

    /**
     * Get item categories
     */
    public function getCategories(Request $request)
    {
        $user = $request->user();
        
        $categories = Item::byOrganization($user->organization_id)
            ->whereNotNull('category')
            ->where('category', '!=', '')
            ->distinct()
            ->orderBy('category')
            ->pluck('category');

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }

    /**
     * Export items to CSV (Excel compatible)
     */
    public function exportItems(Request $request)
    {
        $user = $request->user();
        $items = Item::byOrganization($user->organization_id)->latest()->get();

        $headers = [
            "Content-type" => "text/csv",
            "Content-Disposition" => "attachment; filename=items_export_" . date('Y-m-d_H-i-s') . ".csv",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        $callback = function() use ($items) {
            $file = fopen('php://output', 'w');
            
            // Add BOM for Excel UTF-8 compatibility
            fputs($file, "\xEF\xBB\xBF");

            // Header Row
            fputcsv($file, ['Kode Barang', 'Nama Barang', 'Kategori', 'Stok Total', 'Stok Tersedia', 'Kondisi', 'Status Pinjam', 'Keterangan']);

            foreach ($items as $item) {
                fputcsv($file, [
                    $item->code,
                    $item->name,
                    $item->category,
                    $item->stock,
                    $item->available_stock,
                    $this->translateCondition($item->condition),
                    $item->is_loanable ? 'Bisa Dipinjam' : 'Tidak Bisa Dipinjam',
                    $item->description
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    private function translateCondition($condition)
    {
        return match ($condition) {
            'good' => 'Baik',
            'fair' => 'Cukup',
            'poor' => 'Kurang (Rusak)',
            default => $condition,
        };
    }

    // ==================== LOAN VERIFICATION ====================

    /**
     * List pending loans
     */
    public function pendingLoans(Request $request)
    {
        $user = $request->user();
        
        $loans = Loan::with('item')
            ->byOrganization($user->organization_id)
            ->pending()
            ->latest()
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $loans,
        ]);
    }

    /**
     * Show loan detail
     */
    public function showLoan(Request $request, Loan $loan)
    {
        $user = $request->user();

        if ($loan->organization_id !== $user->organization_id) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak',
            ], 403);
        }

        $loan->load(['item', 'verifier', 'returnChecker']);

        return response()->json([
            'success' => true,
            'data' => $loan,
        ]);
    }

    /**
     * Approve loan
     */
    public function approveLoan(Request $request, Loan $loan)
    {
        $user = $request->user();

        if ($loan->organization_id !== $user->organization_id) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak',
            ], 403);
        }

        if ($loan->status !== Loan::STATUS_PENDING) {
            return response()->json([
                'success' => false,
                'message' => 'Peminjaman tidak dalam status menunggu verifikasi',
            ], 400);
        }

        $loan->approve($user);

        AuditLog::log(
            'approve',
            "Menyetujui peminjaman: {$loan->loan_code} oleh {$loan->borrower_name}",
            'Loan',
            $loan->id
        );

        return response()->json([
            'success' => true,
            'message' => 'Peminjaman berhasil disetujui',
            'data' => $loan->fresh()->load('item'),
        ]);
    }

    /**
     * Reject loan
     */
    public function rejectLoan(Request $request, Loan $loan)
    {
        $user = $request->user();

        if ($loan->organization_id !== $user->organization_id) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak',
            ], 403);
        }

        if ($loan->status !== Loan::STATUS_PENDING) {
            return response()->json([
                'success' => false,
                'message' => 'Peminjaman tidak dalam status menunggu verifikasi',
            ], 400);
        }

        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $loan->reject($user, $request->reason);

        AuditLog::log(
            'reject',
            "Menolak peminjaman: {$loan->loan_code} dengan alasan: {$request->reason}",
            'Loan',
            $loan->id
        );

        return response()->json([
            'success' => true,
            'message' => 'Peminjaman berhasil ditolak',
            'data' => $loan->fresh(),
        ]);
    }

    // ==================== RETURN VERIFICATION ====================

    /**
     * List return pending
     */
    public function returnPendingLoans(Request $request)
    {
        $user = $request->user();
        
        $loans = Loan::with('item')
            ->byOrganization($user->organization_id)
            ->returnPending()
            ->latest()
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $loans,
        ]);
    }

    /**
     * Complete return
     */
    public function completeReturn(Request $request, Loan $loan)
    {
        $user = $request->user();

        if ($loan->organization_id !== $user->organization_id) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak',
            ], 403);
        }

        if ($loan->status !== Loan::STATUS_RETURN_PENDING) {
            return response()->json([
                'success' => false,
                'message' => 'Peminjaman tidak dalam status menunggu cek pengembalian',
            ], 400);
        }

        $request->validate([
            'condition' => 'required|in:normal,damaged,lost',
            'notes' => 'nullable|string',
        ]);

        if ($request->has('notes')) {
            $loan->return_condition_notes = $request->notes;
            $loan->save();
        }

        $loan->completeReturn($user, $request->condition);

        $conditionLabel = match($request->condition) {
            'damaged' => 'Rusak',
            'lost' => 'Hilang',
            default => 'Normal',
        };

        AuditLog::log(
            'return_complete',
            "Menyelesaikan pengembalian: {$loan->loan_code} - Kondisi: {$conditionLabel}",
            'Loan',
            $loan->id
        );

        return response()->json([
            'success' => true,
            'message' => 'Pengembalian berhasil diselesaikan',
            'data' => $loan->fresh()->load('item'),
        ]);
    }

    // ==================== ALL LOANS ====================

    /**
     * List all loans for organization
     */
    public function allLoans(Request $request)
    {
        $user = $request->user();
        $query = Loan::with('item')->byOrganization($user->organization_id);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('borrower_name', 'like', '%' . $request->search . '%')
                  ->orWhere('loan_code', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->has('date_from')) {
            $query->whereDate('loan_date', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('loan_date', '<=', $request->date_to);
        }

        $loans = $query->latest()->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $loans,
        ]);
    }

    // ==================== REPORTS ====================

    /**
     * Inventory report
     */
    public function inventoryReport(Request $request)
    {
        $user = $request->user();
        
        $items = Item::byOrganization($user->organization_id)
            ->withCount([
                'loans',
                'loans as active_loans_count' => function ($q) {
                    $q->where('status', Loan::STATUS_BORROWED);
                },
            ])
            ->get();

        $summary = [
            'total_items' => $items->count(),
            'total_stock' => $items->sum('stock'),
            'available_stock' => $items->sum('available_stock'),
            'loanable_items' => $items->where('is_loanable', true)->count(),
            'non_loanable_items' => $items->where('is_loanable', false)->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'summary' => $summary,
                'items' => $items,
            ],
        ]);
    }

    /**
     * Loan report
     */
    public function loanReport(Request $request)
    {
        $user = $request->user();
        
        $request->validate([
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2020|max:2100',
        ]);

        $month = $request->month;
        $year = $request->year;

        $loans = Loan::with('item')
            ->byOrganization($user->organization_id)
            ->whereMonth('loan_date', $month)
            ->whereYear('loan_date', $year)
            ->get();

        $summary = [
            'total_loans' => $loans->count(),
            'approved' => $loans->where('status', '!=', Loan::STATUS_PENDING)
                               ->where('status', '!=', Loan::STATUS_REJECTED)->count(),
            'rejected' => $loans->where('status', Loan::STATUS_REJECTED)->count(),
            'completed' => $loans->whereIn('status', [
                Loan::STATUS_COMPLETED,
                Loan::STATUS_COMPLETED_DAMAGED,
                Loan::STATUS_COMPLETED_LOST
            ])->count(),
            'damaged' => $loans->where('status', Loan::STATUS_COMPLETED_DAMAGED)->count(),
            'lost' => $loans->where('status', Loan::STATUS_COMPLETED_LOST)->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'period' => [
                    'month' => $month,
                    'year' => $year,
                ],
                'summary' => $summary,
                'loans' => $loans,
            ],
        ]);
    }
}
