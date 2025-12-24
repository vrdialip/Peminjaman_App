import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, RotateCcw, CheckCircle, TrendingUp, AlertCircle, ArrowRight } from 'lucide-react';
import { AdminOrgLayout } from '@/layouts/AdminOrgLayout';
import { adminOrgApi } from '@/lib/api';
import { Card, Spinner, StatusBadge, Badge } from '@/components/ui';

export function AdminOrgDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const { data: res } = await adminOrgApi.dashboard();
            setData(res.data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <AdminOrgLayout>
                <div className="flex justify-center py-20">
                    <Spinner size="lg" />
                </div>
            </AdminOrgLayout>
        );
    }

    const stats = data?.stats || {};
    const pendingLoans = data?.pending_loans || [];
    const recentLoans = data?.recent_loans || [];

    const statCards = [
        { icon: Package, label: 'Total Barang', value: stats.total_items, color: 'emerald', subtext: `${stats.loanable_items || 0} bisa dipinjam` },
        { icon: Clock, label: 'Menunggu Verifikasi', value: stats.pending_loans, color: 'yellow', link: '/admin-org/loans/pending' },
        { icon: TrendingUp, label: 'Sedang Dipinjam', value: stats.active_loans, color: 'blue' },
        { icon: RotateCcw, label: 'Menunggu Cek Kembali', value: stats.return_pending, color: 'orange', link: '/admin-org/returns/pending' },
        { icon: CheckCircle, label: 'Selesai', value: stats.completed_loans, color: 'green' },
    ];

    return (
        <AdminOrgLayout>
            <div className="space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                    <p className="text-white/60">Ringkasan aktivitas peminjaman organisasi</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    {statCards.map((stat, index) => (
                        <Card key={index} className="relative overflow-hidden">
                            {stat.link ? (
                                <Link to={stat.link} className="block">
                                    <StatCardContent stat={stat} />
                                </Link>
                            ) : (
                                <StatCardContent stat={stat} />
                            )}
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Pending Loans */}
                    <Card>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-white">Menunggu Verifikasi</h2>
                            {pendingLoans.length > 0 && (
                                <Link to="/admin-org/loans/pending" className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                                    Lihat semua <ArrowRight className="w-4 h-4" />
                                </Link>
                            )}
                        </div>

                        {pendingLoans.length === 0 ? (
                            <div className="text-center py-8">
                                <CheckCircle className="w-12 h-12 mx-auto text-emerald-400/50 mb-2" />
                                <p className="text-white/50">Tidak ada peminjaman yang menunggu</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {pendingLoans.map((loan) => (
                                    <div key={loan.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                                                <Clock className="w-5 h-5 text-yellow-400" />
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">{loan.borrower_name}</p>
                                                <p className="text-sm text-white/50">{loan.item?.name}</p>
                                            </div>
                                        </div>
                                        <Link to={`/admin-org/loans/${loan.id}`}>
                                            <Badge variant="warning">Verifikasi</Badge>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    {/* Recent Loans */}
                    <Card>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-white">Peminjaman Terbaru</h2>
                            <Link to="/admin-org/loans" className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                                Lihat semua <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                        {recentLoans.length === 0 ? (
                            <div className="text-center py-8">
                                <Package className="w-12 h-12 mx-auto text-white/20 mb-2" />
                                <p className="text-white/50">Belum ada peminjaman</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentLoans.map((loan) => (
                                    <div key={loan.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                                        <div>
                                            <p className="text-white font-medium">{loan.borrower_name}</p>
                                            <p className="text-sm text-white/50">{loan.item?.name}</p>
                                        </div>
                                        <StatusBadge status={loan.status} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </AdminOrgLayout>
    );
}

function StatCardContent({ stat }) {
    return (
        <>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-white/60 text-sm">{stat.label}</p>
                    <p className="text-3xl font-bold text-white mt-1">{stat.value || 0}</p>
                    {stat.subtext && (
                        <p className="text-xs text-white/40 mt-1">{stat.subtext}</p>
                    )}
                </div>
                <div className={`w-12 h-12 rounded-xl bg-${stat.color}-500/20 flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                </div>
            </div>
            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-${stat.color}-500 to-${stat.color}-400`} />
        </>
    );
}
