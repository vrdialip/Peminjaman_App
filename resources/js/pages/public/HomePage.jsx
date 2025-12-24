import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Package, ArrowRight, Search } from 'lucide-react';
import { PublicLayout } from '@/layouts/PublicLayout';
import { publicApi } from '@/lib/api';
import { Card, Spinner, Input, EmptyState } from '@/components/ui';

export function HomePage() {
    const [organizations, setOrganizations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchOrganizations();
    }, []);

    const fetchOrganizations = async () => {
        try {
            const { data } = await publicApi.getOrganizations();
            setOrganizations(data.data);
        } catch (error) {
            console.error('Error fetching organizations:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredOrgs = organizations.filter(org =>
        org.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <PublicLayout>
            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                    <div className="text-center max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6">
                            <Package className="w-4 h-4 text-indigo-400" />
                            <span className="text-sm text-indigo-400">Sistem Peminjaman Digital</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
                            Pinjam Barang
                            <span className="block bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                Organisasi dengan Mudah
                            </span>
                        </h1>

                        <p className="text-lg text-white/60 mb-8 max-w-2xl mx-auto">
                            Sistem peminjaman barang organisasi yang modern dan efisien.
                            Pilih organisasi, lihat barang yang tersedia, dan ajukan peminjaman dengan mudah.
                        </p>

                        {/* Search */}
                        <div className="max-w-md mx-auto relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                            <input
                                type="text"
                                placeholder="Cari organisasi..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="input pl-12 text-lg py-4"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Organizations Grid */}
            <section className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-white">Pilih Organisasi</h2>
                        <span className="text-white/50">{organizations.length} organisasi tersedia</span>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Spinner size="lg" />
                        </div>
                    ) : filteredOrgs.length === 0 ? (
                        <EmptyState
                            icon={Building2}
                            title="Tidak ada organisasi ditemukan"
                            description={search ? 'Coba kata kunci lain' : 'Belum ada organisasi yang terdaftar'}
                        />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredOrgs.map((org) => (
                                <Link
                                    key={org.id}
                                    to={`/org/${org.slug}`}
                                    className="group"
                                >
                                    <Card className="h-full">
                                        <div className="flex items-start gap-4">
                                            <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                                {org.logo ? (
                                                    <img
                                                        src={org.logo_url}
                                                        alt={org.name}
                                                        className="w-full h-full object-cover rounded-xl"
                                                    />
                                                ) : (
                                                    <Building2 className="w-7 h-7 text-white" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-semibold text-white group-hover:text-indigo-400 transition-colors truncate">
                                                    {org.name}
                                                </h3>
                                                <p className="text-sm text-white/50 mt-1 line-clamp-2">
                                                    {org.description || 'Tidak ada deskripsi'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div>
                                                    <p className="text-2xl font-bold text-white">{org.items_count || 0}</p>
                                                    <p className="text-xs text-white/50">Barang Tersedia</p>
                                                </div>
                                            </div>
                                            <ArrowRight className="w-5 h-5 text-white/30 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <h2 className="text-2xl font-bold text-white text-center mb-12">Cara Meminjam Barang</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                step: '1',
                                title: 'Pilih Organisasi',
                                description: 'Pilih organisasi yang memiliki barang yang ingin Anda pinjam',
                            },
                            {
                                step: '2',
                                title: 'Pilih Barang & Isi Data',
                                description: 'Pilih barang, isi data diri, dan ambil foto selfie untuk verifikasi',
                            },
                            {
                                step: '3',
                                title: 'Tunggu Persetujuan',
                                description: 'Admin akan memverifikasi permintaan Anda. Cek status dengan kode peminjaman',
                            },
                        ].map((item) => (
                            <div key={item.step} className="relative">
                                <div className="text-center">
                                    <div className="w-16 h-16 rounded-full bg-gradient-primary mx-auto flex items-center justify-center mb-4 glow-primary">
                                        <span className="text-2xl font-bold text-white">{item.step}</span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                                    <p className="text-white/50">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
