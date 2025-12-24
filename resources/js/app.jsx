import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useAuthStore } from '@/stores/authStore';
import { LoadingScreen, Spinner } from '@/components/ui';

// Pages - Public
import { HomePage } from '@/pages/public/HomePage';
import { OrganizationItemsPage } from '@/pages/public/OrganizationItemsPage';
import { BorrowPage } from '@/pages/public/BorrowPage';
import { CheckStatusPage } from '@/pages/public/CheckStatusPage';
import { LoginPage } from '@/pages/LoginPage';

// Pages - Admin Master
import { AdminMasterDashboard } from '@/pages/admin-master/Dashboard';
import { OrganizationsPage } from '@/pages/admin-master/OrganizationsPage';
import { AdminsPage } from '@/pages/admin-master/AdminsPage';

// Pages - Admin Org
import { AdminOrgDashboard } from '@/pages/admin-org/Dashboard';
import { ItemsPage } from '@/pages/admin-org/ItemsPage';
import { LoanDetailPage } from '@/pages/admin-org/LoanDetailPage';
import { PendingLoansPage, ReturnPendingPage, AllLoansPage } from '@/pages/admin-org/LoansPages';
import { ReportsPage } from '@/pages/admin-org/ReportsPage';

import '../css/app.css';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

// Protected Route for Admin Master
function AdminMasterRoute() {
    const { user, isAuthenticated, checkAuth } = useAuthStore();
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        checkAuth().finally(() => setChecking(false));
    }, []);

    if (checking) {
        return <LoadingScreen />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (user?.role !== 'admin_master') {
        return <Navigate to="/admin-org" replace />;
    }

    return <Outlet />;
}

// Protected Route for Admin Org
function AdminOrgRoute() {
    const { user, isAuthenticated, checkAuth } = useAuthStore();
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        checkAuth().finally(() => setChecking(false));
    }, []);

    if (checking) {
        return <LoadingScreen />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (user?.role !== 'admin_org') {
        return <Navigate to="/admin-master" replace />;
    }

    return <Outlet />;
}

// Auth Route (redirect if already logged in)
function AuthRoute() {
    const { user, isAuthenticated, checkAuth } = useAuthStore();
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        checkAuth().finally(() => setChecking(false));
    }, []);

    if (checking) {
        return <LoadingScreen />;
    }

    if (isAuthenticated) {
        return <Navigate to={user?.role === 'admin_master' ? '/admin-master' : '/admin-org'} replace />;
    }

    return <Outlet />;
}

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/org/:slug" element={<OrganizationItemsPage />} />
                    <Route path="/org/:slug/borrow/:itemId" element={<BorrowPage />} />
                    <Route path="/check-status" element={<CheckStatusPage />} />

                    {/* Auth Routes */}
                    <Route element={<AuthRoute />}>
                        <Route path="/login" element={<LoginPage />} />
                    </Route>

                    {/* Admin Master Routes */}
                    <Route element={<AdminMasterRoute />}>
                        <Route path="/admin-master" element={<AdminMasterDashboard />} />
                        <Route path="/admin-master/organizations" element={<OrganizationsPage />} />
                        <Route path="/admin-master/admins" element={<AdminsPage />} />
                        {/* Add more admin master routes as needed */}
                    </Route>

                    {/* Admin Org Routes */}
                    <Route element={<AdminOrgRoute />}>
                        <Route path="/admin-org" element={<AdminOrgDashboard />} />
                        <Route path="/admin-org/items" element={<ItemsPage />} />
                        <Route path="/admin-org/loans/pending" element={<PendingLoansPage />} />
                        <Route path="/admin-org/returns/pending" element={<ReturnPendingPage />} />
                        <Route path="/admin-org/loans" element={<AllLoansPage />} />
                        <Route path="/admin-org/loans/:id" element={<LoanDetailPage />} />
                        <Route path="/admin-org/reports" element={<ReportsPage />} />
                    </Route>

                    {/* 404 */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>

            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#1e293b',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.1)',
                    },
                    success: {
                        iconTheme: {
                            primary: '#10b981',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                        },
                    },
                }}
            />
        </QueryClientProvider>
    );
}

// Mount React App
const container = document.getElementById('app');
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}
