'use client';

import React, { useState } from 'react';
import api from '@/lib/api';
import Button from './Button';
import Card from './Card';
import Input from './Input';
import TextArea from './TextArea';
import { FaPlus, FaChevronDown } from 'react-icons/fa';
import AlertModal from '@/components/AlertModal';

export default function ChallengeManagement({ onSuccess }: { onSuccess?: () => void }) {
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

    const isFormValid =
        formData.name.trim() !== '' &&
        formData.description.trim() !== '' &&
        formData.type !== '' &&
        formData.threshold !== '' && Number(formData.threshold) >= 0 &&
        formData.rewardPoints !== '' && Number(formData.rewardPoints) >= 0 &&
        formData.startDate !== '' &&
        formData.endDate !== '';

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
            className="flex flex-col max-w-5xl mx-auto py-8 animate-fade-in"
            style={{ paddingLeft: '20px', paddingRight: '20px' }}
        >

            {/* MAIN FORM INTERFACE - CENTERED */}
            <div className="w-full">
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/5 to-blue-500/5 rounded-[2.5rem] blur-2xl opacity-50" />
                    
                    <Card className="relative border border-slate-200 rounded-[2.5rem] shadow-none overflow-hidden bg-white" style={{ background: 'white', padding: 20, marginBottom: '20px' }}>
                        <form onSubmit={handleSubmit} className="flex flex-col p-4 sm:p-8 md:p-12">
                            
                            {/* SECTOR 01: IDENTITY */}
                            <div className="p-4 md:p-8 border-b border-slate-100" style={{ marginBottom: '10px' }}>
                               
                                <div className="flex flex-col gap-8">
                                    <div style={{ marginBottom: '20px' }}>
                                        <Input
                                            label={<span className="text-slate-700 font-bold" style={{ color: '#333' }}>Challenge Name <span className="text-rose-500">*</span></span>}
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g. Quiz Enthusiast"
                                            className="!px-10 h-[80px] !rounded-2xl bg-white text-2xl font-black placeholder:opacity-40 transition-all !text-black"
                                            style={{ background: '#ffffff', color: '#000000', border: '2px solid #cbd5e1', outline: 'none' }}
                                            onFocus={(e: React.FocusEvent<HTMLInputElement>) => (e.currentTarget.style.border = '2px solid #4f46e5')}
                                            onBlur={(e: React.FocusEvent<HTMLInputElement>) => (e.currentTarget.style.border = '2px solid #cbd5e1')}
                                            required
                                        />
                                    </div>
                                    <div className="flex flex-col gap-4">
                                        <label className="text-[11px] font-black uppercase text-slate-600 tracking-widest px-4">
                                            Operational Directives <span className="text-rose-500">*</span>
                                        </label>
                                        <TextArea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Detail the requirements, constraints, and objective for this elite challenge..."
                                            className="!p-10 !rounded-[2.5rem] bg-white !min-h-[250px] text-lg font-medium leading-relaxed !text-black transition-all"
                                            style={{ background: '#ffffff', color: '#000000', border: '2px solid #cbd5e1', outline: 'none' }}
                                            onFocus={(e: React.FocusEvent<HTMLTextAreaElement>) => (e.currentTarget.style.border = '2px solid #4f46e5')}
                                            onBlur={(e: React.FocusEvent<HTMLTextAreaElement>) => (e.currentTarget.style.border = '2px solid #cbd5e1')}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* SECTOR 02: STRATEGY */}
                            <div className="p-4 md:p-8 border-b border-slate-100" style={{ marginTop: '10px', marginBottom: '10px' }}>
                               
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-4" style={{ marginBottom: '20px' }}>
                                        <label className="text-[11px] font-black uppercase text-slate-600 tracking-widest px-4">
                                            Goal Type <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="relative text-left group/select">
                                            <select
                                                value={formData.type}
                                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                                className="w-full h-14 rounded-[var(--radius)] bg-white border border-slate-300 text-black outline-none appearance-none cursor-pointer focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 font-bold transition-all hover:border-indigo-400 shadow-sm"
                                                style={{ 
                                                    paddingLeft: '1.5rem', 
                                                    paddingRight: '3rem',
                                                    textIndent: '0.01px',
                                                    WebkitAppearance: 'none',
                                                    MozAppearance: 'none'
                                                }}
                                            >
                                                <option value="quiz_count" className="bg-white text-black py-4">Quiz Count</option>
                                                <option value="points_earned" className="bg-white text-black py-4">Points Earned</option>
                                                <option value="perfect_score" className="bg-white text-black py-4">Perfect Score</option>
                                                <option value="referral_count" className="bg-white text-black py-4">Referrals</option>
                                                <option value="streak" className="bg-white text-black py-4">Daily Streaks</option>
                                            </select>
                                            <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-xl">
                                                <FaChevronDown />
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ marginBottom: '20px' }}>
                                        <Input
                                            label={<span className="text-slate-700 font-bold" style={{ color: '#333' }}>Requirement Threshold <span className="text-rose-500">*</span></span>}
                                            type="number"
                                            min={0}
                                            value={formData.threshold}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (val === '' || Number(val) >= 0) setFormData({ ...formData, threshold: val });
                                            }}
                                            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                                if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') e.preventDefault();
                                            }}
                                            className="!px-6 h-14 !rounded-[var(--radius)] border-slate-300 bg-white font-bold text-xl text-indigo-600 shadow-sm"
                                            style={{ background: '#ffffff', color: '#000000', border: '1px solid #cbd5e1' }}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="mt-6" style={{ marginTop: '20px' }}>
                                    <Input
                                        label={<span className="text-slate-700 font-bold" style={{ color: '#333' }}>Bounty Reward <span className="text-rose-500">*</span></span>}
                                        type="number"
                                        min={0}
                                        value={formData.rewardPoints}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === '' || Number(val) >= 0) setFormData({ ...formData, rewardPoints: val });
                                        }}
                                        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                            if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') e.preventDefault();
                                        }}
                                        className="!px-6 h-14 !rounded-[var(--radius)] border-slate-300 bg-white font-bold text-xl text-yellow-600 shadow-sm"
                                        style={{ background: '#ffffff', color: '#000000', border: '1px solid #cbd5e1' }}
                                        required
                                    />
                                </div>
                            </div>

                            {/* SECTOR 03: LOGISTICS */}
                            <div className="p-4 md:p-8" style={{ marginTop: '10px' }}>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ marginBottom: '20px' }}>
                                    <div style={{ marginBottom: '20px' }}>
                                        <Input
                                            label={<span className="text-slate-700 font-bold" style={{ color: '#333' }}>Launch Date <span className="text-rose-500">*</span></span>}
                                            type="date"
                                            value={formData.startDate}
                                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                            className="!px-6 h-14 !rounded-[var(--radius)] border-slate-300 bg-white font-bold text-black tracking-normal shadow-sm"
                                            style={{ background: '#ffffff', color: '#000000', border: '1px solid #cbd5e1' }}
                                            required
                                        />
                                    </div>
                                    <div style={{ marginBottom: '20px' }}>
                                        <Input
                                            label={<span className="text-slate-700 font-bold" style={{ color: '#333' }}>Expiration Date <span className="text-rose-500">*</span></span>}
                                            type="date"
                                            value={formData.endDate}
                                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                            className="!px-6 h-14 !rounded-[var(--radius)] border-slate-300 bg-white font-bold text-black tracking-normal shadow-sm"
                                            style={{ background: '#ffffff', color: '#000000', border: '1px solid #cbd5e1' }}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* INITIALIZE BUTTON */}
                                <div className="flex flex-col items-center gap-4 px-4" style={{ marginTop: '10px', marginBottom: '20px' }}>
                                    <Button 
                                        type="submit" 
                                        disabled={loading || !isFormValid}
                                        className="w-full h-16 rounded-2xl text-xl font-black text-white transition-all flex items-center justify-center gap-4 group"
                                        style={{
                                            background: loading || !isFormValid ? '#d1d5db' : '#4f46e5',
                                            cursor: loading || !isFormValid ? 'not-allowed' : 'pointer',
                                            boxShadow: loading || !isFormValid ? 'none' : '0 20px 50px rgba(79,70,229,0.2)',
                                        }}
                                    >
                                        {loading ? 'INITIALIZING...' : (
                                            <>
                                                <FaPlus className="text-xl group-hover:rotate-90 transition-transform duration-500" /> 
                                                INITIALIZE CHALLENGE
                                            </>
                                        )}
                                    </Button>
                                    <p className="text-[10px] font-black text-slate-400 tracking-[0.2em] text-center opacity-80" style={{ color: '#666' }}>
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
                onClose={() => {
                    if (alertModal.type === 'success') onSuccess?.();
                    setAlertModal({ ...alertModal, isOpen: false });
                }}
                message={alertModal.message}
                type={alertModal.type}
            />

        </div>
    );
}
