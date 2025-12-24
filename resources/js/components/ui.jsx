import React from 'react';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled = false,
    className = '',
    ...props
}) {
    const variants = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        success: 'btn-success',
        danger: 'btn-danger',
        outline: 'btn-outline',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2',
        lg: 'px-6 py-3 text-lg',
    };

    return (
        <button
            className={clsx(
                'btn',
                variants[variant],
                sizes[size],
                className
            )}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {children}
        </button>
    );
}

export function Input({
    label,
    error,
    className = '',
    ...props
}) {
    return (
        <div className="space-y-1">
            {label && (
                <label className="block text-sm font-medium text-white/70">
                    {label}
                </label>
            )}
            <input
                className={clsx(
                    'input',
                    error && 'border-red-500 focus:border-red-500',
                    className
                )}
                {...props}
            />
            {error && (
                <p className="text-sm text-red-400">{error}</p>
            )}
        </div>
    );
}

export function Textarea({
    label,
    error,
    className = '',
    rows = 4,
    ...props
}) {
    return (
        <div className="space-y-1">
            {label && (
                <label className="block text-sm font-medium text-white/70">
                    {label}
                </label>
            )}
            <textarea
                rows={rows}
                className={clsx(
                    'input resize-none',
                    error && 'border-red-500 focus:border-red-500',
                    className
                )}
                {...props}
            />
            {error && (
                <p className="text-sm text-red-400">{error}</p>
            )}
        </div>
    );
}

export function Select({
    label,
    error,
    children,
    className = '',
    ...props
}) {
    return (
        <div className="space-y-1">
            {label && (
                <label className="block text-sm font-medium text-white/70">
                    {label}
                </label>
            )}
            <select
                className={clsx(
                    'input bg-slate-800',
                    error && 'border-red-500 focus:border-red-500',
                    className
                )}
                {...props}
            >
                {children}
            </select>
            {error && (
                <p className="text-sm text-red-400">{error}</p>
            )}
        </div>
    );
}

export function Card({ children, className = '', hover = true }) {
    return (
        <div className={clsx(
            'glass-card p-6',
            hover && 'transition-all duration-300 hover:border-indigo-500/30',
            className
        )}>
            {children}
        </div>
    );
}

export function Badge({ variant = 'primary', children, className = '' }) {
    const variants = {
        primary: 'badge-primary',
        success: 'badge-success',
        warning: 'badge-warning',
        danger: 'badge-danger',
        info: 'badge-info',
    };

    return (
        <span className={clsx('badge', variants[variant], className)}>
            {children}
        </span>
    );
}

export function Spinner({ size = 'md', className = '' }) {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
    };

    return (
        <div className={clsx('spinner', sizes[size], className)} />
    );
}

export function LoadingScreen({ message = 'Memuat...' }) {
    return (
        <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
            <div className="text-center">
                <Spinner size="lg" />
                <p className="mt-4 text-white/70">{message}</p>
            </div>
        </div>
    );
}

export function EmptyState({ icon: Icon, title, description, action }) {
    return (
        <div className="text-center py-12">
            {Icon && <Icon className="w-16 h-16 mx-auto text-white/20 mb-4" />}
            <h3 className="text-lg font-semibold text-white/80">{title}</h3>
            {description && (
                <p className="mt-2 text-white/50">{description}</p>
            )}
            {action && <div className="mt-6">{action}</div>}
        </div>
    );
}

export function StatusBadge({ status }) {
    const statusConfig = {
        pending: { label: 'Menunggu Verifikasi', variant: 'warning' },
        rejected: { label: 'Ditolak', variant: 'danger' },
        borrowed: { label: 'Dipinjam', variant: 'info' },
        return_pending: { label: 'Menunggu Cek', variant: 'warning' },
        completed: { label: 'Selesai', variant: 'success' },
        completed_damaged: { label: 'Selesai (Rusak)', variant: 'danger' },
        completed_lost: { label: 'Selesai (Hilang)', variant: 'danger' },
        active: { label: 'Aktif', variant: 'success' },
        inactive: { label: 'Nonaktif', variant: 'danger' },
        suspended: { label: 'Ditangguhkan', variant: 'warning' },
    };

    const config = statusConfig[status] || { label: status, variant: 'primary' };

    return <Badge variant={config.variant}>{config.label}</Badge>;
}
