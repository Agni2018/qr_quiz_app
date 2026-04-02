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
                
                {/* Header Row: Title */}
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6 group w-full" style={{ margin: '10px 0 20px 0' }}>
                    <div className="flex items-center gap-6 lg:gap-8">
                        <div className="flex flex-col">
                            <h2
                                className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter"
                                style={{
                                    color: '#000',
                                    marginLeft: '1rem'
                                }}
                            >
                                Leaderboard
                            </h2>
                        </div>
                    </div>
                </div>

                {/* Content Row: Leaderboard (Left) and Momentum (Right) */}
                <div className="flex flex-col lg:flex-row items-start mb-12" style={{ gap: '80px' }}>
                    
                    {/* Left Column: Leaderboard Rows */}
                    <div className="flex-1 w-full order-2 lg:order-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-start gap-5 mb-8" style={{marginBottom:20}}>
                            <h3 className="text-2xl font-bold flex items-center gap-3 text-slate-500 uppercase tracking-widest pl-2 m-0" style={{color:'orange'}}>
                                <FaTrophy className="text-yellow-500" /> Top Performers
                            </h3>
                        </div>

                        <div className="flex flex-col gap-4">
                            {leaderboard?.topScorers?.map((u: any, i: number) => (
                                <Card
                                    key={i}
                                    className={`
                                        p-6 flex items-center justify-between rounded-[1.5rem] transition-all hover:-translate-y-1 duration-300 border
                                        ${i === 0 ? 'bg-gradient-to-r from-yellow-500/5 to-orange-500/5 border-yellow-500/30' :
                                            i === 1 ? 'border-slate-200 hover:bg-slate-50' :
                                            i === 2 ? 'border-slate-200 hover:bg-slate-50' :
                                                'border-slate-100 hover:bg-slate-50'}
                                    `}
                                    style={{ background: 'white', padding: 10, margin: '0 1rem' }}
                                >
                                    <div className="flex items-center gap-6">
                                        <div className={`
                                            w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-black
                                            ${i === 0 ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/40' :
                                                i === 1 ? 'bg-slate-300 text-slate-800' :
                                                    i === 2 ? 'bg-amber-600 text-white' :
                                                        'bg-slate-100 text-slate-500'}
                                        `}>
                                            {i + 1}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={`font-bold text-lg ${i < 3 ? 'text-yellow-500' : 'text-black'}`}>
                                                {u.username}
                                            </span>
                                            {i === 0 && <span className="text-[0.65rem] font-bold uppercase tracking-wider text-yellow-500/80">Current Champion</span>}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end">
                                        <span className={`text-2xl font-black ${i < 3 ? 'text-yellow-500' : 'text-black'}`}>
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
                        <div className="w-full lg:w-[320px] shrink-0 order-1 lg:order-2 animate-in fade-in slide-in-from-right duration-700 flex justify-center">
                            <Card 
                                className="border border-slate-200 rounded-[2.5rem] shadow-2xl backdrop-blur-xl relative overflow-hidden group/momentum w-[calc(100%-2rem)] lg:w-full mx-auto"
                                style={{ padding: '30px', marginTop: 50, background: 'white' }}
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                                
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
                                        <FaStar className="text-emerald-500 text-lg" />
                                    </div>
                                    <span className="text-[0.7rem] font-black uppercase tracking-[0.25em] text-emerald-500">Your Momentum</span>
                                </div>

                                <div className="flex justify-center relative z-10 w-full mb-6">
                                    <div className="flex flex-col items-center justify-center w-48 h-48 rounded-full border-[8px] border-[#10b981] shadow-[0_0_20px_rgba(16,185,129,0.15)] relative overflow-hidden">
                                        <div className="absolute inset-0 bg-[#10b981] opacity-5 rounded-full"></div>
                                        <span className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-400 mb-1 z-10 mt-2">Global Rank</span>
                                        <span className="text-6xl font-black text-[#10b981] tracking-tighter z-10">
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
