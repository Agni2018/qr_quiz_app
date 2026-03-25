'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Link from 'next/link';
import { FaTrophy, FaUsers, FaStar, FaArrowLeft } from 'react-icons/fa';

export default function LeaderboardPage() {
    const [leaderboard, setLeaderboard] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await api.get('/analytics/global-leaderboard');
                setLeaderboard(res.data);
            } catch (err) {
                console.error('Error fetching leaderboard:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="animate-fade-in mb-24 w-full flex flex-col items-center">
            {/* Main Container - same width as leaderboard list */}
            <div className="max-w-5xl w-full px-4 sm:px-6">
                
                {/* Header Row: Title and Referral Leads Button */}
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-12 group w-full" style={{ margin: '30px 0 30px 0' }}>
                    <div className="flex items-center gap-6 lg:gap-8">
                        <div style={{
                            minWidth: '4rem',
                            minHeight: '4rem',
                            width: '4rem',
                            height: '4rem',
                            borderRadius: '1.25rem',
                            background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.75rem',
                            boxShadow: '0 10px 40px rgba(245, 158, 11, 0.4)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            transform: 'rotate(-3deg)'
                        }} className="group-hover:rotate-0 transition-transform duration-500 lg:w-16 lg:h-16 lg:text-3xl lg:rounded-[1.25rem]">
                            🏅
                        </div>
                        <div className="flex flex-col">
                            <h2
                                className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter"
                                style={{
                                    backgroundImage: 'linear-gradient(to right, #f59e0b, #f97316)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                }}
                            >
                                Leaderboard
                            </h2>
                            <div className="h-1.5 lg:h-2 w-24 lg:w-32 rounded-full mt-2 opacity-40 bg-gradient-to-r from-[#f59e0b] to-transparent" />
                        </div>
                    </div>

                    <div className="w-full lg:w-[320px] flex justify-center lg:justify-end">
                        <Link href="/dashboard/student/referral-leads" className="w-full lg:w-[200px]">
                            <Button
                                variant="secondary"
                                className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-black transition-all text-base shadow-xl backdrop-blur-md border-none"
                                style={{ background: '#10b981', color: 'white' }}
                            >
                                <FaUsers className="text-xl text-white" />
                                <span>Referral Leads</span>
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Content Row: Leaderboard (Left) and Momentum (Right) */}
                <div className="flex flex-col lg:flex-row items-start mb-12" style={{ gap: '80px' }}>
                    
                    {/* Left Column: Leaderboard Rows */}
                    <div className="flex-1 w-full order-2 lg:order-1">
                        <h3 className="text-2xl font-bold mb-8 flex items-center gap-3 text-slate-500 uppercase tracking-widest pl-2" style={{marginBottom:20}}>
                            <FaTrophy className="text-yellow-500" /> Top Global Performers
                        </h3>

                        <div className="flex flex-col gap-4">
                            {leaderboard?.topScorers?.map((u: any, i: number) => (
                                <Card
                                    key={i}
                                    className={`
                                        p-6 flex items-center justify-between rounded-[1.5rem] transition-all hover:-translate-y-1 duration-300
                                        ${i === 0 ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30' :
                                            i === 1 ? 'border-slate-500/20' :
                                            i === 2 ? 'border-amber-600/20' :
                                                'border-white/5 hover:bg-white/10'}
                                    `}
                                    style={{ background: '#1a1f2e',padding:10 }}
                                >
                                    <div className="flex items-center gap-6">
                                        <div className={`
                                            w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-black
                                            ${i === 0 ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/40' :
                                                i === 1 ? 'bg-slate-300 text-slate-800' :
                                                    i === 2 ? 'bg-amber-600 text-white' :
                                                        'bg-slate-800/50 text-slate-500'}
                                        `}>
                                            {i + 1}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={`font-bold text-lg ${i === 0 ? 'text-yellow-500' : 'text-slate-200'}`}>
                                                {u.username}
                                            </span>
                                            {i === 0 && <span className="text-[0.65rem] font-bold uppercase tracking-wider text-yellow-500/60">Current Champion</span>}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end">
                                        <span className={`text-2xl font-black ${i === 0 ? 'text-yellow-500' : 'text-white'}`}>
                                            {u.points}
                                        </span>
                                        <span className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-500">Points</span>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                    
                    {/* Right Column: Your Momentum Card */}
                    {leaderboard?.userRank && (
                        <div className="w-full lg:w-[320px] shrink-0 order-1 lg:order-2 animate-in fade-in slide-in-from-right duration-700">
                            <Card 
                                className="border border-white/10 rounded-[2.5rem] shadow-2xl backdrop-blur-xl relative overflow-hidden group/momentum w-full"
                                style={{ padding: '30px', marginTop: 50, background: '#1a1f2e' }}
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                                
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/20 shadow-lg shadow-emerald-500/10" style={{marginBottom:20}}>
                                        <FaStar className="text-emerald-500 text-lg" />
                                    </div>
                                    <span className="text-[0.7rem] font-black uppercase tracking-[0.25em] text-emerald-500">Your Momentum</span>
                                </div>

                                <div className="flex flex-col relative z-10">
                                    <span className="text-[0.7rem] font-bold uppercase tracking-widest text-slate-500 mb-2">Global Rank</span>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-6xl font-black text-white tracking-tighter group-hover:momentum:scale-105 transition-transform duration-500">
                                            #{leaderboard.userRank.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
