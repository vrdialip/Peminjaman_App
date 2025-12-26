import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Camera, User, Phone, BookOpen, Building2, Send, ArrowLeft, Package } from 'lucide-react';
import { PublicLayout } from '@/layouts/PublicLayout';
import { publicApi } from '@/lib/api';
import { Card, Button, Input, Textarea, Spinner, Badge } from '@/components/ui';
import { CameraCapture, PhotoPreview } from '@/components/Camera';
import toast from 'react-hot-toast';

export function BorrowPage() {
    const { slug, itemId } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [organization, setOrganization] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [loanCode, setLoanCode] = useState(null);

    const [form, setForm] = useState({
        borrower_name: '',
        borrower_class: '',
        borrower_organization: '',
        borrower_phone: '',
        borrower_photo: null,
        loan_purpose: '',
    });

    useEffect(() => {
        fetchData();
    }, [slug, itemId]);

    const fetchData = async () => {
        try {
            const [orgRes, itemRes] = await Promise.all([
                publicApi.getOrganization(slug),
                publicApi.getItem(slug, itemId),
            ]);
            setOrganization(orgRes.data.data);
            setItem(itemRes.data.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Barang tidak ditemukan');
            navigate(`/org/${slug}`);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handlePhotoCapture = (imageData) => {
        setForm({ ...form, borrower_photo: imageData });
        setShowCamera(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.borrower_photo) {
            toast.error('Foto selfie wajib diambil!');
            return;
        }

        setSubmitting(true);
        try {
            const { data } = await publicApi.submitLoan(slug, {
                item_id: itemId,
                ...form,
            });

            setLoanCode(data.data.loan_code);
            toast.success('Peminjaman berhasil diajukan!');
        } catch (error) {
            console.error('Error submitting:', error);
            const message = error.response?.data?.message || 'Gagal mengajukan peminjaman';
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <PublicLayout>
                <div className="flex justify-center py-20">
                    <Spinner size="lg" />
                </div>
            </PublicLayout>
        );
    }

    // Success state
    if (loanCode) {
        return (
            <PublicLayout orgSlug={slug} orgName={organization?.name}>
                <div className="min-h-[60vh] flex items-center justify-center py-12">
                    <div className="max-w-md w-full mx-auto px-4">
                        <Card className="text-center p-8">
                            <div className="w-20 h-20 rounded-full bg-gradient-success mx-auto flex items-center justify-center mb-6 glow-success">
                                <Send className="w-10 h-10 text-white" />
                            </div>

                            <h2 className="text-2xl font-bold text-white mb-2">
                                Peminjaman Berhasil Diajukan!
                            </h2>
                            <p className="text-white/60 mb-6">
                                Simpan kode peminjaman ini untuk mengecek status dan melakukan pengembalian
                            </p>

                            <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 mb-6">
                                <p className="text-sm text-white/50 mb-1">Kode Peminjaman</p>
                                <p className="text-2xl font-mono font-bold text-indigo-400">{loanCode}</p>
                            </div>

                            <div className="space-y-3">
                                <Button
                                    variant="primary"
                                    className="w-full"
                                    onClick={() => navigate('/check-status')}
                                >
                                    Cek Status Peminjaman
                                </Button>
                                <Button
                                    variant="secondary"
                                    className="w-full"
                                    onClick={() => navigate(`/org/${slug}`)}
                                >
                                    Kembali ke Daftar Barang
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </PublicLayout>
        );
    }

    return (
        <PublicLayout orgSlug={slug} orgName={organization?.name}>
            {showCamera && (
                <CameraCapture
                    onCapture={handlePhotoCapture}
                    onClose={() => setShowCamera(false)}
                />
            )}

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
                {/* Back Button */}
                <button
                    onClick={() => navigate(`/org/${slug}`)}
                    className="flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Kembali ke daftar barang
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Item Info */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-24">
                            <div className="aspect-square bg-slate-800 -mx-6 -mt-6 mb-4 rounded-t-xl overflow-hidden">
                                {item.image_url ? (
                                    <img
                                        src={item.image_url}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Package className="w-16 h-16 text-white/20" />
                                    </div>
                                )}
                            </div>

                            <h2 className="text-xl font-bold text-white mb-2">{item.name}</h2>

                            <div className="flex items-center gap-2 mb-4">
                                {item.category && (
                                    <Badge variant="primary">{item.category}</Badge>
                                )}
                                <Badge variant="success">Stok: {item.available_stock}</Badge>
                            </div>

                            <p className="text-white/60 text-sm">{item.description}</p>
                        </Card>
                    </div>

                    {/* Form */}
                    <div className="lg:col-span-2">
                        <Card>
                            <h2 className="text-xl font-bold text-white mb-6">Form Peminjaman</h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Name */}
                                <div className="relative">
                                    <User className="absolute left-4 top-9 w-5 h-5 text-white/40" />
                                    <Input
                                        label="Nama Lengkap"
                                        name="borrower_name"
                                        value={form.borrower_name}
                                        onChange={handleChange}
                                        placeholder="Masukkan nama lengkap"
                                        className="pl-12"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Class */}
                                    <div className="relative">
                                        <BookOpen className="absolute left-4 top-9 w-5 h-5 text-white/40" />
                                        <Input
                                            label="Kelas"
                                            name="borrower_class"
                                            value={form.borrower_class}
                                            onChange={handleChange}
                                            placeholder="Contoh: XII RPL 1"
                                            className="pl-12"
                                        />
                                    </div>

                                    {/* Organization */}
                                    <div className="relative">
                                        <Building2 className="absolute left-4 top-9 w-5 h-5 text-white/40" />
                                        <Input
                                            label="Organisasi"
                                            name="borrower_organization"
                                            value={form.borrower_organization}
                                            onChange={handleChange}
                                            placeholder="Contoh: OSIS"
                                            className="pl-12"
                                        />
                                    </div>
                                </div>

                                {/* Phone */}
                                <div className="relative">
                                    <Phone className="absolute left-4 top-9 w-5 h-5 text-white/40" />
                                    <Input
                                        label="No. HP / WhatsApp"
                                        name="borrower_phone"
                                        type="tel"
                                        value={form.borrower_phone}
                                        onChange={handleChange}
                                        placeholder="08xxxxxxxxxx"
                                        className="pl-12"
                                        required
                                    />
                                </div>

                                {/* Purpose */}
                                <Textarea
                                    label="Tujuan Peminjaman (Opsional)"
                                    name="loan_purpose"
                                    value={form.loan_purpose}
                                    onChange={handleChange}
                                    placeholder="Jelaskan untuk apa barang ini dipinjam..."
                                    rows={3}
                                />

                                {/* Photo */}
                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-2">
                                        Foto Selfie dengan Barang <span className="text-red-400">*</span>
                                    </label>

                                    {form.borrower_photo ? (
                                        <PhotoPreview
                                            src={form.borrower_photo}
                                            onRemove={() => setForm({ ...form, borrower_photo: null })}
                                        />
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => setShowCamera(true)}
                                            className="w-full h-48 rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-3 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-colors"
                                        >
                                            <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center">
                                                <Camera className="w-8 h-8 text-indigo-400" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-white font-medium">Ambil Foto Selfie dengan Barang</p>
                                                <p className="text-sm text-white/50">Klik untuk membuka kamera</p>
                                            </div>
                                        </button>
                                    )}

                                    <p className="mt-2 text-xs text-white/40">
                                        Foto selfie dengan barang diperlukan untuk verifikasi peminjaman. Foto harus diambil langsung.
                                    </p>
                                </div>

                                {/* Submit */}
                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="w-full"
                                    isLoading={submitting}
                                    disabled={!form.borrower_photo}
                                >
                                    <Send className="w-4 h-4" />
                                    Ajukan Peminjaman
                                </Button>
                            </form>
                        </Card>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
