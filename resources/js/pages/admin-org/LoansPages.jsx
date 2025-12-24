import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Search, Eye, Package } from 'lucide-react';
import { AdminOrgLayout } from '@/layouts/AdminOrgLayout';
import { adminOrgApi } from '@/lib/api';
import { Card, Button, Spinner, EmptyState, StatusBadge } from '@/components/ui';

export function PendingLoansPage() {
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLoans();
    }, []);

    const fetchLoans = async () => {
        try {
            const { data } = await adminOrgApi.getPendingLoans();
            setLoans(data.data.data || data.data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminOrgLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Verifikasi Peminjaman</h1>
                    <p className="text-white/60">Peminjaman yang menunggu persetujuan</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12"><Spinner size="lg" /></div>
                ) : loans.length === 0 ? (
                    <EmptyState
                        icon={Clock}
                        title="Tidak ada peminjaman menunggu"
                        description="Semua peminjaman sudah diverifikasi"
                    />
                ) : (
                    <div className="grid gap-4">
                        {loans.map((loan) => (
                            <Card key={loan.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                                        <Clock className="w-7 h-7 text-yellow-400" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-white">{loan.borrower_name}</p>
                                        <p className="text-sm text-white/50">{loan.item?.name}</p>
                                        <p className="text-xs text-white/40 mt-1">
                                            {new Date(loan.loan_date).toLocaleDateString('id-ID')}
                                        </p>
                                    </div>
                                </div>
                                <Link to={`/admin-org/loans/${loan.id}`}>
                                    <Button variant="primary">
                                        <Eye className="w-4 h-4" />Verifikasi
                                    </Button>
                                </Link>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AdminOrgLayout>
    );
}

export function ReturnPendingPage() {
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLoans();
    }, []);

    const fetchLoans = async () => {
        try {
            const { data } = await adminOrgApi.getReturnPending();
            setLoans(data.data.data || data.data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminOrgLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Verifikasi Pengembalian</h1>
                    <p className="text-white/60">Pengembalian yang menunggu dicek</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12"><Spinner size="lg" /></div>
                ) : loans.length === 0 ? (
                    <EmptyState
                        icon={Package}
                        title="Tidak ada pengembalian menunggu"
                        description="Semua pengembalian sudah dicek"
                    />
                ) : (
                    <div className="grid gap-4">
                        {loans.map((loan) => (
                            <Card key={loan.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                                        <Package className="w-7 h-7 text-orange-400" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-white">{loan.borrower_name}</p>
                                        <p className="text-sm text-white/50">{loan.item?.name}</p>
                                        <p className="text-xs text-white/40 mt-1">
                                            Dipinjam: {new Date(loan.loan_date).toLocaleDateString('id-ID')}
                                        </p>
                                    </div>
                                </div>
                                <Link to={`/admin-org/loans/${loan.id}`}>
                                    <Button variant="success">
                                        <Eye className="w-4 h-4" />Cek & Proses
                                    </Button>
                                </Link>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AdminOrgLayout>
    );
}

export function AllLoansPage() {
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        fetchLoans();
    }, []);

    const fetchLoans = async () => {
        try {
            const { data } = await adminOrgApi.getAllLoans({ search, status: statusFilter });
            setLoans(data.data.data || data.data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => fetchLoans(), 300);
        return () => clearTimeout(timer);
    }, [search, statusFilter]);

    return (
        <AdminOrgLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Semua Peminjaman</h1>
                    <p className="text-white/60">Riwayat semua peminjaman</p>
                </div>

                <Card className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                            <input
                                type="text"
                                placeholder="Cari nama atau kode..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="input pl-12"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="input bg-slate-800 w-full sm:w-48"
                        >
                            <option value="">Semua Status</option>
                            <option value="pending">Menunggu Verifikasi</option>
                            <option value="borrowed">Dipinjam</option>
                            <option value="return_pending">Menunggu Cek</option>
                            <option value="completed">Selesai</option>
                            <option value="rejected">Ditolak</option>
                        </select>
                    </div>
                </Card>

                {loading ? (
                    <div className="flex justify-center py-12"><Spinner size="lg" /></div>
                ) : loans.length === 0 ? (
                    <EmptyState
                        icon={Package}
                        title="Tidak ada peminjaman"
                        description="Belum ada riwayat peminjaman"
                    />
                ) : (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Kode</th>
                                    <th>Peminjam</th>
                                    <th>Barang</th>
                                    <th>Tanggal</th>
                                    <th>Status</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {loans.map((loan) => (
                                    <tr key={loan.id}>
                                        <td className="font-mono text-sm">{loan.loan_code}</td>
                                        <td>{loan.borrower_name}</td>
                                        <td>{loan.item?.name}</td>
                                        <td>{new Date(loan.loan_date).toLocaleDateString('id-ID')}</td>
                                        <td><StatusBadge status={loan.status} /></td>
                                        <td>
                                            <Link to={`/admin-org/loans/${loan.id}`}>
                                                <Button variant="secondary" size="sm">
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AdminOrgLayout>
    );
}
