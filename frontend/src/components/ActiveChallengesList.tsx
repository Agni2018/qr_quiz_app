'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Card from './Card';
import { FaTrash, FaStar, FaCalendarAlt, FaTrophy } from 'react-icons/fa';
import AlertModal from '@/components/AlertModal';
import ConfirmModal from '@/components/ConfirmModal';

export default function ActiveChallengesList() {
    const [challenges, setChallenges] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [alertModal, setAlertModal] = useState({ isOpen: false, message: '', type: 'info' as 'success' | 'error' | 'info' });
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, message: '', onConfirm: () => {} });

    const fetchChallenges = async () => {
        try {
            const res = await api.get('/challenges');
            setChallenges(res.data);
        } catch (err) {
            console.error('Error fetching challenges:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChallenges();
    }, []);

    const handleDelete = async (id: string) => {
        setConfirmModal({
            isOpen: true,
            message: 'Are you sure you want to delete this challenge?',
            onConfirm: async () => {
                try {
                    await api.delete(`/challenges/${id}`);
                    fetchChallenges();
                    setAlertModal({ isOpen: true, message: 'Challenge deleted successfully', type: 'success' });
                } catch (err) {
                    console.error('Error deleting challenge:', err);
                    setAlertModal({ isOpen: true, message: 'Failed to delete challenge', type: 'error' });
                }
            }
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center p-20">
                <div className="w-12 h-12 border-4 border-white/10 border-top-primary rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">
                Active <span className="text-slate-500">Challenges</span>
            </h3>

            {challenges.length === 0 ? (
                <Card className="p-20 text-center border-dashed border-2 border-white/5 opacity-50" style={{ padding: 40 }}>
                    <h3 className="text-xl font-bold text-slate-500 uppercase tracking-widest">No Challenges Created</h3>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {challenges.map((c) => (
                        <Card 
                            key={c._id} 
                            className="group relative border border-white/10 bg-black/40 hover:bg-black/60 hover:border-primary/40 transition-all duration-300 rounded-2xl overflow-hidden" 
                            style={{ padding: '20px', margin: '0 0 10px 0',background: '#1a1f2e' }}
                        >
                            <div className="flex flex-col gap-3">
                                {/* CARD HEADER: Type & Rewards & Actions */}
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <div className="px-3 py-1.5 rounded-lg bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/30" style={{padding:5,fontSize:12}}>
                                            {c.type.replace('_', ' ')}
                                        </div>
                                        <div className="px-3 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-500 text-[10px] font-black uppercase tracking-widest border border-yellow-500/20 flex items-center gap-2" style={{padding:5,fontSize:12}}>
                                            <FaStar size={10} className="text-yellow-500" /> <span className="text-white">+{c.rewardPoints} <span className="text-yellow-500/60">pts</span></span>
                                        </div>
                                        <div className="px-3 py-1.5 rounded-lg bg-white/5 text-slate-400 text-[10px] font-black uppercase tracking-widest border border-white/5 flex items-center gap-2" style={{padding:6,fontSize:12}}>
                                            <FaCalendarAlt size={10} className="text-emerald-500/50" />
                                            <span>{new Date(c.startDate).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' })} - {new Date(c.endDate).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' })}</span>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => handleDelete(c._id)}
                                        className="p-3 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all border border-rose-500/20 shadow-lg group/trash"
                                        title="Delete Challenge"
                                    >
                                        <FaTrash size={16} className="group-hover/trash:scale-110 transition-transform" />
                                    </button>
                                </div>

                                {/* CARD CONTENT: Name & Description */}
                                <div className="flex flex-col gap-1">
                                    <h4 className="text-lg font-bold text-white group-hover:text-primary transition-colors flex items-center gap-2">
                                        {c.name}
                                        <span className="text-slate-500 text-xs font-medium">({c.threshold} 🎯)</span>
                                    </h4>
                                    <p className="text-slate-400 text-xs leading-relaxed line-clamp-2 italic opacity-80">
                                        "{c.description}"
                                    </p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmModal.onConfirm}
                message={confirmModal.message}
            />
            <AlertModal
                isOpen={alertModal.isOpen}
                onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
                message={alertModal.message}
                type={alertModal.type}
            />
        </div>
    );
}
