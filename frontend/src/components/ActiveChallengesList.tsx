'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Card from './Card';
import Pagination from './Pagination';
import { FaTrash, FaStar, FaCalendarAlt, FaTrophy } from 'react-icons/fa';
import AlertModal from '@/components/AlertModal';
import ConfirmModal from '@/components/ConfirmModal';

export default function ActiveChallengesList() {
    const [challenges, setChallenges] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [alertModal, setAlertModal] = useState({ isOpen: false, message: '', type: 'info' as 'success' | 'error' | 'info' });
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, message: '', onConfirm: () => {} });

    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    const isMobile = windowWidth < 768;

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
            <h3 className="text-2xl font-black text-[#0a0f1e] mb-2 uppercase tracking-tight" style={{color:'orange'}}>
                Active <span className="text-orange-600">Challenges</span>
            </h3>

            {challenges.length > 0 && (
                <div style={{ 
                    marginTop: '1.5rem', 
                    marginBottom: '2rem',
                    display: 'flex',
                    justifyContent: 'flex-start'
                }}>
                    <Pagination 
                        currentPage={currentPage}
                        totalItems={challenges.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        isMobile={isMobile}
                    />
                </div>
            )}

            {challenges.length === 0 ? (
                <Card className="p-20 text-center border-dashed border-2 border-slate-200 bg-slate-50 opacity-100 shadow-inner" style={{ background: 'white', padding: 40 }}>
                    <h3 className="text-xl font-bold text-slate-400 uppercase tracking-widest">No Challenges Created</h3>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {challenges.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((c) => (
                        <Card 
                            key={c._id} 
                            className="group relative border border-slate-200 bg-white hover:bg-slate-50 hover:border-primary/40 transition-all duration-300 rounded-2xl overflow-hidden" 
                            style={{ background: 'white', padding: '20px', margin: '0 0 10px 0' }}
                        >
                            <div className="flex flex-col gap-3">
                                {/* CARD HEADER: Type & Rewards & Actions */}
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <div className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-widest border border-slate-200" style={{padding:5,fontSize:12}}>
                                            {c.type.replace('_', ' ')}
                                        </div>
                                        <div className="px-3 py-1.5 rounded-lg bg-yellow-50 text-yellow-600 text-[10px] font-black uppercase tracking-widest border border-yellow-200 flex items-center gap-2" style={{padding:5,fontSize:12}}>
                                            <FaStar size={10} className="text-yellow-500" /> <span className="text-yellow-600">+{c.rewardPoints} <span className="text-yellow-600/80">pts</span></span>
                                        </div>
                                        <div className="px-3 py-1.5 rounded-lg bg-orange-50 text-slate-500 text-[10px] font-black uppercase tracking-widest border border-slate-200 flex items-center gap-2" style={{padding:6,fontSize:12}}>
                                            <FaCalendarAlt size={10} className="text-emerald-500/50" />
                                            <span>{new Date(c.startDate).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' })} - {new Date(c.endDate).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' })}</span>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => handleDelete(c._id)}
                                        className="p-2.5 bg-transparent hover:bg-rose-50 text-rose-500 rounded-xl transition-all"
                                        title="Delete Challenge"
                                    >
                                        <FaTrash size={14} className="hover:scale-110 transition-transform" />
                                    </button>
                                </div>

                                {/* CARD CONTENT: Name & Description */}
                                <div className="flex flex-col gap-1">
                                    <h4 className="text-lg font-bold text-black group-hover:text-primary transition-colors flex items-center gap-2" style={{ color: '#000' }}>
                                        {c.name}
                                        <span className="text-slate-500 text-xs font-medium" style={{ color: '#333' }}>({c.threshold} 🎯)</span>
                                    </h4>
                                    <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 italic opacity-80" style={{ color: '#333' }}>
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
