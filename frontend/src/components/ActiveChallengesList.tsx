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
        <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-2 mb-6">
                <h3 className="text-3xl font-black text-white/50 border-l-4 border-primary pl-4 uppercase tracking-widest" style={{margin:"2rem 1rem 1rem 1rem"}}>Active Challenges</h3>
                <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] pl-5" style={{margin:"2rem 1rem 1rem 1rem"}}>Monitoring and managing current weekly goals</p>
            </div>

            {challenges.length === 0 ? (
                <Card className="p-20 text-center border-dashed border-2 border-white/5 opacity-50" style={{margin:"2rem 1rem 1rem 1rem"}}>
                    <h3 className="text-2xl font-black text-slate-500 uppercase tracking-widest">No Challenges Created</h3>
                </Card>
            ) : (
                <div className="flex flex-col gap-8">
                    {challenges.map((c) => (
                        <Card key={c._id} className="group relative border-2 border-white/5 hover:border-primary/20 bg-white/5 hover:bg-primary/5 transition-all duration-500" style={{ padding: 'max(1.25rem, 2vw)', margin: "1rem 1rem" }}>
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-2xl sm:rounded-[1.5rem] flex items-center justify-center text-2xl sm:text-3xl text-primary border border-primary/20 shadow-[0_0_30px_rgba(var(--primary-rgb),0.1)] group-hover:scale-105 transition-transform duration-500 shrink-0">
                                        <FaStar className="animate-pulse" />
                                    </div>
                                    <div className="flex flex-col gap-2 sm:gap-3">
                                        <h4 className="text-2xl sm:text-3xl font-black text-white group-hover:text-primary transition-colors">{c.name}</h4>
                                        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                                            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest px-4 py-1.5 sm:px-5 sm:py-2 bg-primary text-black rounded-full">
                                                {c.type.replace('_', ' ')}
                                            </span>
                                            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                                <FaCalendarAlt className="text-primary/50" /> 
                                                <span>
                                                    {new Date(c.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                                                    <span className="mx-2 opacity-30">/</span>
                                                    {new Date(c.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between lg:justify-end gap-6 sm:gap-12 pt-6 lg:pt-0 border-t lg:border-t-0 border-white/5">
                                    <div className="text-left lg:text-right flex flex-col gap-1 sm:gap-2">
                                        <p className="text-[10px] sm:text-[11px] font-black text-slate-500 uppercase tracking-widest">Requirement / Bounty</p>
                                        <div className="flex items-center lg:justify-end gap-3 lg:translate-x-3">
                                            <span className="text-xl sm:text-2xl font-black text-white">{c.threshold}</span>
                                            <span className="text-slate-500 text-sm font-bold">🎯</span>
                                            <span className="text-2xl sm:text-3xl font-black text-yellow-500">+{c.rewardPoints} <span className="text-[11px] uppercase opacity-60">pts</span></span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleDelete(c._id)}
                                        className="w-12 h-12 sm:w-16 sm:h-16 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl sm:rounded-[1.5rem] flex items-center justify-center text-xl sm:text-2xl transition-all duration-300 transform hover:rotate-12 active:scale-95 border border-rose-500/20 shrink-0"
                                        title="Delete Challenge"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                            <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-white/5">
                                <p className="text-slate-400 font-medium leading-relaxed max-w-3xl text-sm sm:text-lg italic" style={{marginTop:15}}>
                                    "{c.description}"
                                </p>
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
