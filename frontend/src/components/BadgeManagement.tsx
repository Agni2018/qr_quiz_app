'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Card from './Card';
import Button from './Button';
import Input from './Input';
import TextArea from './TextArea';
import { FaTrash, FaPlus, FaAward, FaTrophy, FaStar, FaBolt, FaUsers, FaChevronDown } from 'react-icons/fa';
import AlertModal from '@/components/AlertModal';
import ConfirmModal from '@/components/ConfirmModal';
import Pagination from './Pagination';
import { usePathname } from 'next/navigation';

export default function BadgeManagement() {
    const [badges, setBadges] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowWidth < 768;

    const [newBadge, setNewBadge] = useState({
        name: '',
        description: '',
        icon: 'FaAward',
        type: 'points',
        threshold: 100
    });

    const [alertModal, setAlertModal] = useState({ isOpen: false, message: '', type: 'info' as 'success' | 'error' | 'info' });
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, message: '', onConfirm: () => {} });

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

    const handleSubmit = async () => {
        if (!newBadge.name) return setAlertModal({ isOpen: true, message: 'Name is required', type: 'error' });
        try {
            await api.post('/badges', newBadge);
            setShowForm(false);
            setNewBadge({ name: '', description: '', icon: 'FaAward', type: 'points', threshold: 100 });
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

    if (loading) return <div className="flex justify-center items-center py-20"><div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

    const totalItems = badges.length;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = badges.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="flex flex-col gap-10">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6 px-4">
                <h3 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase" style={{color:'orange'}}>System Badges</h3>
                <Button 
                    onClick={() => setShowForm(!showForm)} 
                    className="w-full sm:w-auto h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl"
                >
                    {showForm ? 'Cancel' : <><FaPlus className="mr-2" /> Create Badge</>}
                </Button>
            </div>

            {showForm && (
                <Card className="border-white/10 shadow-2xl mx-2 sm:mx-4 rounded-[2.5rem] p-5 sm:p-8 md:p-10" style={{ background: '#1a1f2e',padding:45 }}>
                    <div className="flex flex-col gap-10">
                        <div className="flex flex-col gap-6">
                            <h5 className="text-xl font-black text-white/90 border-l-4 border-primary pl-4 mb-4 uppercase tracking-widest">Badge Identity</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <Input
                                    label={<span className="text-white/90">Badge Name <span className="text-rose-500">*</span></span>}
                                    value={newBadge.name}
                                    onChange={e => setNewBadge({ ...newBadge, name: e.target.value })}
                                    placeholder="e.g. Points Warrior"
                                    className="!px-8 h-[64px] !rounded-2xl border-white/10 bg-[#0f172a] !text-white"
                                />
                                <Input
                                    label={<span className="text-white/90">Requirement Threshold <span className="text-rose-500">*</span></span>}
                                    type="number"
                                    value={newBadge.threshold}
                                    onChange={e => setNewBadge({ ...newBadge, threshold: Number(e.target.value) })}
                                    className="!px-8 h-[64px] !rounded-2xl border-white/10 bg-[#0f172a] !text-white"
                                    placeholder="Value"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-6">
                            <h5 className="text-xl font-black text-white/90 border-l-4 border-primary pl-4 mb-4 uppercase tracking-widest">Description <span className="text-rose-500">*</span></h5>
                            <TextArea
                                value={newBadge.description}
                                onChange={e => setNewBadge({ ...newBadge, description: e.target.value })}
                                placeholder="Clearly explain how to earn this badge..."
                                className="!p-8 !px-10 !rounded-[2rem] bg-[#0f172a] border-2 border-white/10 !min-h-[160px] hover:border-white/20 !text-white"
                            />
                        </div>

                        <div className="flex flex-col gap-8">
                            <h5 className="text-xl font-black text-white/90 border-l-4 border-primary pl-4 mb-4 uppercase tracking-widest">Configuration</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="flex flex-col gap-4">
                                    <label className="text-[11px] font-black uppercase text-white/80 tracking-widest px-1">Tracking Type <span className="text-rose-500">*</span></label>
                                    <div className="relative">
                                        <select
                                            className="w-full h-[64px] p-4 px-8 rounded-2xl bg-[#0f172a] border-2 border-white/10 text-white outline-none appearance-none cursor-pointer focus:border-primary/50 font-bold shadow-inner"
                                            value={newBadge.type}
                                            onChange={e => setNewBadge({ ...newBadge, type: e.target.value })}
                                        >
                                            {types.map(t => <option key={t.value} value={t.value} className="bg-[#1e293b]">{t.label}</option>)}
                                        </select>
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                            <FaChevronDown />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-4">
                                    <label className="text-[11px] font-black uppercase text-white/80 tracking-widest px-1">Visual Icon <span className="text-rose-500">*</span></label>
                                    <div className="flex gap-4">
                                        {icons.map(icon => (
                                            <button
                                                key={icon.name}
                                                onClick={() => setNewBadge({ ...newBadge, icon: icon.name })}
                                                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all border-2 ${newBadge.icon === icon.name
                                                    ? 'bg-primary border-primary text-white scale-110 shadow-xl shadow-primary/30'
                                                    : 'bg-black/30 text-slate-500 border-white/5 hover:border-white/10 hover:bg-black/40'}`}
                                            >
                                                {icon.icon}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-white/10 mt-4">
                            <Button onClick={handleSubmit} className="w-full py-6 rounded-[2.5rem] text-2xl font-black shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95">
                                ✨ Save Badge Definition
                            </Button>
                        </div>
                    </div>
                </Card>
            )}
            {/* Pagination Controls */}
            <div className="px-4">
                <Pagination 
                    currentPage={currentPage}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    isMobile={isMobile}
                    style={{ 
                        marginTop: '-1rem',
                        marginBottom: '1rem',
                        maxWidth: isMobile ? '100%' : '400px'
                    }}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
                {currentItems.map(badge => (
                    <Card key={badge._id} className="border-white/5 hover:border-white/10 group transition-all flex flex-col gap-2 rounded-[2.5rem]" style={{ background: '#1a1f2e', padding: '30px' }}>
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-2xl text-emerald-400 group-hover:scale-110 transition-transform" style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                                {icons.find(i => i.name === badge.icon)?.icon || <FaAward />}
                            </div>
                            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black tracking-widest uppercase" style={{ marginTop: '1.5rem' }}>
                                {badge.type === 'points' ? 'Tier' : badge.type === 'quiz_perfect' ? 'Expert' : badge.type.replace('_', ' ')}
                            </span>
                        </div>
                        <h4 className="text-xl font-bold mb-1 text-white">{badge.name}</h4>
                        <p className="text-slate-400 text-sm mb-6 flex-1">{badge.description}</p>
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-[11px] font-bold text-slate-500 tracking-widest uppercase">Target</span>
                            <span className="text-[12px] font-bold text-emerald-400 tracking-widest uppercase">
                                {badge.threshold} {badge.type === 'points' ? 'pts' : badge.type === 'streak' ? 'days' : 'items'}
                            </span>
                        </div>
                        <button 
                            className="w-full h-14 flex items-center justify-center gap-2 rounded-2xl border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 transition-all text-xs font-black uppercase tracking-widest mt-6" 
                            style={{marginTop:10}}
                            onClick={() => deleteBadge(badge._id)
    
                            }
                        >
                            <FaTrash size={12} className="mr-2" /> Remove Badge
                        </button>
                    </Card>
                ))}
            </div>

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
