import React, { useState } from 'react';
import { FileSpreadsheet, Download, Package, TrendingUp } from 'lucide-react';
import { AdminOrgLayout } from '@/layouts/AdminOrgLayout';
import { adminOrgApi } from '@/lib/api';
import { Card, Button, Select, Spinner, Badge } from '@/components/ui';
import toast from 'react-hot-toast';

export function ReportsPage() {
    const [activeTab, setActiveTab] = useState('inventory');
    const [inventoryData, setInventoryData] = useState(null);
    const [loanData, setLoanData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());

    const fetchInventoryReport = async () => {
        setLoading(true);
        try {
            const { data } = await adminOrgApi.getInventoryReport();
            setInventoryData(data.data);
        } catch (error) {
            toast.error('Gagal memuat laporan');
        } finally {
            setLoading(false);
        }
    };

    const fetchLoanReport = async () => {
        setLoading(true);
        try {
            const { data } = await adminOrgApi.getLoanReport(month, year);
            setLoanData(data.data);
        } catch (error) {
            toast.error('Gagal memuat laporan');
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        if (activeTab === 'inventory') {
            fetchInventoryReport();
        } else {
            fetchLoanReport();
        }
    }, [activeTab, month, year]);

    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    return (
        <AdminOrgLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Laporan</h1>
                    <p className="text-white/60">Laporan inventaris dan peminjaman</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 p-1 bg-white/5 rounded-xl w-fit">
                    <button
                        onClick={() => setActiveTab('inventory')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'inventory'
                                ? 'bg-gradient-primary text-white'
                                : 'text-white/60 hover:text-white'
                            }`}
                    >
                        <Package className="w-4 h-4 inline-block mr-2" />
                        Inventaris
                    </button>
                    <button
                        onClick={() => setActiveTab('loans')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'loans'
                                ? 'bg-gradient-primary text-white'
                                : 'text-white/60 hover:text-white'
                            }`}
                    >
                        <FileSpreadsheet className="w-4 h-4 inline-block mr-2" />
                        Peminjaman
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'inventory' ? (
                    <InventoryReport data={inventoryData} loading={loading} />
                ) : (
                    <LoanReport
                        data={loanData}
                        loading={loading}
                        month={month}
                        year={year}
                        months={months}
                        onMonthChange={setMonth}
                        onYearChange={setYear}
                    />
                )}
            </div>
        </AdminOrgLayout>
    );
}

function InventoryReport({ data, loading }) {
    if (loading) {
        return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;
    }

    if (!data) return null;

    const { summary, items } = data;

    return (
        <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <Card className="text-center">
                    <p className="text-3xl font-bold text-white">{summary.total_items}</p>
                    <p className="text-sm text-white/50">Total Barang</p>
                </Card>
                <Card className="text-center">
                    <p className="text-3xl font-bold text-white">{summary.total_stock}</p>
                    <p className="text-sm text-white/50">Total Stok</p>
                </Card>
                <Card className="text-center">
                    <p className="text-3xl font-bold text-emerald-400">{summary.available_stock}</p>
                    <p className="text-sm text-white/50">Stok Tersedia</p>
                </Card>
                <Card className="text-center">
                    <p className="text-3xl font-bold text-indigo-400">{summary.loanable_items}</p>
                    <p className="text-sm text-white/50">Bisa Dipinjam</p>
                </Card>
                <Card className="text-center">
                    <p className="text-3xl font-bold text-red-400">{summary.non_loanable_items}</p>
                    <p className="text-sm text-white/50">Tidak Bisa</p>
                </Card>
            </div>

            {/* Items Table */}
            <Card>
                <h3 className="text-lg font-semibold text-white mb-4">Daftar Barang</h3>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Kode</th>
                                <th>Nama</th>
                                <th>Kategori</th>
                                <th>Stok</th>
                                <th>Tersedia</th>
                                <th>Kondisi</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.id}>
                                    <td className="font-mono text-sm">{item.code}</td>
                                    <td>{item.name}</td>
                                    <td>{item.category || '-'}</td>
                                    <td>{item.stock}</td>
                                    <td>{item.available_stock}</td>
                                    <td>
                                        <Badge variant={
                                            item.condition === 'good' ? 'success' :
                                                item.condition === 'fair' ? 'warning' : 'danger'
                                        }>
                                            {item.condition === 'good' ? 'Baik' : item.condition === 'fair' ? 'Cukup' : 'Kurang'}
                                        </Badge>
                                    </td>
                                    <td>
                                        <Badge variant={item.is_loanable ? 'success' : 'danger'}>
                                            {item.is_loanable ? 'Bisa' : 'Tidak'}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}

function LoanReport({ data, loading, month, year, months, onMonthChange, onYearChange }) {
    if (loading) {
        return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;
    }

    const years = [];
    for (let y = 2024; y <= new Date().getFullYear() + 1; y++) {
        years.push(y);
    }

    return (
        <div className="space-y-6">
            {/* Period Selector */}
            <Card className="p-4">
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-white/70 mb-2">Bulan</label>
                        <select
                            value={month}
                            onChange={(e) => onMonthChange(parseInt(e.target.value))}
                            className="input bg-slate-800"
                        >
                            {months.map((m, i) => (
                                <option key={i} value={i + 1}>{m}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-white/70 mb-2">Tahun</label>
                        <select
                            value={year}
                            onChange={(e) => onYearChange(parseInt(e.target.value))}
                            className="input bg-slate-800"
                        >
                            {years.map((y) => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </Card>

            {data && (
                <>
                    {/* Summary */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        <Card className="text-center">
                            <p className="text-3xl font-bold text-white">{data.summary.total_loans}</p>
                            <p className="text-sm text-white/50">Total</p>
                        </Card>
                        <Card className="text-center">
                            <p className="text-3xl font-bold text-emerald-400">{data.summary.approved}</p>
                            <p className="text-sm text-white/50">Disetujui</p>
                        </Card>
                        <Card className="text-center">
                            <p className="text-3xl font-bold text-red-400">{data.summary.rejected}</p>
                            <p className="text-sm text-white/50">Ditolak</p>
                        </Card>
                        <Card className="text-center">
                            <p className="text-3xl font-bold text-blue-400">{data.summary.completed}</p>
                            <p className="text-sm text-white/50">Selesai</p>
                        </Card>
                        <Card className="text-center">
                            <p className="text-3xl font-bold text-yellow-400">{data.summary.damaged}</p>
                            <p className="text-sm text-white/50">Rusak</p>
                        </Card>
                        <Card className="text-center">
                            <p className="text-3xl font-bold text-orange-400">{data.summary.lost}</p>
                            <p className="text-sm text-white/50">Hilang</p>
                        </Card>
                    </div>

                    {/* Loans Table */}
                    {data.loans.length > 0 && (
                        <Card>
                            <h3 className="text-lg font-semibold text-white mb-4">
                                Peminjaman {months[month - 1]} {year}
                            </h3>
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Kode</th>
                                            <th>Peminjam</th>
                                            <th>Barang</th>
                                            <th>Tanggal</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.loans.map((loan) => (
                                            <tr key={loan.id}>
                                                <td className="font-mono text-sm">{loan.loan_code}</td>
                                                <td>{loan.borrower_name}</td>
                                                <td>{loan.item?.name}</td>
                                                <td>{new Date(loan.loan_date).toLocaleDateString('id-ID')}</td>
                                                <td>
                                                    <Badge variant={
                                                        loan.status === 'completed' ? 'success' :
                                                            loan.status === 'rejected' ? 'danger' :
                                                                loan.status === 'borrowed' ? 'info' : 'warning'
                                                    }>
                                                        {loan.status_label || loan.status}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
}
