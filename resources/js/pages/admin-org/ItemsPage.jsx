import React, { useEffect, useState } from 'react';
import { Plus, Search, Package, Edit, Trash2, Eye, EyeOff, FileSpreadsheet } from 'lucide-react';
import { AdminOrgLayout } from '@/layouts/AdminOrgLayout';
import { adminOrgApi } from '@/lib/api';
import { Card, Button, Input, Select, Spinner, Badge, EmptyState, Textarea } from '@/components/ui';
import { Modal, ConfirmModal } from '@/components/Modal';
import toast from 'react-hot-toast';

export function ItemsPage() {
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [deleteItem, setDeleteItem] = useState(null);

    const [form, setForm] = useState({
        name: '',
        category: '',
        description: '',
        stock: 0,
        condition: 'good',
        is_loanable: true,
        not_loanable_reason: '',
        image: null,
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch categories first to ensure dropdown populates even if items fail
            const catsRes = await adminOrgApi.getCategories();
            // Handle different response structures gracefully
            const categoriesData = Array.isArray(catsRes.data) ? catsRes.data :
                (Array.isArray(catsRes.data?.data) ? catsRes.data.data : []);
            setCategories(categoriesData);

            // Fetch items
            const params = { search };
            if (categoryFilter) {
                params.category = categoryFilter;
            }
            const itemsRes = await adminOrgApi.getItems(params);
            setItems(itemsRes.data.data.data || itemsRes.data.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            // Don't clear items on error to prevent flashing empty state
            toast.error('Gagal mengambil data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData();
        }, 300);
        return () => clearTimeout(timer);
    }, [search, categoryFilter]);

    const resetForm = () => {
        setForm({
            name: '',
            category: '',
            description: '',
            stock: 0,
            condition: 'good',
            is_loanable: true,
            not_loanable_reason: '',
            image: null,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = {
                ...form,
                is_loanable: form.is_loanable ? 1 : 0,
            };

            if (editingItem) {
                await adminOrgApi.updateItem(editingItem.id, formData);
                toast.success('Barang berhasil diperbarui');
            } else {
                await adminOrgApi.createItem(formData);
                toast.success('Barang berhasil ditambahkan');
            }
            setShowModal(false);
            setEditingItem(null);
            resetForm();
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Terjadi kesalahan');
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setForm({
            name: item.name,
            category: item.category || '',
            description: item.description || '',
            stock: item.stock,
            condition: item.condition,
            is_loanable: item.is_loanable,
            not_loanable_reason: item.not_loanable_reason || '',
            image: null,
        });
        setShowModal(true);
    };

    const handleDelete = async () => {
        try {
            await adminOrgApi.deleteItem(deleteItem.id);
            toast.success('Barang berhasil dihapus');
            setDeleteItem(null);
            fetchData();
        } catch (error) {
            toast.error('Gagal menghapus barang');
        }
    };

    const handleExport = async () => {
        try {
            const response = await adminOrgApi.exportItems();
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `items_export_${new Date().toISOString().slice(0, 10)}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            toast.error('Gagal mengexport data');
        }
    };

    return (
        <AdminOrgLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Kelola Barang</h1>
                        <p className="text-white/60">Kelola inventaris barang organisasi</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={handleExport}>
                            <FileSpreadsheet className="w-4 h-4" />
                            Export Excel
                        </Button>
                        <Button variant="primary" onClick={() => { resetForm(); setEditingItem(null); setShowModal(true); }}>
                            <Plus className="w-4 h-4" />
                            Tambah Barang
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <Card className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                            <input
                                type="text"
                                placeholder="Cari barang..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="input pl-12"
                            />
                        </div>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="input bg-slate-800 w-full sm:w-48"
                        >
                            <option value="">Semua Kategori</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </Card>

                {/* Items Grid */}
                {loading ? (
                    <div className="flex justify-center py-12"><Spinner size="lg" /></div>
                ) : items.length === 0 ? (
                    <EmptyState
                        icon={Package}
                        title="Belum ada barang"
                        description="Tambahkan barang pertama Anda"
                        action={<Button variant="primary" onClick={() => setShowModal(true)}><Plus className="w-4 h-4" />Tambah Barang</Button>}
                    />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {items.map((item) => (
                            <Card key={item.id} className="overflow-hidden">
                                <div className="aspect-square bg-slate-800 -mx-6 -mt-6 mb-4 relative">
                                    {item.image_url ? (
                                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Package className="w-16 h-16 text-white/20" />
                                        </div>
                                    )}
                                    <div className="absolute top-3 left-3">
                                        {item.is_loanable ? (
                                            <Badge variant="success">Bisa Dipinjam</Badge>
                                        ) : (
                                            <Badge variant="danger">Tidak Bisa Dipinjam</Badge>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        {item.category && <span className="text-xs text-indigo-400">{item.category}</span>}
                                        <Badge variant={
                                            item.condition === 'good' ? 'success' :
                                                item.condition === 'fair' ? 'warning' : 'danger'
                                        }>
                                            {item.condition === 'good' ? 'Baik' : item.condition === 'fair' ? 'Cukup' : 'Kurang'}
                                        </Badge>
                                    </div>
                                    <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                                    <p className="text-sm text-white/50 mt-1">Stok: {item.available_stock} / {item.stock}</p>

                                    <div className="flex gap-2 mt-4">
                                        <Button variant="secondary" size="sm" className="flex-1" onClick={() => handleEdit(item)}>
                                            <Edit className="w-4 h-4" />Edit
                                        </Button>
                                        <Button variant="danger" size="sm" onClick={() => setDeleteItem(item)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingItem ? 'Edit Barang' : 'Tambah Barang'} size="lg">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input label="Nama Barang" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                        <Input label="Kategori" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Contoh: Elektronik" />
                    </div>

                    <Textarea label="Deskripsi" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Input label="Stok" type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })} required />
                        <Select label="Kondisi" value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}>
                            <option value="good">Baik</option>
                            <option value="fair">Cukup</option>
                            <option value="poor">Kurang</option>
                        </Select>
                        <div className="flex items-end">
                            <label className="flex items-center gap-3 p-3 rounded-xl bg-white/5 cursor-pointer w-full">
                                <input
                                    type="checkbox"
                                    checked={form.is_loanable}
                                    onChange={(e) => setForm({ ...form, is_loanable: e.target.checked })}
                                    className="w-5 h-5 rounded"
                                />
                                <div>
                                    <p className="text-white font-medium">Boleh Dipinjam</p>
                                    <p className="text-xs text-white/50">Aktifkan untuk membolehkan</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {!form.is_loanable && (
                        <Textarea
                            label="Alasan Tidak Boleh Dipinjam"
                            value={form.not_loanable_reason}
                            onChange={(e) => setForm({ ...form, not_loanable_reason: e.target.value })}
                            placeholder="Jelaskan alasan..."
                            rows={2}
                        />
                    )}

                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">Foto Barang</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
                            className="input"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>Batal</Button>
                        <Button type="submit" variant="primary" className="flex-1">{editingItem ? 'Simpan' : 'Tambah'}</Button>
                    </div>
                </form>
            </Modal>

            <ConfirmModal
                isOpen={!!deleteItem}
                onClose={() => setDeleteItem(null)}
                onConfirm={handleDelete}
                title="Hapus Barang?"
                message={`Yakin ingin menghapus "${deleteItem?.name}"?`}
            />
        </AdminOrgLayout>
    );
}
