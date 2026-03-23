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
        <div 
            className="flex flex-col max-w-5xl mx-auto py-12 animate-fade-in"
            style={{ paddingLeft: '20px', paddingRight: '20px' }}
        >
            {/* SIMPLIFIED HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8" style={{ marginBottom: '60px' }}>
                <div className="flex flex-col gap-2">
                    <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase leading-none">
                        Challenge <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">Creator</span>
                    </h2>
                    <p className="text-slate-500 font-medium text-lg max-w-xl mt-2">
                        Define the parameters of elite achievement. Architect your prestige through tactical weekly objectives.
                    </p>
                </div>
                
                <div className="w-full md:w-auto flex justify-end">
                    <Link href="/users/challenges/active">
                        <Button className="h-14 px-8 rounded-2xl bg-yellow-500 hover:bg-yellow-400 text-black font-black transition-all shadow-[0_0_30px_rgba(234,179,8,0.2)] group flex items-center gap-3">
                            <span className="text-xs tracking-widest uppercase">View Active Challenges</span>
                            <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>
            </div>

            {/* MAIN FORM INTERFACE - CENTERED */}
            <div className="w-full">
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/5 to-blue-500/5 rounded-[2.5rem] blur-2xl opacity-50" />
                    
                    <Card className="relative bg-[#0a0f18]/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-none overflow-hidden" style={{ padding: '0',marginBottom:'30px' }}>
                        <form onSubmit={handleSubmit} className="flex flex-col" style={{padding:30}}>
                            
                            {/* SECTOR 01: IDENTITY */}
                            <div className="p-8 md:p-14 lg:p-20 border-b border-white/5" style={{ marginBottom: '20px' }}>
                                <div className="flex justify-between items-center mb-10">
                                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">Sector 01 // Identity</span>
                                    <div className="flex gap-1">
                                        {[1,2,3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-emerald-500/30" />)}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-12">
                                    <div style={{ marginBottom: '30px' }}>
                                        <Input
                                            label={<span>Challenge Name <span className="text-rose-500">*</span></span>}
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g. Quiz Enthusiast"
                                            className="!px-10 h-[80px] !rounded-2xl border-white/10 bg-black/40 text-2xl font-black placeholder:opacity-20 focus:border-emerald-500/50 transition-all"
                                            required
                                        />
                                    </div>
                                    <div className="flex flex-col gap-4">
                                        <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest px-4">
                                            Operational Directives <span className="text-rose-500">*</span>
                                        </label>
                                        <TextArea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Detail the requirements, constraints, and objective for this elite challenge..."
                                            className="!p-10 !rounded-[2.5rem] bg-black/40 border-white/10 !min-h-[250px] text-lg font-medium leading-relaxed focus:border-emerald-500/50 transition-all"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* SECTOR 02: STRATEGY */}
                            <div className="p-8 md:p-14 lg:p-20 border-b border-white/5" style={{ marginTop: '20px', marginBottom: '20px' }}>
                                <div className="flex justify-between items-center mb-10">
                                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">Sector 02 // Strategy</span>
                                    <div className="flex gap-1">
                                        {[1,2,3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-blue-500/30" />)}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="flex flex-col gap-4" style={{ marginBottom: '30px' }}>
                                        <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest px-4">
                                            Goal Type <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="relative text-left group/select">
                                            <select
                                                value={formData.type}
                                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                                className="w-full h-[80px] p-4 px-10 rounded-2xl bg-black border border-white/10 text-white outline-none appearance-none cursor-pointer focus:border-emerald-500/50 font-black text-xl shadow-inner transition-all"
                                            >
                                                <option value="quiz_count" className="bg-[#0a0f18] text-white py-4">Quiz Count</option>
                                                <option value="points_earned" className="bg-[#0a0f18] text-white py-4">Points Earned</option>
                                                <option value="perfect_score" className="bg-[#0a0f18] text-white py-4">Perfect Score</option>
                                                <option value="referral_count" className="bg-[#0a0f18] text-white py-4">Referrals</option>
                                                <option value="streak" className="bg-[#0a0f18] text-white py-4">Daily Streaks</option>
                                            </select>
                                            <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-xl">
                                                <FaChevronDown />
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ marginBottom: '30px' }}>
                                        <Input
                                            label={<span>Requirement Threshold <span className="text-rose-500">*</span></span>}
                                            type="number"
                                            value={formData.threshold}
                                            onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
                                            className="!px-10 h-[80px] !rounded-2xl border-white/10 bg-black/40 font-black text-3xl text-emerald-500 shadow-inner"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="mt-8" style={{ marginTop: '40px' }}>
                                    <Input
                                        label={<span>Bounty Reward <span className="text-rose-500">*</span></span>}
                                        type="number"
                                        value={formData.rewardPoints}
                                        onChange={(e) => setFormData({ ...formData, rewardPoints: e.target.value })}
                                        className="!px-10 h-[80px] !rounded-2xl border-white/10 bg-black/40 font-black text-4xl text-yellow-500 shadow-inner"
                                        required
                                    />
                                </div>
                            </div>

                            {/* SECTOR 03: LOGISTICS */}
                            <div className="p-8 md:p-14 lg:p-20" style={{ marginTop: '20px' }}>
                                <div className="flex justify-between items-center mb-10">
                                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">Sector 03 // Logistics</span>
                                    <div className="flex gap-1">
                                        {[1,2,3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-yellow-500/30" />)}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10" style={{ marginBottom: '60px' }}>
                                    <div style={{ marginBottom: '30px' }}>
                                        <Input
                                            label={<span>Launch Date <span className="text-rose-500">*</span></span>}
                                            type="date"
                                            value={formData.startDate}
                                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                            className="!px-8 h-[80px] !rounded-2xl border-white/10 bg-black/40 font-black text-white tracking-widest [color-scheme:dark]"
                                            required
                                        />
                                    </div>
                                    <div style={{ marginBottom: '30px' }}>
                                        <Input
                                            label={<span>Expiration Date <span className="text-rose-500">*</span></span>}
                                            type="date"
                                            value={formData.endDate}
                                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                            className="!px-8 h-[80px] !rounded-2xl border-white/10 bg-black/40 font-black text-white tracking-widest [color-scheme:dark]"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* INITIALIZE BUTTON */}
                                <div className="flex flex-col items-center gap-6 px-4" style={{ marginTop: '20px', marginBottom: '40px' }}>
                                    <Button 
                                        type="submit" 
                                        disabled={loading}
                                        className="w-full h-24 rounded-[2rem] text-3xl font-black bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-[0_0_50px_rgba(16,185,129,0.2)] transition-all hover:scale-[1.01] hover:shadow-[0_0_70px_rgba(16,185,129,0.4)] active:scale-95 flex items-center justify-center gap-4 group"
                                    >
                                        {loading ? 'INITIALIZING...' : (
                                            <>
                                                <FaPlus className="text-xl group-hover:rotate-90 transition-transform duration-500" /> 
                                                INITIALIZE CHALLENGE
                                            </>
                                        )}
                                    </Button>
                                    <p className="text-[10px] font-black text-slate-500 tracking-[0.2em] text-center opacity-60">
                                        BY INITIALIZING, YOU CONFIRM ADHERENCE TO THE PRESTIGE PROTOCOLS
                                    </p>
                                </div>
                            </div>
                        </form>
                    </Card>
                </div>
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
