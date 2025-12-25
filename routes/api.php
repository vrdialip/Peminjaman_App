<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AdminMasterController;
use App\Http\Controllers\Api\AdminOrgController;

use App\Http\Controllers\Api\PublicController;
use App\Http\Controllers\Api\NotificationController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// ==================== PUBLIC ROUTES (User Tanpa Login) ====================

Route::prefix('public')->group(function () {
    // Organizations
    Route::get('/organizations', [PublicController::class, 'organizations']);
    Route::get('/organizations/{slug}', [PublicController::class, 'showOrganization']);
    
    // Items
    Route::get('/organizations/{slug}/items', [PublicController::class, 'items']);
    Route::get('/organizations/{slug}/items/loanable', [PublicController::class, 'loanableItems']);
    Route::get('/organizations/{slug}/items/{item}', [PublicController::class, 'showItem']);
    Route::get('/organizations/{slug}/categories', [PublicController::class, 'categories']);
    
    // Loan Operations
    Route::post('/organizations/{slug}/loans', [PublicController::class, 'submitLoan']);
    Route::post('/loans/check-status', [PublicController::class, 'checkLoanStatus']);
    Route::post('/loans/return', [PublicController::class, 'submitReturn']);
});

// ==================== AUTH ROUTES ====================

Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::put('/profile', [AuthController::class, 'updateProfile']);
        Route::put('/profile', [AuthController::class, 'updateProfile']);
        Route::put('/password', [AuthController::class, 'changePassword']);
        
        // Notifications
        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
        Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::put('/notifications/read-all', [NotificationController::class, 'markAllRead']);
    });
});

// ==================== ADMIN MASTER ROUTES ====================

Route::prefix('admin-master')->middleware(['auth:sanctum', 'admin.master'])->group(function () {
    // Dashboard
    Route::get('/dashboard', [AdminMasterController::class, 'dashboard']);
    
    // Organizations
    Route::get('/organizations', [AdminMasterController::class, 'listOrganizations']);
    Route::post('/organizations', [AdminMasterController::class, 'createOrganization']);
    Route::get('/organizations/{organization}', [AdminMasterController::class, 'showOrganization']);
    Route::put('/organizations/{organization}', [AdminMasterController::class, 'updateOrganization']);
    Route::delete('/organizations/{organization}', [AdminMasterController::class, 'deleteOrganization']);
    
    // Admin Org Management
    Route::get('/admins', [AdminMasterController::class, 'listAdmins']);
    Route::post('/admins', [AdminMasterController::class, 'createAdmin']);
    Route::put('/admins/{admin}', [AdminMasterController::class, 'updateAdmin']);
    Route::put('/admins/{admin}/reset-password', [AdminMasterController::class, 'resetAdminPassword']);
    Route::put('/admins/{admin}/toggle-status', [AdminMasterController::class, 'toggleAdminStatus']);
    Route::delete('/admins/{admin}', [AdminMasterController::class, 'deleteAdmin']);
    
    // Monitoring (Read Only)
    Route::get('/items', [AdminMasterController::class, 'allItems']);
    Route::get('/loans', [AdminMasterController::class, 'allLoans']);
    Route::get('/audit-logs', [AdminMasterController::class, 'auditLogs']);
});

// ==================== ADMIN ORG ROUTES ====================

Route::prefix('admin-org')->middleware(['auth:sanctum', 'admin.org'])->group(function () {
    // Dashboard
    Route::get('/dashboard', [AdminOrgController::class, 'dashboard']);
    
    // Items Management
    Route::get('/items/export', [AdminOrgController::class, 'exportItems']);
    Route::get('/items', [AdminOrgController::class, 'listItems']);
    Route::post('/items', [AdminOrgController::class, 'createItem']);
    Route::get('/items/{item}', [AdminOrgController::class, 'showItem']);
    Route::put('/items/{item}', [AdminOrgController::class, 'updateItem']);
    Route::delete('/items/{item}', [AdminOrgController::class, 'deleteItem']);
    Route::get('/categories', [AdminOrgController::class, 'getCategories']);
    
    // Loan Verification
    Route::get('/loans/pending', [AdminOrgController::class, 'pendingLoans']);
    Route::get('/loans/{loan}', [AdminOrgController::class, 'showLoan']);
    Route::post('/loans/{loan}/approve', [AdminOrgController::class, 'approveLoan']);
    Route::post('/loans/{loan}/reject', [AdminOrgController::class, 'rejectLoan']);
    
    // Return Verification
    Route::get('/returns/pending', [AdminOrgController::class, 'returnPendingLoans']);
    Route::post('/returns/{loan}/complete', [AdminOrgController::class, 'completeReturn']);
    
    // All Loans
    Route::get('/loans', [AdminOrgController::class, 'allLoans']);
    
    // Reports
    Route::get('/reports/inventory', [AdminOrgController::class, 'inventoryReport']);
    Route::get('/reports/loans', [AdminOrgController::class, 'loanReport']);
});
