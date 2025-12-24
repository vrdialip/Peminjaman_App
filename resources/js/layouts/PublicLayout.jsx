import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Package, Home, Search, ArrowLeft } from 'lucide-react';
import clsx from 'clsx';

export function PublicLayout({ children, orgSlug = null, orgName = null }) {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-gradient-dark">
            {/* Header */}
            <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="h-16 flex items-center justify-between">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                                <Package className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="font-bold text-white">
                                    {orgName || 'Sistem Peminjaman'}
                                </h1>
                                <p className="text-xs text-white/50">
                                    {orgSlug ? 'Inventaris Organisasi' : 'Pilih Organisasi'}
                                </p>
                            </div>
                        </Link>

                        {/* Nav */}
                        <nav className="flex items-center gap-2">
                            {orgSlug && (
                                <Link
                                    to="/"
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-white/70 hover:bg-white/5 hover:text-white transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    <span className="hidden sm:inline">Ganti Organisasi</span>
                                </Link>
                            )}
                            <Link
                                to="/check-status"
                                className={clsx(
                                    'flex items-center gap-2 px-4 py-2 rounded-xl transition-colors',
                                    location.pathname === '/check-status'
                                        ? 'bg-gradient-primary text-white'
                                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                                )}
                            >
                                <Search className="w-4 h-4" />
                                <span className="hidden sm:inline">Cek Status</span>
                            </Link>
                            <Link
                                to="/login"
                                className="px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
                            >
                                Login Admin
                            </Link>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main>
                {children}
            </main>

            {/* Footer */}
            <footer className="border-t border-white/10 py-8 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
                    <p className="text-white/40 text-sm">
                        © {new Date().getFullYear()} Sistem Peminjaman Barang Organisasi
                    </p>
                </div>
            </footer>
        </div>
    );
}
