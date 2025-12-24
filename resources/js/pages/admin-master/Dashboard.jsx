import React, { useEffect, useState } from 'react';
import { Building2, Users, Package, FileText, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { AdminMasterLayout } from '@/layouts/AdminMasterLayout';
import { adminMasterApi } from '@/lib/api';
import { Card, Spinner, StatusBadge } from '@/components/ui';

export function AdminMasterDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const { data: res } = await adminMasterApi.dashboard();
            setData(res.data);
        } catch (error) {
            console.error('Error fetching dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <AdminMasterLayout>
                <div className="flex justify-center py-20">
                    <Spinner size="lg" />
                </div>
            </AdminMasterLayout>
        );
    }

    const stats = data?.stats || {};
    const recentLogs = data?.recent_logs || [];

    const statCards = [
        { icon: Building2, label: 'Total Organisasi', value: stats.total_organizations, color: 'indigo' },
        { icon: Users, label: 'Admin Organisasi', value: stats.total_admins, color: 'purple' },
        { icon: Package, label: 'Total Barang', value: stats.total_items, color: 'emerald' },
        { icon: FileText, label: 'Total Peminjaman', value: stats.total_loans, color: 'amber' },
        { icon: Clock, label: 'Menunggu Verifikasi', value: stats.pending_loans, color: 'orange' },
        { icon: CheckCircle, label: 'Sedang Dipinjam', value: stats.active_loans, color: 'blue' },
    ];

    return (
        <AdminMasterLayout>
            <div className="space-y-8">
                {/* Page Header */}
                <div>
                    <h1 className="text-2xl font-bold text-white">Dashboard Admin Master</h1>
                    <p className="text-white/60">Pantau seluruh aktivitas sistem peminjaman</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {statCards.map((stat, index) => (
                        <Card key={index} className="relative overflow-hidden">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-white/60 text-sm">{stat.label}</p>
                                    <p className="text-3xl font-bold text-white mt-1">{stat.value || 0}</p>
                                </div>
                                <div className={`w-12 h-12 rounded-xl bg-${stat.color}-500/20 flex items-center justify-center`}>
                                    <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                                </div>
                            </div>
                            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-${stat.color}-500 to-${stat.color}-400`} />
                        </Card>
                    ))}
                </div>

                {/* Recent Activity */}
                <Card>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-white">Aktivitas Terakhir</h2>
                    </div>

                    {recentLogs.length === 0 ? (
                        <p className="text-white/50 text-center py-8">Belum ada aktivitas</p>
                    ) : (
                        <div className="space-y-4">
                            {recentLogs.map((log) => (
                                <div
                                    key={log.id}
                                    className="flex items-start gap-4 p-4 rounded-xl bg-white/5"
                                >
                                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                                        <AlertCircle className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white">{log.description}</p>
                                        <div className="flex items-center gap-4 mt-1">
                                            <span className="text-xs text-white/50">
                                                {log.user?.name || 'System'}
                                            </span>
                                            <span className="text-xs text-white/30">
                                                {new Date(log.created_at).toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </AdminMasterLayout>
    );
}
