import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, BookOpen, Building2, Package, Clock, Check, X, Camera } from 'lucide-react';
import { AdminOrgLayout } from '@/layouts/AdminOrgLayout';
import { adminOrgApi } from '@/lib/api';
import { Card, Button, Input, Textarea, Spinner, StatusBadge, Badge } from '@/components/ui';
import { Modal } from '@/components/Modal';
import toast from 'react-hot-toast';

export function LoanDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loan, setLoan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [returnCondition, setReturnCondition] = useState('normal');
    const [returnNotes, setReturnNotes] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchLoan();
    }, [id]);

    const fetchLoan = async () => {
        try {
            const { data } = await adminOrgApi.getLoan(id);
            setLoan(data.data);
        } catch (error) {
            toast.error('Peminjaman tidak ditemukan');
            navigate(-1);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        setProcessing(true);
        try {
            await adminOrgApi.approveLoan(id);
            toast.success('Peminjaman berhasil disetujui');
            fetchLoan();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menyetujui');
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            toast.error('Alasan penolakan wajib diisi');
            return;
        }
        setProcessing(true);
        try {
            await adminOrgApi.rejectLoan(id, rejectReason);
            toast.success('Peminjaman berhasil ditolak');
            setShowRejectModal(false);
            fetchLoan();
        } catch (error) {
            toast.error('Gagal menolak');
        } finally {
            setProcessing(false);
        }
    };

    const handleCompleteReturn = async () => {
        setProcessing(true);
        try {
            await adminOrgApi.completeReturn(id, {
                condition: returnCondition,
                notes: returnNotes,
            });
            toast.success('Pengembalian berhasil diselesaikan');
            setShowReturnModal(false);
            fetchLoan();
        } catch (error) {
            toast.error('Gagal menyelesaikan pengembalian');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <AdminOrgLayout>
                <div className="flex justify-center py-20"><Spinner size="lg" /></div>
            </AdminOrgLayout>
        );
    }

    if (!loan) return null;

    return (
        <AdminOrgLayout>
            <div className="space-y-6">
                {/* Back Button */}
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" />Kembali
                </button>

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-white">Detail Peminjaman</h1>
                            <StatusBadge status={loan.status} />
                        </div>
                        <p className="text-white/60 font-mono">{loan.loan_code}</p>
                    </div>

                    {/* Actions */}
                    {loan.status === 'pending' && (
                        <div className="flex gap-3">
                            <Button variant="danger" onClick={() => setShowRejectModal(true)} disabled={processing}>
                                <X className="w-4 h-4" />Tolak
                            </Button>
                            <Button variant="success" onClick={handleApprove} isLoading={processing}>
                                <Check className="w-4 h-4" />Setujui
                            </Button>
                        </div>
                    )}

                    {loan.status === 'return_pending' && (
                        <Button variant="primary" onClick={() => setShowReturnModal(true)}>
                            Proses Pengembalian
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Borrower Info */}
                    <Card>
                        <h2 className="text-lg font-semibold text-white mb-4">Data Peminjam</h2>
                        <div className="space-y-4">
                            <InfoRow icon={User} label="Nama" value={loan.borrower_name} />
                            <InfoRow icon={Phone} label="No. HP" value={loan.borrower_phone} />
                            <InfoRow icon={BookOpen} label="Kelas" value={loan.borrower_class || '-'} />
                            <InfoRow icon={Building2} label="Organisasi" value={loan.borrower_organization || '-'} />

                            {loan.borrower_photo && (
                                <div>
                                    <p className="text-sm text-white/50 mb-2">Foto Peminjam</p>
                                    <img
                                        src={loan.borrower_photo_url}
                                        alt="Borrower"
                                        className="w-full max-w-xs rounded-xl"
                                    />
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Loan Info */}
                    <Card>
                        <h2 className="text-lg font-semibold text-white mb-4">Data Peminjaman</h2>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
                                <div className="w-14 h-14 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                                    <Package className="w-7 h-7 text-indigo-400" />
                                </div>
                                <div>
                                    <p className="text-lg font-semibold text-white">{loan.item?.name}</p>
                                    <p className="text-sm text-white/50">{loan.item?.category}</p>
                                </div>
                            </div>

                            <InfoRow icon={Clock} label="Tanggal Pinjam" value={new Date(loan.loan_date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} />

                            {loan.loan_purpose && (
                                <div>
                                    <p className="text-sm text-white/50 mb-1">Tujuan Peminjaman</p>
                                    <p className="text-white">{loan.loan_purpose}</p>
                                </div>
                            )}

                            {loan.rejection_reason && (
                                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                                    <p className="text-sm text-red-400 font-medium mb-1">Alasan Penolakan:</p>
                                    <p className="text-white/70">{loan.rejection_reason}</p>
                                </div>
                            )}

                            {loan.return_photo && (
                                <div>
                                    <p className="text-sm text-white/50 mb-2">Foto Pengembalian</p>
                                    <img
                                        src={loan.return_photo_url}
                                        alt="Return"
                                        className="w-full max-w-xs rounded-xl"
                                    />
                                    {loan.return_condition_notes && (
                                        <p className="text-white/60 text-sm mt-2">{loan.return_condition_notes}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Reject Modal */}
            <Modal isOpen={showRejectModal} onClose={() => setShowRejectModal(false)} title="Tolak Peminjaman" size="sm">
                <div className="space-y-4">
                    <Textarea
                        label="Alasan Penolakan"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Jelaskan alasan penolakan..."
                        rows={3}
                        required
                    />
                    <div className="flex gap-3">
                        <Button variant="secondary" className="flex-1" onClick={() => setShowRejectModal(false)}>Batal</Button>
                        <Button variant="danger" className="flex-1" onClick={handleReject} isLoading={processing}>Tolak</Button>
                    </div>
                </div>
            </Modal>

            {/* Return Modal */}
            <Modal isOpen={showReturnModal} onClose={() => setShowReturnModal(false)} title="Proses Pengembalian" size="sm">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">Kondisi Barang</label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { value: 'normal', label: 'Normal', color: 'success' },
                                { value: 'damaged', label: 'Rusak', color: 'warning' },
                                { value: 'lost', label: 'Hilang', color: 'danger' },
                            ].map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setReturnCondition(opt.value)}
                                    className={`p-3 rounded-xl border-2 transition-all ${returnCondition === opt.value
                                            ? `border-${opt.color === 'success' ? 'emerald' : opt.color === 'warning' ? 'yellow' : 'red'}-500 bg-${opt.color === 'success' ? 'emerald' : opt.color === 'warning' ? 'yellow' : 'red'}-500/10`
                                            : 'border-white/10 hover:border-white/20'
                                        }`}
                                >
                                    <Badge variant={opt.color}>{opt.label}</Badge>
                                </button>
                            ))}
                        </div>
                    </div>
                    <Textarea
                        label="Catatan (Opsional)"
                        value={returnNotes}
                        onChange={(e) => setReturnNotes(e.target.value)}
                        placeholder="Catatan kondisi barang..."
                        rows={2}
                    />
                    <div className="flex gap-3">
                        <Button variant="secondary" className="flex-1" onClick={() => setShowReturnModal(false)}>Batal</Button>
                        <Button variant="primary" className="flex-1" onClick={handleCompleteReturn} isLoading={processing}>Selesaikan</Button>
                    </div>
                </div>
            </Modal>
        </AdminOrgLayout>
    );
}

function InfoRow({ icon: Icon, label, value }) {
    return (
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-white/40" />
            </div>
            <div>
                <p className="text-xs text-white/50">{label}</p>
                <p className="text-white">{value}</p>
            </div>
        </div>
    );
}
