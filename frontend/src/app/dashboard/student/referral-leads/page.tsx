'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Link from 'next/link';
import { FaTrophy, FaArrowLeft, FaUserPlus } from 'react-icons/fa';

export default function ReferralLeaderboardPage() {
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReferralLeaderboard = async () => {
            try {
                const res = await api.get('/analytics/referral-leaderboard');
                setLeaderboard(res.data);
            } catch (err) {
                console.error('Error fetching referral leaderboard:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchReferralLeaderboard();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="animate-fade-in mb-24">
            <div className="flex items-center gap-8 mb-32 group" style={{ margin: '10px 0 50px 0' }}>
                <div style={{
                    width: '5rem',
                    height: '5rem',
                    borderRadius: '1.5rem',
                    background: 'linear-gradient(135deg, #10b981, #14b8a6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.25rem',
                    boxShadow: '0 10px 40px rgba(16, 185, 129, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    transform: 'rotate(-3deg)'
                }} className="group-hover:rotate-0 transition-transform duration-500">
                    👥
                </div>
                <div className="flex flex-col">
                    <h2
                        className="text-7xl font-black tracking-tighter"
                        style={{
                            backgroundImage: 'linear-gradient(to right, #10b981, #14b8a6)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}
                    >
                        Referral Leads
                    </h2>
                    <div className="h-2 w-32 rounded-full mt-2 opacity-40 bg-gradient-to-r from-[#10b981] to-transparent" />
                </div>
                <div className="ml-auto" style={{ alignSelf: 'center' }}>
                    <Link href="/dashboard/student/leaderboard">
                        <Button
                            variant="secondary"
                            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border-white/10 text-white font-bold hover:bg-white/10 transition-all"
                        >
                            <FaArrowLeft />
                            <span>Back to Global</span>
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="max-w-5xl mx-auto w-full mt-12">
                <h3 className="text-2xl font-bold mb-8 flex items-center gap-3 text-slate-500 uppercase tracking-widest pl-2" style={{ marginBottom: 30 }}>
                    <FaUserPlus className="text-emerald-500" /> Top Referral Masters
                </h3>

                <div className="flex flex-col gap-4">
                    {leaderboard.length > 0 ? (
                        leaderboard.map((u: any, i: number) => (
                            <Card
                                key={i}
                                className={`
                                    p-6 flex items-center justify-between rounded-[1.5rem] transition-all hover:-translate-y-1 duration-300
                                    ${i === 0 ? 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/30' :
                                        i === 1 ? 'bg-slate-500/5 border-slate-500/20' :
                                            i === 2 ? 'bg-teal-600/5 border-teal-600/20' :
                                                'bg-white/5 border-white/5 hover:bg-white/10'}
                                `}
                            >
                                <div className="flex items-center gap-6">
                                    <div className={`
                                        w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-black
                                        ${i === 0 ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40' :
                                            i === 1 ? 'bg-slate-300 text-slate-800' :
                                                i === 2 ? 'bg-teal-600 text-white' :
                                                    'bg-slate-800/50 text-slate-500'}
                                    `}>
                                        {i + 1}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className={`font-bold text-lg ${i === 0 ? 'text-emerald-500' : 'text-slate-200'}`}>
                                            {u.username}
                                        </span>
                                        {i === 0 && <span className="text-[0.65rem] font-bold uppercase tracking-wider text-emerald-500/60">Top Referrer</span>}
                                    </div>
                                </div>

                                <div className="flex flex-col items-end">
                                    <span className={`text-2xl font-black ${i === 0 ? 'text-emerald-500' : 'text-white'}`}>
                                        {u.referralCount}
                                    </span>
                                    <span className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-500">Referrals</span>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-white/5 rounded-[2rem] border border-white/5">
                            <p className="text-slate-400 font-bold text-lg">No referrals documented yet. Be the first!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
