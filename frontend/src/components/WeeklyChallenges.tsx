'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { FaStar, FaCheckCircle, FaLock, FaClock } from 'react-icons/fa';
import Card from './Card';

interface Challenge {
    _id: string;
    name: string;
    description: string;
    type: string;
    threshold: number;
    rewardPoints: number;
    startDate: string;
    endDate: string;
    currentValue: number;
    isCompleted: boolean;
    isRewarded: boolean;
}

export default function WeeklyChallenges() {
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchChallenges = async () => {
        try {
            const res = await api.get('/challenges/my');
            setChallenges(res.data);
        } catch (err) {
            console.error('Error fetching challenges:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChallenges();
    }, []);

    const getTimeRemaining = (endDate: string) => {
        const total = Date.parse(endDate) - Date.parse(new Date().toString());
        const days = Math.floor(total / (1000 * 60 * 60 * 24));
        const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
        return `${days}d ${hours}h left`;
    };

    if (loading) {
        return (
            <div className="flex justify-center p-20">
                <div className="w-12 h-12 border-4 border-white/10 border-top-primary rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2 mb-10">
                <h2 className="text-5xl font-black text-[#0a0f1e] tracking-tighter uppercase" style={{margin:"2rem 1rem 1rem 1rem"}}>Weekly Challenges</h2>
                <p className="text-slate-600 font-bold uppercase tracking-[0.3em] text-xs" style={{margin:"1rem 1rem 4rem 1rem"}}>Complete tasks to earn bonus points every week</p>
            </div>

            {challenges.length === 0 ? (
                <Card className="p-12 text-center border-dashed border-2 border-slate-200 bg-slate-50 opacity-100 shadow-inner" style={{margin:"2rem 1rem 1rem 1rem",padding:"2.5rem"}}>
                    <FaClock className="text-5xl mx-auto mb-6 text-slate-300" />
                    <h3 className="text-2xl font-black text-slate-400 uppercase tracking-widest">No Active Challenges</h3>
                    <p className="text-slate-500 font-bold mt-2">Check back soon for new weekly goals!</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {challenges.map((challenge) => (
                        <Card key={challenge._id} className={`group relative overflow-hidden bg-white border border-slate-200 transition-all duration-500 ${challenge.isCompleted ? 'border-emerald-500/30' : 'hover:border-primary/30'}`} style={{ padding: 'max(1.25rem, 2.5vw)', margin: "1rem" }}>
                            {/* Time Remaining Indicator - Repositioned for safer mobile view */}
                            <div className={`absolute top-2 right-4 font-black text-[0.6rem] sm:text-[0.7rem] uppercase tracking-widest z-20 ${challenge.isCompleted ? 'text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full' : 'text-slate-500'}`}>
                                {challenge.isCompleted ? 'Completed' : getTimeRemaining(challenge.endDate)}
                            </div>

                            <div className="flex flex-col sm:flex-row items-start gap-6 relative z-10 pt-4 sm:pt-0">
                                <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-[1.5rem] flex items-center justify-center text-xl sm:text-2xl shrink-0 transition-transform group-hover:scale-110 duration-500 ${challenge.isCompleted ? 'bg-emerald-500/20 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-black shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]'}`}>
                                    {challenge.isCompleted ? <FaCheckCircle /> : <FaStar className="animate-pulse" />}
                                </div>

                                <div className="flex-1 w-full">
                                    <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 mb-4">
                                        <h3 className="text-xl sm:text-2xl font-black text-black group-hover:text-primary transition-colors leading-tight" style={{ color: '#000' }}>{challenge.name}</h3>
                                        <span className={`text-lg sm:text-xl font-black shrink-0 ${challenge.isCompleted ? 'text-emerald-500' : 'text-yellow-500'}`}>+{challenge.rewardPoints} <span className="text-[10px] opacity-60 uppercase">pts</span></span>
                                    </div>
                                    <p className="text-slate-500 font-medium mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base" style={{ color: '#333' }}>{challenge.description}</p>

                                    <div className="space-y-4">
                                        <div className="flex justify-between text-[10px] sm:text-xs font-black uppercase tracking-widest pt-4" style={{marginTop:20}}>
                                            <span className="text-slate-500">Progress</span>
                                            <span className={challenge.isCompleted ? 'text-emerald-500' : 'text-primary'}>
                                                {Math.min(challenge.currentValue, challenge.threshold)} / {challenge.threshold}
                                            </span>
                                        </div>
                                        <div className="h-2.5 sm:h-3.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200 shadow-inner relative">
                                            <div 
                                                className={`h-full transition-all duration-1000 ease-out`}
                                                style={{ 
                                                    width: `${Math.min((challenge.currentValue / challenge.threshold) * 100, 100)}%`,
                                                    background: challenge.isCompleted ? '#10b981' : 'var(--primary)',
                                                    boxShadow: `0 0 15px ${challenge.isCompleted ? 'rgba(16, 185, 129, 0.4)' : 'rgba(var(--primary-rgb), 0.4)'}`
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {!challenge.isCompleted && challenge.currentValue === 0 && (
                                <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                    <span className="bg-primary text-black px-6 py-2 rounded-full font-black text-xs uppercase tracking-tighter">Start Challenge</span>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
