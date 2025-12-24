<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMasterMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 401);
        }

        if (!$request->user()->isAdminMaster()) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak. Hanya Admin Master yang dapat mengakses.',
            ], 403);
        }

        if (!$request->user()->isActive()) {
            return response()->json([
                'success' => false,
                'message' => 'Akun Anda telah dinonaktifkan.',
            ], 403);
        }

        return $next($request);
    }
}
