import React, { useEffect, useState } from 'react';
import { Plus, Search, Building2, Edit, Trash2, MoreVertical } from 'lucide-react';
import { AdminMasterLayout } from '@/layouts/AdminMasterLayout';
import { adminMasterApi } from '@/lib/api';
import { Card, Button, Input, Spinner, StatusBadge, EmptyState } from '@/components/ui';
import { Modal, ConfirmModal } from '@/components/Modal';
import toast from 'react-hot-toast';

export function OrganizationsPage() {
    const [organizations, setOrganizations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingOrg, setEditingOrg] = useState(null);
    const [deleteOrg, setDeleteOrg] = useState(null);

    const [form, setForm] = useState({
        name: '',
        description: '',
        address: '',
        phone: '',
        email: '',
    });

    useEffect(() => {
        fetchOrganizations();
    }, []);

    const fetchOrganizations = async () => {
        try {
            const { data } = await adminMasterApi.getOrganizations({ search });
            setOrganizations(data.data.data || data.data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchOrganizations();
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingOrg) {
                await adminMasterApi.updateOrganization(editingOrg.id, form);
                toast.success('Organisasi berhasil diperbarui');
            } else {
                await adminMasterApi.createOrganization(form);
                toast.success('Organisasi berhasil dibuat');
            }
            setShowModal(false);
            setEditingOrg(null);
            setForm({ name: '', description: '', address: '', phone: '', email: '' });
            fetchOrganizations();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Terjadi kesalahan');
        }
    };

    const handleEdit = (org) => {
        setEditingOrg(org);
        setForm({
            name: org.name,
            description: org.description || '',
            address: org.address || '',
            phone: org.phone || '',
            email: org.email || '',
        });
        setShowModal(true);
    };

    const handleDelete = async () => {
        try {
            await adminMasterApi.deleteOrganization(deleteOrg.id);
            toast.success('Organisasi berhasil dihapus');
            setDeleteOrg(null);
            fetchOrganizations();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menghapus');
        }
    };

    const handleToggleStatus = async (org) => {
        try {
            await adminMasterApi.updateOrganization(org.id, {
                status: org.status === 'active' ? 'inactive' : 'active',
            });
            toast.success('Status berhasil diubah');
            fetchOrganizations();
        } catch (error) {
            toast.error('Gagal mengubah status');
        }
    };

    return (
        <AdminMasterLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Manajemen Organisasi</h1>
                        <p className="text-white/60">Kelola semua organisasi dalam sistem</p>
                    </div>
                    <Button
                        variant="primary"
                        onClick={() => {
                            setEditingOrg(null);
                            setForm({ name: '', description: '', address: '', phone: '', email: '' });
                            setShowModal(true);
                        }}
                    >
                        <Plus className="w-4 h-4" />
                        Tambah Organisasi
                    </Button>
                </div>

                {/* Search */}
                <Card className="p-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                            type="text"
                            placeholder="Cari organisasi..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="input pl-12"
                        />
                    </div>
                </Card>

                {/* List */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Spinner size="lg" />
                    </div>
                ) : organizations.length === 0 ? (
                    <EmptyState
                        icon={Building2}
                        title="Belum ada organisasi"
                        description="Tambahkan organisasi pertama Anda"
                        action={
                            <Button variant="primary" onClick={() => setShowModal(true)}>
                                <Plus className="w-4 h-4" />
                                Tambah Organisasi
                            </Button>
                        }
                    />
                ) : (
                    <div className="grid gap-4">
                        {organizations.map((org) => (
                            <Card key={org.id} className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center flex-shrink-0">
                                        <Building2 className="w-7 h-7 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-semibold text-white truncate">{org.name}</h3>
                                            <StatusBadge status={org.status} />
                                        </div>
                                        <p className="text-sm text-white/50 truncate">{org.description || 'Tidak ada deskripsi'}</p>
                                        <div className="flex items-center gap-4 mt-1 text-xs text-white/40">
                                            <span>{org.items_count || 0} barang</span>
                                            <span>{org.loans_count || 0} peminjaman</span>
                                            <span>{org.users_count || 0} admin</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => handleToggleStatus(org)}
                                    >
                                        {org.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => handleEdit(org)}
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => setDeleteOrg(org)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingOrg ? 'Edit Organisasi' : 'Tambah Organisasi'}
                size="md"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Nama Organisasi"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                    />
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-white/70">Deskripsi</label>
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            className="input resize-none"
                            rows={3}
                        />
                    </div>
                    <Input
                        label="Alamat"
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Telepon"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        />
                        <Input
                            label="Email"
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            className="flex-1"
                            onClick={() => setShowModal(false)}
                        >
                            Batal
                        </Button>
                        <Button type="submit" variant="primary" className="flex-1">
                            {editingOrg ? 'Simpan' : 'Tambah'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirm */}
            <ConfirmModal
                isOpen={!!deleteOrg}
                onClose={() => setDeleteOrg(null)}
                onConfirm={handleDelete}
                title="Hapus Organisasi?"
                message={`Yakin ingin menghapus organisasi "${deleteOrg?.name}"? Semua data terkait akan ikut terhapus.`}
            />
        </AdminMasterLayout>
    );
}
