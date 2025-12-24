import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Button, Input, Card } from '@/components/ui';
import toast from 'react-hot-toast';

export function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, isLoading } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const { user } = await login(email, password);
            toast.success('Login berhasil!');

            // Redirect based on role
            if (user.role === 'admin_master') {
                navigate('/admin-master');
            } else {
                navigate('/admin-org');
            }
        } catch (err) {
            const message = err.response?.data?.message || 'Login gagal. Periksa email dan password.';
            setError(message);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-primary mx-auto flex items-center justify-center mb-4 glow-primary">
                        <LogIn className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Masuk</h1>
                    <p className="text-white/60 mt-2">Sistem Peminjaman Barang Organisasi</p>
                </div>

                {/* Form */}
                <Card className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                                <p className="text-sm text-red-400">{error}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input pl-12"
                                    required
                                />
                            </div>

                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input pl-12"
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            isLoading={isLoading}
                            className="w-full"
                        >
                            Masuk
                        </Button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-white/10 text-center">
                        <p className="text-white/40 text-sm">
                            Ingin meminjam barang?{' '}
                            <a href="/" className="text-indigo-400 hover:text-indigo-300">
                                Kembali ke Beranda
                            </a>
                        </p>
                    </div>
                </Card>

                {/* Demo Credentials */}
                <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-white/50 text-sm text-center mb-2">Demo Credentials:</p>
                    <div className="text-xs text-white/40 space-y-1 font-mono">
                        <p>Admin Master: admin@peminjaman.com / password123</p>
                        <p>Admin OSIS: admin.osis@peminjaman.com / password123</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
