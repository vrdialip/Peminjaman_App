import React, { useEffect, useState } from 'react';
import { Plus, Search, Users, Edit, Key, UserX, UserCheck, Trash2 } from 'lucide-react';
import { AdminMasterLayout } from '@/layouts/AdminMasterLayout';
import { adminMasterApi } from '@/lib/api';
import { Card, Button, Input, Select, Spinner, StatusBadge, EmptyState } from '@/components/ui';
import { Modal } from '@/components/Modal';
import toast from 'react-hot-toast';

export function AdminsPage() {
    const [admins, setAdmins] = useState([]);
    const [organizations, setOrganizations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [isEdit, setIsEdit] = useState(false);

    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        organization_id: '',
        phone: '',
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [adminsRes, orgsRes] = await Promise.all([
                adminMasterApi.getAdmins({ search }),
                adminMasterApi.getOrganizations(),
            ]);
            setAdmins(adminsRes.data.data.data || adminsRes.data.data);
            setOrganizations(orgsRes.data.data.data || orgsRes.data.data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData();
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEdit) {
                await adminMasterApi.updateAdmin(selectedAdmin.id, form);
                toast.success('Admin berhasil diperbarui');
            } else {
                await adminMasterApi.createAdmin(form);
                toast.success('Admin berhasil dibuat');
            }
            setShowModal(false);
            setForm({ name: '', email: '', password: '', organization_id: '', phone: '' });
            setIsEdit(false);
            setSelectedAdmin(null);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || (isEdit ? 'Gagal memperbarui admin' : 'Gagal membuat admin'));
        }
    };

    const handleEdit = (admin) => {
        setSelectedAdmin(admin);
        setForm({
            name: admin.name,
            email: admin.email,
            password: '', // Leave empty for update
            organization_id: admin.organization_id,
            phone: admin.phone || '',
        });
        setIsEdit(true);
        setShowModal(true);
    };

    const handleResetPassword = async () => {
        if (!newPassword || newPassword.length < 8) {
            toast.error('Password minimal 8 karakter');
            return;
        }
        try {
            await adminMasterApi.resetAdminPassword(selectedAdmin.id, newPassword);
            toast.success('Password berhasil direset');
            setShowPasswordModal(false);
            setSelectedAdmin(null);
            setNewPassword('');
        } catch (error) {
            toast.error('Gagal reset password');
        }
    };

    const handleToggleStatus = async (admin) => {
        try {
            await adminMasterApi.toggleAdminStatus(admin.id);
            toast.success('Status berhasil diubah');
            fetchData();
        } catch (error) {
            toast.error('Gagal mengubah status');
        }
    };

    const handleDelete = async (admin) => {
        if (!window.confirm(`Apakah Anda yakin ingin menghapus admin ${admin.name}?`)) {
            return;
        }
        try {
            await adminMasterApi.deleteAdmin(admin.id);
            toast.success('Admin berhasil dihapus');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menghapus admin');
        }
    };

    return (
        <AdminMasterLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Manajemen Admin Organisasi</h1>
                        <p className="text-white/60">Kelola akun admin untuk setiap organisasi</p>
                    </div>
                    <Button variant="primary" onClick={() => setShowModal(true)}>
                        <Plus className="w-4 h-4" />
                        Tambah Admin
                    </Button>
                </div>

                {/* Search */}
                <Card className="p-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                            type="text"
                            placeholder="Cari admin..."
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
                ) : admins.length === 0 ? (
                    <EmptyState
                        icon={Users}
                        title="Belum ada admin organisasi"
                        description="Buat akun admin untuk mengelola organisasi"
                        action={
                            <Button variant="primary" onClick={() => setShowModal(true)}>
                                <Plus className="w-4 h-4" />
                                Tambah Admin
                            </Button>
                        }
                    />
                ) : (
                    <div className="grid gap-4">
                        {admins.map((admin) => (
                            <Card key={admin.id} className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                                        <span className="text-white font-bold text-lg">
                                            {admin.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-white">{admin.name}</h3>
                                            <StatusBadge status={admin.status} />
                                        </div>
                                        <p className="text-sm text-white/50">{admin.email}</p>
                                        <p className="text-xs text-indigo-400 mt-1">
                                            {admin.organization?.name || 'Tidak ada organisasi'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => handleEdit(admin)}
                                        title="Edit"
                                        className="!bg-blue-500/20 !text-blue-400 hover:!bg-blue-500/30"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedAdmin(admin);
                                            setShowPasswordModal(true);
                                        }}
                                        title="Reset Password"
                                    >
                                        <Key className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant={admin.status === 'active' ? 'danger' : 'success'}
                                        size="sm"
                                        onClick={() => handleToggleStatus(admin)}
                                        title={admin.status === 'active' ? 'Suspend' : 'Aktifkan'}
                                    >
                                        {admin.status === 'active' ? (
                                            <UserX className="w-4 h-4" />
                                        ) : (
                                            <UserCheck className="w-4 h-4" />
                                        )}
                                    </Button>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => handleDelete(admin)}
                                        title="Hapus"
                                        className="!bg-red-500/20 !text-red-400 hover:!bg-red-500/30"
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
                onClose={() => {
                    setShowModal(false);
                    setIsEdit(false);
                    setSelectedAdmin(null);
                    setForm({ name: '', email: '', password: '', organization_id: '', phone: '' });
                }}
                title={isEdit ? "Edit Admin Organisasi" : "Tambah Admin Organisasi"}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Nama"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                    />
                    <Input
                        label="Email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                    />
                    <Input
                        label={isEdit ? "Password (Kosongkan jika tidak diubah)" : "Password"}
                        type="password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        required={!isEdit}
                    />
                    <Select
                        label="Organisasi"
                        value={form.organization_id}
                        onChange={(e) => setForm({ ...form, organization_id: e.target.value })}
                        required
                    >
                        <option value="">Pilih Organisasi</option>
                        {organizations.map((org) => (
                            <option key={org.id} value={org.id}>{org.name}</option>
                        ))}
                    </Select>
                    <Input
                        label="No. HP"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            className="flex-1"
                            onClick={() => {
                                setShowModal(false);
                                setIsEdit(false);
                                setSelectedAdmin(null);
                                setForm({ name: '', email: '', password: '', organization_id: '', phone: '' });
                            }}
                        >
                            Batal
                        </Button>
                        <Button type="submit" variant="primary" className="flex-1">
                            {isEdit ? "Simpan Perubahan" : "Tambah Admin"}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Reset Password Modal */}
            <Modal
                isOpen={showPasswordModal}
                onClose={() => {
                    setShowPasswordModal(false);
                    setNewPassword('');
                }}
                title="Reset Password"
                size="sm"
            >
                <div className="space-y-4">
                    <p className="text-white/60">
                        Reset password untuk <span className="text-white font-medium">{selectedAdmin?.name}</span>
                    </p>
                    <Input
                        label="Password Baru"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimal 8 karakter"
                    />
                    <div className="flex gap-3 pt-4">
                        <Button
                            variant="secondary"
                            className="flex-1"
                            onClick={() => {
                                setShowPasswordModal(false);
                                setNewPassword('');
                            }}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="primary"
                            className="flex-1"
                            onClick={handleResetPassword}
                        >
                            Reset Password
                        </Button>
                    </div>
                </div>
            </Modal>
        </AdminMasterLayout>
    );
}
