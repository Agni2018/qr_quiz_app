'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Card from '@/components/Card';
import { FaBell } from 'react-icons/fa';

export default function StudentNotifications() {
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const res = await api.get('/messages');
                setMessages(res.data);
                // Mark as read when entering this page
                await api.patch('/messages/read');
                // Notify layout to update unread count
                window.dispatchEvent(new CustomEvent('messages-read'));
            } catch (err) {
                console.error('Error fetching messages:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchMessages();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    if (messages.length === 0) {
        return (
            <Card className="p-20 text-center bg-slate-950/40 border-dashed border-2 border-white/5 rounded-[40px] mt-12">
                <div className="w-24 h-24 bg-slate-900 rounded-[2rem] flex items-center justify-center mx-auto mb-10 text-5xl">📭</div>
                <h3 className="text-3xl font-black mb-4">No notifications yet</h3>
                <p className="text-slate-500 max-w-md mx-auto leading-relaxed">You'll receive updates here when admins message you about your performance.</p>
            </Card>
        );
    }

    return (
        <div className="max-w-4xl mx-auto flex flex-col gap-6 mt-12">
            {messages.map((msg) => (
                <Card key={msg._id} className="p-10 border-white/5 bg-slate-950/40 hover:bg-slate-900/60 rounded-[2.5rem] transition-all group relative overflow-hidden">
                    {!msg.isRead && (
                        <div className="absolute top-8 right-8 w-4 h-4 bg-red-500 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.6)] animate-pulse z-10" />
                    )}
                    <div className="flex gap-8" style={{ padding: 30 }}>
                        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 text-3xl border border-blue-500/20 shrink-0">
                            <FaBell />
                        </div>
                        <div className="flex flex-col gap-4 flex-1">
                            <div className="flex justify-between items-start">
                                <h4 className="text-xl font-black text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">
                                    {msg.sender?.username || 'Admin'}
                                </h4>
                                <span className="text-[0.65rem] font-black uppercase tracking-widest text-slate-500">
                                    {new Date(msg.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <div className="bg-white/5 rounded-2xl p-6 border border-white/5" style={{ padding: 10 }}>
                                <p className="text-slate-300 text-lg leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}
