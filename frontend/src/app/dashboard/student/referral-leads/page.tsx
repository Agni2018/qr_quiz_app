'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Link from 'next/link';
import { FaTrophy, FaArrowLeft, FaUsers } from 'react-icons/fa';

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
        <div className="animate-fade-in mb-24 w-full flex flex-col items-center">
            <div className="max-w-5xl w-full px-4 sm:px-6">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-12 group w-full" style={{ margin: '30px 0 30px 0' }}>
                    <div className="flex items-center gap-6 lg:gap-8">
                        <div style={{
                            minWidth: '4rem',
                            minHeight: '4rem',
                            width: '4rem',
                            height: '4rem',
                            borderRadius: '1.25rem',
                            background: 'linear-gradient(135deg, #10b981, #14b8a6)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.75rem',
                            boxShadow: '0 10px 40px rgba(16, 185, 129, 0.4)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            transform: 'rotate(-3deg)'
                        }} className="group-hover:rotate-0 transition-transform duration-500 lg:w-16 lg:h-16 lg:text-3xl lg:rounded-[1.25rem]">
                            👥
                        </div>
                        <div className="flex flex-col">
                            <h2
                                className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter"
                                style={{
                                    backgroundImage: 'linear-gradient(to right, #10b981, #14b8a6)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                }}
                            >
                                Referral Leads
                            </h2>
                            <div className="h-1.5 lg:h-2 w-24 lg:w-32 rounded-full mt-2 opacity-40 bg-gradient-to-r from-[#10b981] to-transparent" />
                        </div>
                    </div>

                    <div className="w-full lg:w-[320px] flex justify-center lg:justify-start">
                        <Link href="/dashboard/student/leaderboard" className="block w-full lg:w-auto flex justify-center lg:block">
                            <Button
                                variant="secondary"
                                className="w-[calc(100%-1rem)] lg:w-auto mx-auto lg:mx-0 flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black transition-all text-base shadow-xl backdrop-blur-md"
                                style={{ background: '#10b981', color: 'white' }}
                            >
                                <FaArrowLeft />
                                <FaUsers className="text-xl" />
                                <span>Back to Global</span>
                            </Button>
                        </Link>
                    </div>
                </div>
                <div className="mt-12 w-full">
                    <h3 className="text-2xl font-bold mb-8 flex items-center gap-3 text-slate-500 uppercase tracking-widest pl-2" style={{ marginBottom: 30,color:'green' }}>
                        <FaUsers className="text-emerald-500" /> Top Referral Masters
                    </h3>

                    <div className="flex flex-col gap-4">
                        {leaderboard.length > 0 ? (
                            leaderboard.map((u: any, i: number) => (
                                <Card
                                    key={i}
                                    className={`
                                        p-6 flex items-center justify-between rounded-[1.5rem] transition-all hover:-translate-y-1 duration-300 border
                                        ${i === 0 ? 'bg-emerald-50/20 border-emerald-500/30' :
                                            i === 1 ? 'border-slate-200 hover:bg-slate-50' :
                                                i === 2 ? 'border-slate-200 hover:bg-slate-50' :
                                                    'border-slate-100 hover:bg-slate-50'}
                                    `}
                                    style={{ background: 'white', padding: 10, margin: '0 1rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                                >
                                    <div className="flex items-center gap-6">
                                        <div className={`
                                            w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-black
                                            ${i === 0 ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40' :
                                                i === 1 ? 'bg-slate-200 text-slate-800' :
                                                    i === 2 ? 'bg-teal-600 text-white' :
                                                        'bg-slate-100 text-slate-500'}
                                        `}>
                                            {i + 1}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={`font-bold text-lg ${
                                                i === 0 ? 'text-emerald-500' : 
                                                i === 1 ? 'text-yellow-500' : 
                                                i === 2 ? 'text-teal-600' : 'text-black'
                                            }`}>
                                                {u.username}
                                            </span>
                                            {i === 0 && <span className="text-[0.65rem] font-bold uppercase tracking-wider text-emerald-600">Top Referrer</span>}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end">
                                        <span className={`text-2xl font-black ${
                                            i === 0 ? 'text-emerald-500' : 
                                            i === 1 ? 'text-yellow-500' : 
                                            i === 2 ? 'text-teal-600' : 'text-black'
                                        }`}>
                                            {u.referralCount}
                                        </span>
                                        <span className="text-[0.65rem] font-bold uppercase tracking-wider text-black">Referrals</span>
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <div className="text-center py-20 rounded-[2rem] border border-slate-200 bg-white shadow-lg">
                                <p className="text-black font-bold text-lg">No referrals documented yet. Be the first!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
