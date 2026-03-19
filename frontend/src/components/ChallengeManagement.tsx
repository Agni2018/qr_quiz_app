'use client';

import React, { useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import Button from './Button';
import Card from './Card';
import Input from './Input';
import TextArea from './TextArea';
import { FaPlus, FaTrophy, FaChevronDown, FaListUl, FaArrowRight } from 'react-icons/fa';
import AlertModal from '@/components/AlertModal';

export default function ChallengeManagement() {
    const [loading, setLoading] = useState(false);
    const [alertModal, setAlertModal] = useState({ isOpen: false, message: '', type: 'info' as 'success' | 'error' | 'info' });
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        type: 'quiz_count',
        threshold: '' as any, // Allowing empty string for better UX
        rewardPoints: '' as any,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Convert to numbers for API, defaulting to 0 if empty
            const submissionData = {
                ...formData,
                threshold: parseInt(formData.threshold) || 0,
                rewardPoints: parseInt(formData.rewardPoints) || 0
            };
            await api.post('/challenges', submissionData);
            setAlertModal({ isOpen: true, message: 'Challenge created successfully!', type: 'success' });
            setFormData({
                name: '',
                description: '',
                type: 'quiz_count',
                threshold: '' as any,
                rewardPoints: '' as any,
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            });
        } catch (err) {
            console.error('Error creating challenge:', err);
            setAlertModal({ isOpen: true, message: 'Failed to create challenge.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-12 max-w-6xl mx-auto py-10 animate-fade-in px-6">
            {/* HEADER & NAV */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-4">
                <div className="flex flex-col gap-2 text-center md:text-left">
                    <h2 className="text-5xl font-black text-white tracking-tighter uppercase" style={{margin:"2rem 1rem 1rem 1rem"}}>Challenge Creator</h2>
                    <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-xs" style={{margin:"2rem 1rem 1rem 1rem"}}>Design new weekly goals for the platform</p>
                </div>
                
                <Link href="/users/challenges/active">
                    <Button className="h-20 px-10 rounded-[2rem] bg-white/5 hover:bg-white/10 border-2 border-white/5 transition-all group flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <FaListUl />
                        </div>
                        <div className="flex flex-col items-start">
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Admin Panel</span>
                            <span className="text-lg font-black text-white flex items-center gap-2">
                                Active Challenges <FaArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
                            </span>
                        </div>
                    </Button>
                </Link>
            </div>

            {/* CREATE FORM */}
            <div className="max-w-4xl mx-auto w-full">
                <Card className="shadow-2xl shadow-primary/5 border-2 border-white/5" style={{ padding: '3.5rem', margin: "2rem 1rem 1rem 1rem" }}>
                    <div className="flex items-center gap-4 mb-12 border-l-4 border-primary pl-6" style={{ marginBottom: '20px' }}>
                        <div>
                            <h3 className="text-3xl font-black text-white">Create Challenge</h3>
                            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">Fill in the details below to launch a new goal</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-10" >
                        <div className="grid grid-cols-1 gap-10">
                            <Input
                                label="Challenge Name"
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Quiz Enthusiast"
                                className="!px-8 h-[72px] !rounded-2xl border-white/5 bg-black/20 text-xl font-bold"
                                required
                            />

                            <div className="flex flex-col gap-3">
                                <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest px-2">Detailed Description</label>
                                <TextArea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Explain exactly what the student needs to do to earn the reward..."
                                    className="!p-8 !px-10 !rounded-[2rem] bg-black/30 border-white/5 !min-h-[180px] text-lg font-medium leading-relaxed"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="flex flex-col gap-3">
                                <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest px-2">Goal Type</label>
                                <div className="relative">
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full h-[72px] p-4 pl-8 pr-14 rounded-2xl bg-black/30 border-2 border-white/5 text-white outline-none appearance-none cursor-pointer focus:border-primary/50 font-black text-lg shadow-inner"
                                    >
                                        <option value="quiz_count" className="bg-[#1e293b]">Quiz Count</option>
                                        <option value="points_earned" className="bg-[#1e293b]">Points Earned</option>
                                        <option value="perfect_score" className="bg-[#1e293b]">Perfect Score</option>
                                        <option value="referral_count" className="bg-[#1e293b]">Referrals</option>
                                        <option value="streak" className="bg-[#1e293b]">Daily Streaks</option>
                                    </select>
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-xl">
                                        <FaChevronDown />
                                    </div>
                                </div>
                            </div>
                            <Input
                                label="Requirement Threshold"
                                type="number"
                                value={formData.threshold}
                                onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
                                className="!px-8 h-[72px] !rounded-2xl border-white/5 bg-black/20 font-black text-2xl text-primary shadow-inner"
                                required
                            />
                        </div>

                        <Input
                            label="Bounty Reward"
                            type="number"
                            value={formData.rewardPoints}
                            onChange={(e) => setFormData({ ...formData, rewardPoints: e.target.value })}
                            className="!px-8 h-[72px] !rounded-2xl border-white/5 bg-black/20 font-black text-3xl text-yellow-500 shadow-inner"
                            required
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <Input
                                label="Launch Date"
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                className="!px-6 h-[72px] !rounded-2xl border-white/5 bg-black/20 font-black text-white tracking-widest [color-scheme:dark]"
                                required
                            />
                            <Input
                                label="Expiration Date"
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                className="!px-6 h-[72px] !rounded-2xl border-white/5 bg-black/20 font-black text-white tracking-widest [color-scheme:dark]"
                                required
                            />
                        </div>

                        <div className="pt-6">
                            <Button 
                                type="submit" 
                                disabled={loading}
                                className="w-full py-8 rounded-[2.5rem] text-3xl font-black shadow-2xl shadow-primary/30 transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-4 group"
                            >
                                {loading ? 'Launching...' : (
                                    <>
                                        <FaPlus className="text-xl group-hover:rotate-90 transition-transform duration-500" /> 
                                        Activate Weekly Challenge
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>

            <AlertModal
                isOpen={alertModal.isOpen}
                onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
                message={alertModal.message}
                type={alertModal.type}
            />
        </div>
    );
}
