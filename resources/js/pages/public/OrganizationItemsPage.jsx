import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Package, Search, Filter, AlertTriangle, ShoppingCart } from 'lucide-react';
import { PublicLayout } from '@/layouts/PublicLayout';
import { publicApi } from '@/lib/api';
import { Card, Badge, Spinner, EmptyState, Button, Input, Select } from '@/components/ui';

export function OrganizationItemsPage() {
    const { slug } = useParams();
    const [organization, setOrganization] = useState(null);
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [showLoanableOnly, setShowLoanableOnly] = useState(false);

    useEffect(() => {
        fetchData();
    }, [slug]);

    const fetchData = async () => {
        try {
            const [orgRes, itemsRes, catRes] = await Promise.all([
                publicApi.getOrganization(slug),
                publicApi.getItems(slug),
                publicApi.getCategories(slug),
            ]);
            setOrganization(orgRes.data.data);
            setItems(itemsRes.data.data.data || itemsRes.data.data);
            setCategories(catRes.data.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        setLoading(true);
        try {
            const params = { search, category };
            const { data } = showLoanableOnly
                ? await publicApi.getLoanableItems(slug, params)
                : await publicApi.getItems(slug, params);
            setItems(data.data.data || data.data);
        } catch (error) {
            console.error('Error searching:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (organization) {
            handleSearch();
        }
    }, [search, category, showLoanableOnly]);

    if (loading && !organization) {
        return (
            <PublicLayout>
                <div className="flex justify-center py-20">
                    <Spinner size="lg" />
                </div>
            </PublicLayout>
        );
    }

    return (
        <PublicLayout orgSlug={slug} orgName={organization?.name}>
            {/* Header */}
            <section className="py-12 border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-bold text-white">{organization?.name}</h1>
                            <p className="text-white/60 mt-2">{organization?.description}</p>
                        </div>

                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                <input
                                    type="text"
                                    placeholder="Cari barang..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="input pl-12 w-full sm:w-64"
                                />
                            </div>

                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="input bg-slate-800"
                            >
                                <option value="">Semua Kategori</option>
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>

                            <label className="flex items-center gap-2 text-white/70 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={showLoanableOnly}
                                    onChange={(e) => setShowLoanableOnly(e.target.checked)}
                                    className="w-4 h-4 rounded border-white/20 bg-white/10 text-indigo-500"
                                />
                                <span className="text-sm">Hanya yang bisa dipinjam</span>
                            </label>
                        </div>
                    </div>
                </div>
            </section>

            {/* Items Grid */}
            <section className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Spinner size="lg" />
                        </div>
                    ) : items.length === 0 ? (
                        <EmptyState
                            icon={Package}
                            title="Tidak ada barang ditemukan"
                            description="Coba ubah filter pencarian Anda"
                        />
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {items.map((item) => (
                                <ItemCard key={item.id} item={item} orgSlug={slug} />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </PublicLayout>
    );
}

function ItemCard({ item, orgSlug }) {
    const isAvailable = item.is_loanable && item.available_stock > 0;

    return (
        <Card className="overflow-hidden">
            {/* Image */}
            <div className="aspect-square bg-slate-800 -mx-6 -mt-6 mb-4 relative">
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

                {/* Status Badge */}
                {!item.is_loanable && (
                    <div className="absolute top-3 left-3">
                        <Badge variant="danger">Tidak Bisa Dipinjam</Badge>
                    </div>
                )}

                {/* Stock Badge */}
                <div className="absolute top-3 right-3">
                    <Badge variant={item.available_stock > 0 ? 'success' : 'danger'}>
                        Stok: {item.available_stock}
                    </Badge>
                </div>
            </div>

            {/* Content */}
            <div>
                {item.category && (
                    <p className="text-xs text-indigo-400 mb-1">{item.category}</p>
                )}
                <h3 className="text-lg font-semibold text-white mb-2">{item.name}</h3>
                <p className="text-sm text-white/50 line-clamp-2 mb-4">
                    {item.description || 'Tidak ada deskripsi'}
                </p>

                {/* Condition */}
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs text-white/50">Kondisi:</span>
                    <Badge variant={
                        item.condition === 'good' ? 'success' :
                            item.condition === 'fair' ? 'warning' : 'danger'
                    }>
                        {item.condition === 'good' ? 'Baik' :
                            item.condition === 'fair' ? 'Cukup' : 'Kurang'}
                    </Badge>
                </div>

                {/* Not Loanable Reason */}
                {!item.is_loanable && item.not_loanable_reason && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 mb-4">
                        <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-yellow-300">{item.not_loanable_reason}</p>
                    </div>
                )}

                {/* Action Button */}
                {isAvailable ? (
                    <Link to={`/org/${orgSlug}/borrow/${item.id}`}>
                        <Button variant="primary" className="w-full">
                            <ShoppingCart className="w-4 h-4" />
                            Pinjam Barang
                        </Button>
                    </Link>
                ) : (
                    <Button variant="secondary" className="w-full" disabled>
                        {item.available_stock === 0 ? 'Stok Habis' : 'Tidak Tersedia'}
                    </Button>
                )}
            </div>
        </Card>
    );
}
