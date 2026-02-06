'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Card from './Card';
import Button from './Button';
import Input from './Input';
import TextArea from './TextArea';
import { FaTrash, FaPlus, FaAward, FaTrophy, FaStar, FaBolt, FaUsers } from 'react-icons/fa';

export default function BadgeManagement() {
    const [badges, setBadges] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newBadge, setNewBadge] = useState({
        name: '',
        description: '',
        icon: 'FaAward',
        type: 'points',
        threshold: 100
    });

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
        if (!newBadge.name) return alert('Name is required');
        try {
            await api.post('/badges', newBadge);
            setShowForm(false);
            setNewBadge({ name: '', description: '', icon: 'FaAward', type: 'points', threshold: 100 });
            fetchBadges();
        } catch (err) {
            alert('Failed to create badge');
        }
    };

    const deleteBadge = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        try {
            await api.delete(`/badges/${id}`);
            fetchBadges();
        } catch (err) {
            alert('Failed to delete badge');
        }
    };

    if (loading) return <div>Loading badges...</div>;

    return (
        <div className="flex flex-col gap-10">
            <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black">System Badges</h3>
                <Button onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : <><FaPlus className="mr-2" /> Create Badge</>}
                </Button>
            </div>

            {showForm && (
                <Card className="p-10 border-primary/20 bg-primary/5 shadow-2xl">
                    <div className="flex flex-col gap-12">
                        <div className="flex flex-col gap-6">
                            <h5 className="text-xl font-black text-white/50 border-l-4 border-primary pl-4 mb-4 uppercase tracking-widest">Badge Identity</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <Input
                                    label="Badge Name"
                                    value={newBadge.name}
                                    onChange={e => setNewBadge({ ...newBadge, name: e.target.value })}
                                    placeholder="e.g. Points Warrior"
                                    className="!px-8 h-[64px] !rounded-2xl border-white/5 bg-black/20"
                                />
                                <Input
                                    label="Requirement Threshold"
                                    type="number"
                                    value={newBadge.threshold}
                                    onChange={e => setNewBadge({ ...newBadge, threshold: Number(e.target.value) })}
                                    className="!px-8 h-[64px] !rounded-2xl border-white/5 bg-black/20"
                                    placeholder="Value"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-6">
                            <h5 className="text-xl font-black text-white/50 border-l-4 border-primary pl-4 mb-4 uppercase tracking-widest">Description</h5>
                            <TextArea
                                value={newBadge.description}
                                onChange={e => setNewBadge({ ...newBadge, description: e.target.value })}
                                placeholder="Clearly explain how to earn this badge..."
                                className="!p-8 !px-10 !rounded-[2rem] bg-black/30 border-2 border-white/5 !min-h-[160px] hover:border-white/10"
                            />
                        </div>

                        <div className="flex flex-col gap-8">
                            <h5 className="text-xl font-black text-white/50 border-l-4 border-primary pl-4 mb-4 uppercase tracking-widest">Configuration</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="flex flex-col gap-4">
                                    <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest px-1">Tracking Type</label>
                                    <select
                                        className="w-full h-[64px] p-4 px-8 rounded-2xl bg-black/30 border-2 border-white/5 text-slate-200 outline-none appearance-none cursor-pointer focus:border-primary/50 font-bold shadow-inner"
                                        value={newBadge.type}
                                        onChange={e => setNewBadge({ ...newBadge, type: e.target.value })}
                                    >
                                        {types.map(t => <option key={t.value} value={t.value} className="bg-[#1e293b]">{t.label}</option>)}
                                    </select>
                                </div>
                                <div className="flex flex-col gap-4">
                                    <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest px-1">Visual Icon</label>
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {badges.map(badge => (
                    <Card key={badge._id} className="p-8 border-white/5 bg-white/5 group hover:bg-white/10 transition-all flex flex-col items-center text-center gap-2">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 flex items-center justify-center text-4xl text-yellow-500 mb-6 group-hover:scale-110 transition-transform">
                            {icons.find(i => i.name === badge.icon)?.icon || <FaAward />}
                        </div>
                        <h4 className="text-2xl font-black mb-1">{badge.name}</h4>
                        <p className="text-slate-500 text-sm mb-6 flex-1 leading-relaxed">{badge.description}</p>
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-8">
                            Target: <span className="text-amber-400 ml-1.5">{badge.threshold} {badge.type === 'points' ? 'pts' : badge.type === 'streak' ? 'days' : 'items'}</span>
                        </div>
                        <Button variant="danger" className="w-full opacity-0 group-hover:opacity-100 transition-opacity mt-4" onClick={() => deleteBadge(badge._id)}>
                            <FaTrash className="mr-2" /> Remove Badge
                        </Button>
                    </Card>
                ))}
            </div>
        </div>
    );
}
