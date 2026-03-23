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

    return (
        <div className="max-w-4xl mx-auto mt-12 px-4 sm:px-0">
            <Card
                className="p-8 sm:p-12 bg-slate-950/40 border-white/5 rounded-[3rem] shadow-2xl overflow-hidden relative group"
                style={{ padding: '2.5rem', margin: '0 1rem 1rem 1rem' }}
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -mr-32 -mt-32 group-hover:bg-primary/20 transition-all duration-1000" />
                
                <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row items-center gap-8 mb-12">
                        <div className="w-24 h-24 bg-primary/20 rounded-[2rem] flex items-center justify-center text-primary text-4xl border border-primary/30 shadow-[0_0_30px_rgba(var(--primary-rgb),0.2)]">
                            <FaUserPlus />
                        </div>
                        <div className="text-center sm:text-left">
                            <h2 className="text-4xl sm:text-5xl font-black text-white mb-3 tracking-tight">Refer a Friend</h2>
                            <p className="text-slate-400 text-lg font-medium">Invite your friends and earn <span className="text-primary font-black">5 points</span> for each successful referral! They get <span className="text-secondary font-black">3 points</span> too.</p>
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
                                    <label className="text-[0.7rem] font-black uppercase tracking-[0.2em] text-slate-500 ml-4">Friend's Username <span className="text-rose-500">*</span></label>
                                    <Input
                                        placeholder="Enter their username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                        className="bg-white/5 border-white/10 focus:border-primary/50 h-16 rounded-2xl text-lg transition-all"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[0.7rem] font-black uppercase tracking-[0.2em] text-slate-500 ml-4">Friend's Email <span className="text-rose-500">*</span></label>
                                    <Input
                                        type="email"
                                        placeholder="friend@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="bg-white/5 border-white/10 focus:border-primary/50 h-16 rounded-2xl text-lg transition-all"
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
                                className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 text-center relative overflow-hidden group/code" 
                                style={{ padding: '2.5rem', marginTop: '2rem', marginBottom: '3rem' }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 opacity-0 group-hover/code:opacity-100 transition-opacity duration-1000" />
                                <span className="text-slate-500 text-[0.7rem] font-black uppercase tracking-[0.3em] mb-4 block relative z-10" style={{ marginTop: 10 }}>Your Unique Referral Code</span>
                                <h3 className="text-6xl sm:text-7xl font-black text-white tracking-widest break-all relative z-10">{referralCode}</h3>
                            </div>

                            <div className="flex flex-col gap-6" style={{ marginBottom: '3rem' }}>
                                <Button
                                    onClick={copyToClipboard}
                                    variant="outline"
                                    className="py-6 rounded-[2rem] text-lg font-black border-white/10 hover:bg-white/5 gap-3"
                                >
                                    {copied ? <><FaCheckCircle className="text-emerald-500" /> Copied!</> : <><FaCopy /> Copy Code</>}
                                </Button>
                                
                                <div className="text-center p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl animate-pulse">
                                    <p className="text-emerald-500 font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2">
                                        <FaWhatsapp className="text-xl" /> Suggestion: Send this code to your friend via WhatsApp!
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => { setReferralCode(''); setUsername(''); setEmail(''); }}
                                className="text-slate-500 hover:text-white font-black uppercase text-xs tracking-widest transition-colors w-full text-center"
                                style={{ marginTop: '1rem' }}
                            >
                                ← Refer Another Friend
                            </button>
                        </div>
                    )}
                </div>
            </Card>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                {[
                    { title: "Invite", desc: "Share code with friend", icon: "📧" },
                    { title: "Register", desc: "Friend signs up with code", icon: "📝" },
                    { title: "Earn", desc: "Both get reward points", icon: "💎" }
                ].map((step, i) => (
                    <Card key={i} className="p-8 text-center bg-slate-900/30 border-white/5 rounded-[2rem] hover:bg-slate-900/50 transition-all" style={{ padding: '2.5rem', margin: '0 1rem 1rem 1rem' }}>
                        <div className="text-4xl mb-4">{step.icon}</div>
                        <h4 className="text-lg font-black mb-1">{step.title}</h4>
                        <p className="text-slate-500 text-sm font-medium">{step.desc}</p>
                    </Card>
                ))}
            </div>

            {referrals.length > 0 && (
                <div className="animate-fade-in">
                    <h3 className="text-2xl font-black mb-8 px-4 sm:px-0" style={{margin:'2rem 1rem 1rem 1rem'}}>Your Recent Referrals</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {referrals.map((ref) => (
                            <Card 
                                key={ref._id} 
                                className="bg-slate-950/40 border-white/5 rounded-[2.5rem] hover:-translate-y-2 transition-all duration-500 flex flex-col shadow-2xl group/ref"
                                style={{ padding: '2.5rem', margin:'2rem 1rem 1rem 1rem'} }
                            >
                                <div className="flex justify-between items-start mb-8">
                                    <div className={`text-[0.65rem] font-black uppercase tracking-widest px-4 py-2 rounded-xl ${ref.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-primary/20 text-primary border border-primary/30'}`} style={{ padding:8,marginBottom:20}}>
                                        {ref.status}
                                    </div>
                                    <div className="text-[0.7rem] text-slate-500 font-black uppercase tracking-widest bg-white/5 py-2 px-4 rounded-xl">
                                        {new Date(ref.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </div>
                                </div>
                                
                                <div className="flex-1 mb-8" style={{marginBottom:20}}>
                                    <h4 className="text-2xl font-black text-white mb-2 group-hover/ref:text-primary transition-colors">{ref.targetUsername}</h4>
                                    <p className="text-slate-500 font-medium text-sm leading-relaxed truncate">{ref.targetEmail}</p>
                                </div>

                                <div className="mt-auto pt-8 border-t border-white/5 flex items-center justify-between" style={{ gap: '2rem' }}>
                                    <span className="text-[0.6rem] font-black uppercase tracking-widest text-slate-500">Referral Code</span>
                                    <span className="text-lg font-black text-white tracking-widest bg-white/10 px-4 py-2 rounded-xl border border-white/10 shadow-inner group-hover/ref:border-primary/30 group-hover/ref:text-primary transition-all font-mono" style={{ padding: 8 }}>
                                        {ref.referralCode}
                                    </span>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
