'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Link from 'next/link';
import { FaTrophy, FaUserPlus } from 'react-icons/fa';

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
        <div className="animate-fade-in mb-24">
            <div className="flex items-center gap-8 mb-32 group" style={{margin:'10px 0 50px 0'}}>
                <div style={{
                    width: '5rem',
                    height: '5rem',
                    borderRadius: '1.5rem',
                    background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.25rem',
                    boxShadow: '0 10px 40px rgba(245, 158, 11, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    transform: 'rotate(-3deg)'
                }} className="group-hover:rotate-0 transition-transform duration-500">
                    🏅
                </div>
                <div className="flex flex-col">
                    <h2
                        className="text-7xl font-black tracking-tighter"
                        style={{
                            backgroundImage: 'linear-gradient(to right, #f59e0b, #f97316)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}
                    >
                        Leaderboard
                    </h2>
                    <div className="h-2 w-32 rounded-full mt-2 opacity-40 bg-gradient-to-r from-[#f59e0b] to-transparent" />
                </div>
                <div className="ml-auto" style={{ alignSelf: 'center' }}>
                    <Link href="/dashboard/student/referral-leads">
                        <Button
                            variant="primary"
                            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black shadow-lg shadow-emerald-500/20 transform hover:-translate-y-1 transition-all"
                        >
                            <FaUserPlus className="text-xl" />
                            <span>Referral Leads</span>
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="max-w-5xl mx-auto w-full mt-12">
                <h3 className="text-2xl font-bold mb-8 flex items-center gap-3 text-slate-500 uppercase tracking-widest pl-2" style={{marginBottom:30}}>
                    <FaTrophy className="text-yellow-500" /> Top Global Performers
                </h3>

                <div className="flex flex-col gap-4">
                    {leaderboard?.topScorers?.map((u: any, i: number) => (
                        <Card
                            key={i}
                            className={`
                                p-6 flex items-center justify-between rounded-[1.5rem] transition-all hover:-translate-y-1 duration-300
                                ${i === 0 ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30' :
                                    i === 1 ? 'bg-slate-500/5 border-slate-500/20' :
                                        i === 2 ? 'bg-amber-600/5 border-amber-600/20' :
                                            'bg-white/5 border-white/5 hover:bg-white/10'}
                            `}
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
        </div>
    );
}
