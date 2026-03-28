'use client';

import React, { useState } from 'react';
import api from '@/lib/api';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { FaUserPlus, FaWhatsapp, FaCopy, FaCheckCircle } from 'react-icons/fa';

export default function StudentReferral() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [referralCode, setReferralCode] = useState('');
    const [copied, setCopied] = useState(false);
    const [referrals, setReferrals] = useState<any[]>([]);

    const fetchReferrals = async () => {
        try {
            const res = await api.get('/auth/referrals/my');
            setReferrals(res.data);
        } catch (err) {
            console.error('Error fetching referrals:', err);
        }
    };

    React.useEffect(() => {
        fetchReferrals();
    }, []);

    const handleCreateReferral = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/referrals/create', { username, email });
            setReferralCode(res.data.referralCode);
            fetchReferrals(); // Refresh list
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create referral');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(referralCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareOnWhatsApp = () => {
        const message = `Hey! Join me on the Quiz Platform using my referral code: ${referralCode}. Register with your name (${username}) and email (${email}) to get bonus points!`;
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    };

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const totalPages = Math.ceil(referrals.length / itemsPerPage);
    const paginatedReferrals = referrals.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="max-w-7xl mx-auto mt-12 px-4 sm:px-0">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* Left Column: Form and Steps */}
                <div className="w-full lg:flex-1 flex flex-col gap-0">
                    <Card
                        className="p-8 sm:p-12 border-slate-200 rounded-[3rem] shadow-2xl overflow-hidden relative group bg-white"
                        style={{ padding: '2.5rem', margin: '0 1rem 1rem 1rem', background: 'white', color: '#000', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -mr-32 -mt-32 group-hover:bg-primary/20 transition-all duration-1000" />
                        
                        <div className="relative z-10">
                            <div className="flex flex-col sm:flex-row items-center gap-8 mb-12">
                                <div className="w-24 h-24 bg-slate-900 rounded-[2rem] flex items-center justify-center text-white text-4xl border border-white/10 shadow-xl relative z-20">
                                    <FaUserPlus />
                                </div>
                                <div className="text-center sm:text-left">
                                    <h2 className="text-4xl sm:text-5xl font-black text-black mb-3 tracking-tight" style={{ color: '#000' }}>Refer a Friend</h2>
                                    <p className="text-black text-lg font-medium" style={{ color: '#000' }}>Invite your friends and earn <span className="text-primary font-black">5 points</span> for each successful referral! They get <span className="text-secondary font-black">3 points</span> too.</p>
                                </div>
                            </div>

                            {!referralCode ? (
                                <form onSubmit={handleCreateReferral} className="space-y-8">
                                    {error && (
                                        <div className="p-4 bg-red-500/10 border-l-4 border-red-500 text-red-500 rounded-xl font-bold animate-shake">
                                            {error}
                                        </div>
                                    )}
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8" style={{marginTop:40,marginBottom:40}}>
                                        <div className="space-y-4">
                                            <label className="text-[0.7rem] font-black uppercase tracking-[0.2em] text-black ml-4">Friend's Username <span className="text-rose-500">*</span></label>
                                            <Input
                                                placeholder="Enter their username"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                required
                                                className="border-slate-200 focus:border-primary/50 h-16 rounded-2xl text-lg transition-all text-black placeholder:text-black"
                                                style={{ background: 'white', color: 'black' }}
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[0.7rem] font-black uppercase tracking-[0.2em] text-black ml-4">Friend's Email <span className="text-rose-500">*</span></label>
                                            <Input
                                                type="email"
                                                placeholder="friend@example.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                className="border-slate-200 focus:border-primary/50 h-16 rounded-2xl text-lg transition-all text-black placeholder:text-black"
                                                style={{ background: 'white', color: 'black' }}
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-6 rounded-[2rem] text-xl font-black bg-primary hover:scale-[1.02] shadow-2xl shadow-primary/30 active:scale-95 transition-all"
                                    >
                                        {loading ? 'Generating Code...' : 'Generate Referral Code'}
                                    </Button>
                                </form>
                            ) : (
                                <div className="animate-fade-in">
                                    <div 
                                        className="bg-slate-50 border border-slate-200 rounded-[2.5rem] p-10 text-center relative overflow-hidden group/code" 
                                        style={{ padding: '2.5rem', marginTop: '2rem', marginBottom: '3rem' }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 opacity-0 group-hover/code:opacity-100 transition-opacity duration-1000" />
                                        <span className="text-black text-[0.7rem] font-black uppercase tracking-[0.3em] mb-4 block relative z-10" style={{ marginTop: 10 }}>Your Unique Referral Code</span>
                                        <h3 className="text-6xl sm:text-7xl font-black text-black tracking-widest break-all relative z-10" style={{ color: '#000' }}>{referralCode}</h3>
                                    </div>

                                    <div className="flex flex-col gap-6" style={{ marginBottom: '3rem' }}>
                                        <Button
                                            onClick={copyToClipboard}
                                            variant="outline"
                                            style={{ color: '#000', borderColor: '#cbd5e1' }}
                                            className="py-8 rounded-[2rem] text-2xl font-black hover:bg-slate-50 gap-4 shadow-sm"
                                        >
                                            {copied ? <><FaCheckCircle className="text-emerald-600" /> Copied!</> : <><FaCopy className="text-primary" /> Copy Code</>}
                                        </Button>
                                        
                                        <div className="text-center p-8 bg-emerald-50 border-2 border-emerald-100 rounded-[2rem] shadow-sm">
                                            <p className="text-emerald-800 font-extrabold text-sm uppercase tracking-widest flex items-center justify-center gap-3">
                                                <FaWhatsapp className="text-2xl" /> Suggestion: Send this code to your friend via WhatsApp!
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => { setReferralCode(''); setUsername(''); setEmail(''); }}
                                        className="text-slate-800 hover:text-primary font-black uppercase text-xs tracking-widest transition-colors w-full text-center"
                                        style={{ marginTop: '1rem', color: '#000' }}
                                    >
                                        ← Refer Another Friend
                                    </button>
                                </div>
                            )}
                        </div>
                    </Card>

                    <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 mb-16" style={{marginTop:25}}>
                        {[
                            { title: "Invite", desc: "Share code with friend", icon: "📧" },
                            { title: "Register", desc: "Friend signs up with code", icon: "📝" },
                            { title: "Earn", desc: "Both get reward points", icon: "💎" }
                        ].map((step, i) => (
                            <Card key={i} className="p-8 text-center border-slate-200 rounded-[2rem] hover:bg-slate-50 transition-all bg-white" style={{ padding: '2.5rem', margin: '0 1rem 1rem 1rem', background: 'white', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}>
                                <div className="text-4xl mb-4">{step.icon}</div>
                                <h4 className="text-lg font-black mb-1 text-black" style={{ color: '#000' }}>{step.title}</h4>
                                <p className="text-black text-sm font-medium" style={{ color: '#000' }}>{step.desc}</p>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Right Column: Referrals List */}
                <div className="w-full lg:w-[450px] shrink-0">
                        <Card
                            className="border-slate-200 rounded-[3rem] shadow-2xl overflow-hidden relative group h-full bg-white"
                            style={{ padding: '2.5rem', margin: '0 1rem 1rem 1rem', background: 'white', color: '#000', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}
                        >
                        <div className="flex justify-between items-center mb-8">
                             <h3 className="text-2xl font-black text-black" style={{ color: '#000' }}>Your Recent Referrals</h3>
                             <button className="text-[0.7rem] font-black uppercase tracking-widest text-emerald-500 hover:text-emerald-400 transition-colors">View All</button>
                        </div>
                        
                        <div className="flex flex-col">
                            {paginatedReferrals.length > 0 ? (
                                paginatedReferrals.map((ref, idx) => (
                                    <div 
                                        key={ref._id} 
                                        className="p-6 rounded-[2rem] border border-slate-200 transition-all duration-300 group/ref bg-white"
                                        style={{ marginBottom: '1.5rem',padding:15, marginTop: idx === 0 ? '2rem' : '0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                                    >
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-2xl font-black text-white uppercase shrink-0">
                                                {ref.targetUsername?.charAt(0) || 'U'}
                                            </div>
                                            <div className="flex flex-col flex-1 min-w-0 pr-2">
                                                <h4 className="text-xl font-black text-black break-words" style={{ color: '#000' }}>{ref.targetUsername}</h4>
                                                <p className="font-black text-[0.75rem] break-all" style={{ color: '#000', opacity: 1 }}>{ref.targetEmail}</p>
                                            </div>
                                            <div className="ml-auto flex flex-col items-end gap-2 shrink-0">
                                                <div 
                                                    className={`text-[0.65rem] font-black uppercase tracking-widest rounded-xl ${ref.status === 'completed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-orange-100 text-orange-800 border border-orange-200'}`}
                                                    style={{ padding: '8px 12px' }}
                                                >
                                                    {ref.status}
                                                </div>
                                                <div className="text-[0.65rem] text-black font-black uppercase tracking-widest">
                                                    {new Date(ref.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="pt-6 border-t border-slate-200 flex items-center justify-between" style={{marginTop:10,marginBottom:10}}>
                                            <span className="text-[0.6rem] font-black uppercase tracking-widest text-black">Referral Code</span>
                                            <span className="text-base font-black text-black tracking-[0.2em] bg-white px-4 py-2 rounded-xl border border-slate-200 group-hover/ref:border-primary/30 group-hover/ref:text-primary transition-all font-mono" style={{ padding: '5px',marginTop:10, color: '#000' }}>
                                                {ref.referralCode}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-black font-bold text-sm">No referrals yet.</p>
                                </div>
                            )}

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-8 px-2">
                                    <Button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        variant="outline"
                                        className="px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-all"
                                        style={{ color: '#000', borderColor: '#cbd5e1' }}
                                    >
                                        Prev
                                    </Button>
                                    <span className="text-black text-[0.7rem] font-black uppercase tracking-widest font-mono">
                                        {currentPage} / {totalPages}
                                    </span>
                                    <Button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        variant="outline"
                                        className="px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-all"
                                        style={{ color: '#000', borderColor: '#cbd5e1' }}
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
