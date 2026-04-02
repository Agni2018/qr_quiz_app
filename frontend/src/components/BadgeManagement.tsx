'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Card from './Card';
import Button from './Button';
import Input from './Input';
import TextArea from './TextArea';
import { FaTrash, FaPlus, FaAward, FaTrophy, FaStar, FaBolt, FaUsers, FaChevronDown, FaTimes } from 'react-icons/fa';
import AlertModal from '@/components/AlertModal';
import ConfirmModal from '@/components/ConfirmModal';
import Pagination from './Pagination';
import { useSearch } from '@/contexts/SearchContext';

const ITEMS_PER_PAGE = 9;

export default function BadgeManagement() {
    const [badges, setBadges] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const { searchTerm } = useSearch();

    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const handleResize = () => setWindowWidth(window.innerWidth);
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }
    }, []);

    const isMobile = windowWidth < 768;

    const [newBadge, setNewBadge] = useState<any>({
        name: '',
        description: '',
        icon: 'FaAward',
        type: 'points',
        threshold: ''
    });

    const [alertModal, setAlertModal] = useState({ isOpen: false, message: '', type: 'info' as 'success' | 'error' | 'info' });
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, message: '', onConfirm: () => { } });

    const icons = [
        { name: 'FaAward', icon: <FaAward /> },
        { name: 'FaTrophy', icon: <FaTrophy /> },
        { name: 'FaStar', icon: <FaStar /> },
        { name: 'FaBolt', icon: <FaBolt /> },
        { name: 'FaUsers', icon: <FaUsers /> }
    ];

    const types = [
        { value: 'points', label: 'Total Points' },
        { value: 'streak', label: 'Login Streak' },
        { value: 'referral', label: 'Referrals' },
        { value: 'quiz_perfect', label: 'Perfect Quizzes' }
    ];

    const fetchBadges = async () => {
        try {
            const res = await api.get('/badges');
            setBadges(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBadges();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handleSubmit = async () => {
        if (!newBadge.name) return setAlertModal({ isOpen: true, message: 'Name is required', type: 'error' });
        try {
            const payload = { ...newBadge, threshold: Number(newBadge.threshold) || 0 };
            await api.post('/badges', payload);
            setShowForm(false);
            setNewBadge({ name: '', description: '', icon: 'FaAward', type: 'points', threshold: '' });
            setAlertModal({ isOpen: true, message: 'Badge created successfully', type: 'success' });
            fetchBadges();
        } catch (err) {
            setAlertModal({ isOpen: true, message: 'Failed to create badge', type: 'error' });
        }
    };

    const deleteBadge = (id: string) => {
        setConfirmModal({
            isOpen: true,
            message: 'Are you sure you want to delete this badge?',
            onConfirm: async () => {
                try {
                    await api.delete(`/badges/${id}`);
                    fetchBadges();
                    setAlertModal({ isOpen: true, message: 'Badge deleted successfully', type: 'success' });
                } catch (err) {
                    setAlertModal({ isOpen: true, message: 'Failed to delete badge', type: 'error' });
                }
            }
        });
    };

    const filteredBadges = badges.filter(b =>
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-slate-100 border-t-orange-500 rounded-full animate-spin" />
        </div>
    );

    const totalItems = filteredBadges.length;
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentItems = filteredBadges.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return (
        <div className="flex flex-col gap-10">
            <div className="flex flex-col lg:flex-row justify-between items-end gap-6">
                <div className="flex flex-col gap-1">
                   
                    <h3 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter" style={{color:'black'}}>System Badges</h3>
                   
                </div>
                <Button
                    onClick={() => setShowForm(true)}
                    className="h-14 px-8 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
                    style={{ background: '#f97316' }}
                >
                    <FaPlus className="mr-2" /> Create Badge
                </Button>
            </div>

            {showForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" >
                    <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar rounded-[2rem] shadow-2xl bg-white p-8 mb-4 flex flex-col gap-8" style={{ padding: '24px 32px', margin: '1rem 1rem 1rem 1rem' }}>
                        <div className="flex justify-between items-center">
                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight" style={{color:'black'}}>New Badge Definition</h3>
                            <button
                                onClick={() => setShowForm(false)}
                                className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-white hover:bg-red-500 transition-all shadow-sm"
                                title="Close Modal"
                            >
                                <FaTimes size={18} />
                            </button>
                        </div>

                        <div className="flex flex-col gap-6">
                            <label className="flex flex-col gap-2">
                                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.2em] pl-1">Badge Name <span className="text-red-500">*</span></span>
                                <Input
                                    value={newBadge.name}
                                    onChange={e => setNewBadge({ ...newBadge, name: e.target.value })}
                                    placeholder="e.g. Speed Demon"
                                    style={{ background: 'white', color: 'black', border: '1px solid #e2e8f0' }}
                                />
                            </label>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <label className="flex flex-col gap-2">
                                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.2em] pl-1">Tracking Metric <span className="text-red-500">*</span></span>
                                    <div className="relative">
                                        <select
                                            className="w-full h-14 p-4 pr-12 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none appearance-none cursor-pointer focus:border-orange-500 font-bold"
                                            value={newBadge.type}
                                            onChange={e => setNewBadge({ ...newBadge, type: e.target.value })}
                                        >
                                            {types.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                        </select>
                                        <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                                    </div>
                                </label>
                                <label className="flex flex-col gap-2">
                                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.2em] pl-1">Threshold Value <span className="text-red-500">*</span></span>
                                    <Input
                                        type="number"
                                        value={newBadge.threshold}
                                        onChange={e => setNewBadge({ ...newBadge, threshold: e.target.value })}
                                        style={{ background: 'white', color: 'black', border: '1px solid #e2e8f0' }}
                                    />
                                </label>
                            </div>

                            <label className="flex flex-col gap-2">
                                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.2em] pl-1">Description <span className="text-red-500">*</span></span>
                                <TextArea
                                    value={newBadge.description}
                                    onChange={e => setNewBadge({ ...newBadge, description: e.target.value })}
                                    placeholder="Explain how this badge is earned..."
                                    style={{ background: 'white', color: '#1e293b', border: '1px solid #e2e8f0' }}
                                />
                            </label>

                            <div className="flex flex-col gap-3">
                                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.2em] pl-1">Visual Symbol</span>
                                <div className="flex gap-4">
                                    {icons.map(icon => (
                                        <button
                                            key={icon.name}
                                            onClick={() => setNewBadge({ ...newBadge, icon: icon.name })}
                                            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all border ${newBadge.icon === icon.name
                                                ? 'bg-orange-500 border-orange-500 text-white scale-110 shadow-lg shadow-orange-500/20'
                                                : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-slate-200'}`}
                                        >
                                            {icon.icon}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100 flex gap-4">
                            <Button variant="ghost" className="flex-1 h-12 text-slate-400 uppercase font-black tracking-widest text-[11px]" onClick={() => setShowForm(false)}>Cancel</Button>
                            <Button className="flex-1 h-12 bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20 uppercase font-black tracking-widest text-[11px]" onClick={handleSubmit}>Save Definition</Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {currentItems.map(badge => (
                    <div
                        key={badge._id}
                        className="bg-white rounded-[2.5rem] flex flex-col group relative overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100"
                        style={{ padding: '20px', minHeight: '260px' }}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-2xl text-orange-500 group-hover:scale-110 transition-transform" style={{ marginBottom: 6 }}>
                                {icons.find(i => i.name === badge.icon)?.icon || <FaAward />}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-slate-50 text-slate-400 rounded-md" style={{ color: 'green' }}>
                                {badge.type.replace('_', ' ')}
                            </span>
                        </div>

                        <div className="flex flex-col gap-3 flex-1">
                            <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-tight group-hover:text-orange-500 transition-colors" style={{ color: 'black' }}>{badge.name}</h4>
                            <p className="text-sm font-bold text-slate-400 line-clamp-3 leading-relaxed" style={{ color: 'black' }}>{badge.description}</p>
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-50 flex flex-col gap-4">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest" style={{ color: 'black' }}>Requirement</span>
                                <span className="text-lg font-black text-slate-900 tracking-tighter">
                                    {badge.threshold} <span className="text-[10px] text-slate-400 uppercase">{badge.type === 'points' ? 'pts' : badge.type === 'streak' ? 'days' : 'units'}</span>
                                </span>
                            </div>
                            <button
                                className="w-full h-10 flex items-center justify-center gap-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all text-[11px] font-black uppercase tracking-widest border border-red-100"
                                onClick={() => deleteBadge(badge._id)}
                            >
                                <FaTrash size={12} /> Remove Badge
                            </button>
                        </div>
                    </div>
                ))}

                {currentItems.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200 flex flex-col items-center justify-center">
                        <FaAward className="text-6xl mb-6 text-slate-200" />
                        <h3 className="text-lg font-black text-slate-400 uppercase tracking-tight">No badges discovered</h3>
                    </div>
                )}
            </div>

            {totalItems > 0 && (
                <div className="flex justify-center mt-12 mb-8">
                    <Pagination
                        currentPage={currentPage}
                        totalItems={totalItems}
                        itemsPerPage={ITEMS_PER_PAGE}
                        onPageChange={setCurrentPage}
                    />
                </div>
            )}

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmModal.onConfirm}
                message={confirmModal.message}
                isDanger={true}
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
