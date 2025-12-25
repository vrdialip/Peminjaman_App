import React, { useState, useEffect, useRef } from 'react';
import { Search, Package, Camera, Send, CheckCircle, XCircle, Clock, AlertTriangle, RotateCcw } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PublicLayout } from '@/layouts/PublicLayout';
import { publicApi } from '@/lib/api';
import { Card, Button, Input, Badge, Spinner } from '@/components/ui';
import { CameraCapture, PhotoPreview } from '@/components/Camera';
import toast from 'react-hot-toast';

export function CheckStatusPage() {
    const [loanCode, setLoanCode] = useState('');
    const [searchCode, setSearchCode] = useState('');
    const [showReturnForm, setShowReturnForm] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [returnPhoto, setReturnPhoto] = useState(null);
    const [returnNotes, setReturnNotes] = useState('');
    const [submittingReturn, setSubmittingReturn] = useState(false);
    const lastStatusRef = useRef(null);

    // Poll status using React Query
    const { data: loan, isLoading: loading, error } = useQuery({
        queryKey: ['loanStatus', searchCode],
        queryFn: async () => {
            const { data } = await publicApi.checkLoanStatus(searchCode);
            return data.data;
        },
        enabled: !!searchCode,
        refetchInterval: 10000, // Poll every 10s
        retry: false,
    });

    const handleSearch = (e) => {
        e.preventDefault();
        if (!loanCode.trim()) return;
        setSearchCode(loanCode.toUpperCase());
    };

    // Notification Effect
    useEffect(() => {
        if ("Notification" in window && Notification.permission !== "granted") {
            Notification.requestPermission();
        }
    }, []);

    useEffect(() => {
        if (loan) {
            // First load or update
            if (lastStatusRef.current && lastStatusRef.current !== loan.status) {
                // Status Updated
                const opts = { icon: '/favicon.ico' };
                if (loan.status === 'borrowed') {
                    toast.success('Peminjaman DISETUJUI! Silakan ambil barang.');
                    new Notification("Peminjaman Disetujui ✅", { body: `Permintaan ${loan.item} telah disetujui.`, ...opts });
                } else if (loan.status === 'rejected') {
                    toast.error('Peminjaman DITOLAK.');
                    new Notification("Peminjaman Ditolak ❌", { body: `Permintaan ${loan.item} ditolak.`, ...opts });
                } else if (loan.status === 'completed') {
                    toast.success('Pengembalian selesai!');
                    new Notification("Pengembalian Selesai", { body: `Barang ${loan.item} telah diterima kembali.`, ...opts });
                }
            }
            lastStatusRef.current = loan.status;
        }
    }, [loan]);

    // Handle 404/Error manually for UI
    useEffect(() => {
        if (error) {
            toast.error('Kode peminjaman tidak ditemukan');
        }
    }, [error]);

    const handleSubmitReturn = async () => {
        if (!returnPhoto) {
            toast.error('Foto kondisi barang wajib diambil!');
            return;
        }

        setSubmittingReturn(true);
        try {
            await publicApi.submitReturn({
                loan_code: loanCode,
                return_photo: returnPhoto,
                notes: returnNotes,
            });
            toast.success('Pengembalian berhasil diajukan!');

            // Refresh status
            const { data } = await publicApi.checkLoanStatus(loanCode);
            setLoan(data.data);
            setShowReturnForm(false);
            setReturnPhoto(null);
            setReturnNotes('');
        } catch (error) {
            const message = error.response?.data?.message || 'Gagal mengajukan pengembalian';
            toast.error(message);
        } finally {
            setSubmittingReturn(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <Clock className="w-8 h-8 text-yellow-400" />;
            case 'borrowed': return <Package className="w-8 h-8 text-blue-400" />;
            case 'return_pending': return <RotateCcw className="w-8 h-8 text-orange-400" />;
            case 'completed':
            case 'completed_damaged':
            case 'completed_lost':
                return <CheckCircle className="w-8 h-8 text-green-400" />;
            case 'rejected': return <XCircle className="w-8 h-8 text-red-400" />;
            default: return <Package className="w-8 h-8 text-gray-400" />;
        }
    };

    return (
        <PublicLayout>
            {showCamera && (
                <CameraCapture
                    onCapture={(photo) => {
                        setReturnPhoto(photo);
                        setShowCamera(false);
                    }}
                    onClose={() => setShowCamera(false)}
                />
            )}

            <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Cek Status Peminjaman</h1>
                    <p className="text-white/60">Masukkan kode peminjaman untuk mengecek status</p>
                </div>

                {/* Search Form */}
                <Card className="mb-8">
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                            <input
                                type="text"
                                value={loanCode}

                                onChange={(e) => setLoanCode(e.target.value.toUpperCase())}
                                placeholder="Masukkan kode peminjaman..."
                                className="input pl-12 font-mono"
                            />
                        </div>
                        <Button type="submit" variant="primary" isLoading={loading}>
                            Cari
                        </Button>
                    </form>
                </Card>

                {/* Result */}
                {loading && (
                    <div className="flex justify-center py-12">
                        <Spinner size="lg" />
                    </div>
                )}

                {loan && !loading && (
                    <Card className="fade-in">
                        {/* Status Header */}
                        <div className="flex items-center gap-4 pb-6 border-b border-white/10 mb-6">
                            <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center">
                                {getStatusIcon(loan.status)}
                            </div>
                            <div>
                                <p className="text-sm text-white/50 font-mono">{loan.loan_code}</p>
                                <h2 className="text-xl font-bold text-white">{loan.status_label}</h2>
                            </div>
                        </div>

                        {/* Loan Details */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-white/50">Nama Peminjam</p>
                                    <p className="text-white font-medium">{loan.borrower_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-white/50">Barang</p>
                                    <p className="text-white font-medium">{loan.item}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-white/50">Tanggal Pinjam</p>
                                <p className="text-white font-medium">
                                    {new Date(loan.loan_date).toLocaleDateString('id-ID', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </p>
                            </div>

                            {/* Rejection Reason */}
                            {loan.status === 'rejected' && loan.rejection_reason && (
                                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-red-400">Alasan Penolakan:</p>
                                            <p className="text-white/70">{loan.rejection_reason}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Return Button */}
                            {loan.can_return && !showReturnForm && (
                                <Button
                                    variant="success"
                                    className="w-full"
                                    onClick={() => setShowReturnForm(true)}
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Kembalikan Barang
                                </Button>
                            )}

                            {/* Return Form */}
                            {showReturnForm && (
                                <div className="pt-6 border-t border-white/10 space-y-4">
                                    <h3 className="text-lg font-semibold text-white">Form Pengembalian</h3>

                                    {/* Photo */}
                                    <div>
                                        <label className="block text-sm font-medium text-white/70 mb-2">
                                            Foto Kondisi Barang <span className="text-red-400">*</span>
                                        </label>

                                        {returnPhoto ? (
                                            <PhotoPreview
                                                src={returnPhoto}
                                                onRemove={() => setReturnPhoto(null)}
                                            />
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => setShowCamera(true)}
                                                className="w-full h-40 rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-2 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-colors"
                                            >
                                                <Camera className="w-8 h-8 text-indigo-400" />
                                                <p className="text-white font-medium">Ambil Foto Barang</p>
                                            </button>
                                        )}
                                    </div>

                                    {/* Notes */}
                                    <div>
                                        <label className="block text-sm font-medium text-white/70 mb-2">
                                            Catatan (Opsional)
                                        </label>
                                        <textarea
                                            value={returnNotes}
                                            onChange={(e) => setReturnNotes(e.target.value)}
                                            placeholder="Catatan kondisi barang..."
                                            className="input resize-none"
                                            rows={3}
                                        />
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3">
                                        <Button
                                            variant="secondary"
                                            className="flex-1"
                                            onClick={() => {
                                                setShowReturnForm(false);
                                                setReturnPhoto(null);
                                                setReturnNotes('');
                                            }}
                                        >
                                            Batal
                                        </Button>
                                        <Button
                                            variant="success"
                                            className="flex-1"
                                            onClick={handleSubmitReturn}
                                            isLoading={submittingReturn}
                                            disabled={!returnPhoto}
                                        >
                                            <Send className="w-4 h-4" />
                                            Ajukan Pengembalian
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                )}
            </div>
        </PublicLayout>
    );
}
