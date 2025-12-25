<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Models\Item;
use App\Models\Loan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Notification;
use App\Models\User;
use App\Notifications\NewLoanRequest;

class PublicController extends Controller
{
    /**
     * List all active organizations
     */
    public function organizations()
    {
        $organizations = Organization::active()
            ->withCount(['items' => function ($q) {
                $q->loanable();
            }])
            ->get();

        return response()->json([
            'success' => true,
            'data' => $organizations,
        ]);
    }

    /**
     * Show organization detail
     */
    public function showOrganization(string $slug)
    {
        $organization = Organization::where('slug', $slug)
            ->active()
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => $organization,
        ]);
    }

    /**
     * List items for organization
     */
    public function items(string $slug, Request $request)
    {
        $organization = Organization::where('slug', $slug)
            ->active()
            ->firstOrFail();

        $query = Item::byOrganization($organization->id)->active();

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        // By default show all items, both loanable and non-loanable
        // But mark which ones can be borrowed
        $items = $query->latest()->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $items,
        ]);
    }

    /**
     * Get loanable items only
     */
    public function loanableItems(string $slug, Request $request)
    {
        $organization = Organization::where('slug', $slug)
            ->active()
            ->firstOrFail();

        $query = Item::byOrganization($organization->id)->loanable();

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        $items = $query->latest()->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $items,
        ]);
    }

    /**
     * Get item detail
     */
    public function showItem(string $slug, int $itemId)
    {
        $organization = Organization::where('slug', $slug)
            ->active()
            ->firstOrFail();

        $item = Item::where('id', $itemId)
            ->byOrganization($organization->id)
            ->active()
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => $item,
        ]);
    }

    /**
     * Get item categories
     */
    public function categories(string $slug)
    {
        $organization = Organization::where('slug', $slug)
            ->active()
            ->firstOrFail();

        $categories = Item::byOrganization($organization->id)
            ->active()
            ->whereNotNull('category')
            ->distinct()
            ->pluck('category');

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }

    /**
     * Submit loan request (User tanpa login)
     */
    public function submitLoan(string $slug, Request $request)
    {
        $organization = Organization::where('slug', $slug)
            ->active()
            ->firstOrFail();

        $request->validate([
            'item_id' => 'required|exists:items,id',
            'borrower_name' => 'required|string|max:255',
            'borrower_class' => 'nullable|string|max:100',
            'borrower_organization' => 'nullable|string|max:255',
            'borrower_phone' => 'required|string|max:20',
            'borrower_photo' => 'required|string', // Base64 image
            'quantity' => 'sometimes|integer|min:1',
            'loan_purpose' => 'nullable|string|max:500',
            'expected_return_date' => 'nullable|date|after:today',
        ]);

        // Validate item
        $item = Item::where('id', $request->item_id)
            ->byOrganization($organization->id)
            ->active()
            ->firstOrFail();

        // Check if item is loanable
        if (!$item->is_loanable) {
            return response()->json([
                'success' => false,
                'message' => 'Barang ini tidak dapat dipinjam',
                'reason' => $item->not_loanable_reason,
            ], 400);
        }

        $quantity = $request->get('quantity', 1);

        // Check stock availability
        if ($item->available_stock < $quantity) {
            return response()->json([
                'success' => false,
                'message' => 'Stok barang tidak mencukupi',
                'available' => $item->available_stock,
            ], 400);
        }

        // Process base64 image
        $photoPath = $this->saveBase64Image($request->borrower_photo, 'loan_photos');
        
        if (!$photoPath) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan foto. Pastikan foto valid.',
            ], 400);
        }

        // Create loan
        $loan = Loan::create([
            'item_id' => $item->id,
            'organization_id' => $organization->id,
            'borrower_name' => $request->borrower_name,
            'borrower_class' => $request->borrower_class,
            'borrower_organization' => $request->borrower_organization,
            'borrower_phone' => $request->borrower_phone,
            'borrower_photo' => $photoPath,
            'quantity' => $quantity,
            'loan_purpose' => $request->loan_purpose,
            'expected_return_date' => $request->expected_return_date,
            'status' => Loan::STATUS_PENDING,
        ]);

        // Send notification to Organization Admins
        try {
            $admins = User::where('organization_id', $organization->id)
                ->where('role', 'admin_org')
                ->get();
            
            if ($admins->count() > 0) {
                Notification::send($admins, new NewLoanRequest($loan));
            }
        } catch (\Exception $e) {
            // Log error but don't fail the request
            \Log::error('Failed to send notification: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Peminjaman berhasil diajukan. Tunggu verifikasi dari admin.',
            'data' => [
                'loan_code' => $loan->loan_code,
                'status' => $loan->status_label,
                'item' => $item->name,
            ],
        ], 201);
    }

    /**
     * Check loan status by code
     */
    public function checkLoanStatus(Request $request)
    {
        $request->validate([
            'loan_code' => 'required|string',
        ]);

        $loan = Loan::with('item')
            ->where('loan_code', $request->loan_code)
            ->first();

        if (!$loan) {
            return response()->json([
                'success' => false,
                'message' => 'Kode peminjaman tidak ditemukan',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'loan_code' => $loan->loan_code,
                'item' => $loan->item->name,
                'borrower_name' => $loan->borrower_name,
                'status' => $loan->status,
                'status_label' => $loan->status_label,
                'loan_date' => $loan->loan_date,
                'rejection_reason' => $loan->rejection_reason,
                'can_return' => $loan->status === Loan::STATUS_BORROWED,
            ],
        ]);
    }

    /**
     * Submit return (User tanpa login)
     */
    public function submitReturn(Request $request)
    {
        $request->validate([
            'loan_code' => 'required|string',
            'return_photo' => 'required|string', // Base64 image
            'notes' => 'nullable|string|max:500',
        ]);

        $loan = Loan::where('loan_code', $request->loan_code)->first();

        if (!$loan) {
            return response()->json([
                'success' => false,
                'message' => 'Kode peminjaman tidak ditemukan',
            ], 404);
        }

        if ($loan->status !== Loan::STATUS_BORROWED) {
            return response()->json([
                'success' => false,
                'message' => 'Peminjaman tidak dalam status dipinjam. Status saat ini: ' . $loan->status_label,
            ], 400);
        }

        // Process base64 image
        $photoPath = $this->saveBase64Image($request->return_photo, 'return_photos');
        
        if (!$photoPath) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan foto. Pastikan foto valid.',
            ], 400);
        }

        $loan->submitReturn($photoPath, $request->notes);

        return response()->json([
            'success' => true,
            'message' => 'Pengembalian berhasil diajukan. Tunggu pengecekan dari admin.',
            'data' => [
                'loan_code' => $loan->loan_code,
                'status' => $loan->status_label,
            ],
        ]);
    }

    /**
     * Helper to save base64 image
     */
    private function saveBase64Image(string $base64Image, string $folder): ?string
    {
        try {
            // Remove data:image/xxx;base64, prefix if exists
            if (preg_match('/^data:image\/(\w+);base64,/', $base64Image, $matches)) {
                $extension = $matches[1];
                $base64Image = substr($base64Image, strpos($base64Image, ',') + 1);
            } else {
                $extension = 'jpg';
            }

            $image = base64_decode($base64Image);
            
            if ($image === false) {
                return null;
            }

            $filename = $folder . '/' . uniqid() . '_' . time() . '.' . $extension;
            
            Storage::disk('public')->put($filename, $image);

            return $filename;
        } catch (\Exception $e) {
            return null;
        }
    }
}
