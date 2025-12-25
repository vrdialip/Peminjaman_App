import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const queryClient = useQueryClient();
    const lastCountRef = useRef(0);

    // Data query with polling
    const { data: notificationsData } = useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            const { data } = await notificationApi.getAll();
            return data.data;
        },
        refetchInterval: 15000, // Poll every 15s
    });

    const { data: unreadData } = useQuery({
        queryKey: ['notifications', 'unread'],
        queryFn: async () => {
            const { data } = await notificationApi.getUnreadCount();
            return data.count;
        },
        refetchInterval: 15000, // Poll every 15s
    });

    // Mark as read mutation
    const readMutation = useMutation({
        mutationFn: (id) => notificationApi.markAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['notifications']);
            queryClient.invalidateQueries(['notifications', 'unread']);
        }
    });

    const readAllMutation = useMutation({
        mutationFn: () => notificationApi.markAllRead(),
        onSuccess: () => {
            queryClient.invalidateQueries(['notifications']);
            queryClient.invalidateQueries(['notifications', 'unread']);
            toast.success('Semua notifikasi ditandai sudah dibaca');
        }
    });

    // System Notification effect
    useEffect(() => {
        if ("Notification" in window && Notification.permission !== "granted") {
            Notification.requestPermission();
        }
    }, []);

    // Watch for NEW notifications
    useEffect(() => {
        if (unreadData !== undefined) {
            if (unreadData > lastCountRef.current) {
                const diff = unreadData - lastCountRef.current;
                if (diff > 0) {
                    toast(`Ada ${diff} notifikasi baru!`, {
                        icon: '🔔',
                        duration: 4000
                    });

                    // Browser notification
                    if ("Notification" in window && Notification.permission === "granted") {
                        new Notification("Peminjaman Baru", {
                            body: `Ada ${diff} permintaan peminjaman baru masuk.`,
                            icon: '/favicon.ico' // adjust if needed
                        });
                    }
                }
            }
            lastCountRef.current = unreadData;
        }
    }, [unreadData]);

    const handleMarkRead = (id) => {
        readMutation.mutate(id);
    };

    return (
        <div className="relative z-50">
            <button
                className="relative p-2 rounded-full hover:bg-slate-700 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Bell className="w-6 h-6 text-white" />
                {unreadData > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border border-[#0f172a]" />
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-80 bg-slate-800 rounded-xl shadow-xl border border-slate-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                        <div className="p-3 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
                            <h3 className="font-semibold text-white text-sm">Notifikasi</h3>
                            <button
                                onClick={() => readAllMutation.mutate()}
                                className="text-xs text-indigo-400 hover:text-indigo-300"
                            >
                                Tandai semua dibaca
                            </button>
                        </div>

                        <div className="max-h-96 overflow-y-auto custom-scrollbar">
                            {notificationsData?.length === 0 ? (
                                <div className="p-8 text-center text-white/50 text-sm">
                                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    Tidak ada notifikasi.
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-700/50">
                                    {notificationsData?.map(notif => (
                                        <div
                                            key={notif.id}
                                            className={`p-4 transition-colors ${!notif.read_at ? 'bg-indigo-500/10 hover:bg-indigo-500/20' : 'hover:bg-slate-700/30'}`}
                                        >
                                            <div className="flex justify-between items-start gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-white font-medium truncate">{notif.data.item_name}</p>
                                                    <p className="text-xs text-white/70 mt-0.5 line-clamp-2">{notif.data.message}</p>
                                                    <p className="text-[10px] text-white/40 mt-1.5 font-mono">
                                                        {new Date(notif.created_at).toLocaleString('id-ID')}
                                                    </p>
                                                </div>
                                                {!notif.read_at && (
                                                    <button
                                                        onClick={() => handleMarkRead(notif.id)}
                                                        className="p-1.5 rounded-full hover:bg-white/10 text-indigo-400 flex-shrink-0"
                                                        title="Tandai sudah dibaca"
                                                    >
                                                        <Check className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
