'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { FaStar, FaCheckCircle, FaLock, FaClock } from 'react-icons/fa';
import Card from './Card';
import Pagination from './Pagination';

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
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    const isMobile = windowWidth < 768;

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
        if (total < 0) return 'Ended';
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

    // Pagination
    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const paginatedChallenges = challenges.slice(indexOfFirst, indexOfLast);

    return (
        <div className="flex flex-col space-y-6">
            {challenges.length === 0 ? (
                <Card className="p-10 text-center border-dashed border-2 border-slate-200 opacity-100 shadow-inner" style={{ margin: "1rem 0", padding: "2rem", background: "#fff" }}>
                    <FaClock className="text-4xl mx-auto mb-4 text-slate-300" />
                    <h3 className="text-xl font-black uppercase tracking-widest" style={{ color: '#94a3b8' }}>No Active Challenges</h3>
                    <p className="font-bold mt-2 text-sm" style={{ color: '#64748b' }}>Check back soon for new weekly goals!</p>
                </Card>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {paginatedChallenges.map((challenge) => (
                            <Card key={challenge._id} className={`group relative overflow-hidden border border-slate-200 transition-all duration-500 ${challenge.isCompleted ? 'border-emerald-500/30' : 'hover:border-primary/30'}`} style={{ padding: '20px', margin: "0", boxShadow: '0 4px 20px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)', background: '#fff' }}>
                                {/* Time Remaining Indicator */}
                                <div className={`absolute top-3 right-5 font-black text-[0.6rem] sm:text-[0.65rem] uppercase tracking-widest z-20 ${challenge.isCompleted ? 'text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full' : 'text-slate-500'}`}>
                                    {challenge.isCompleted ? 'Completed' : getTimeRemaining(challenge.endDate)}
                                </div>

                                <div className="flex flex-col sm:flex-row items-start gap-4 relative z-10 pt-2 sm:pt-0">
                                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-lg shrink-0 transition-transform group-hover:scale-110 duration-500 ${challenge.isCompleted ? 'bg-emerald-500/20 text-emerald-500' : 'bg-indigo-50 text-indigo-500'}`} style={!challenge.isCompleted ? { color: '#4f46e5' } : {}}>
                                        {challenge.isCompleted ? <FaCheckCircle /> : <FaStar className="animate-pulse" />}
                                    </div>

                                    <div className="flex-1 w-full">
                                        <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 mb-2">
                                            <h3 className="text-lg sm:text-xl font-black group-hover:text-primary transition-colors leading-tight" style={{ color: '#000' }}>{challenge.name}</h3>
                                            <span className="text-lg font-black shrink-0 text-yellow-500" style={challenge.isCompleted ? {color: '#10b981'} : {}}>+{challenge.rewardPoints} <span className="text-[10px] opacity-60 uppercase">pts</span></span>
                                        </div>
                                        <p className="font-medium mb-4 leading-relaxed text-sm" style={{ color: '#444' }}>{challenge.description}</p>

                                        <div className="space-y-4">
                                            <div className="flex justify-between text-[10px] sm:text-xs font-black uppercase tracking-widest pt-4" style={{ marginTop: 20 }}>
                                                <span style={{ color: '#666' }}>Progress</span>
                                                <span className="font-bold" style={{ color: challenge.isCompleted ? '#10b981' : '#000' }}>
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
                            </Card>
                        ))}
                    </div>

                    {/* Pagination */}
                    {challenges.length > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: isMobile ? '1.5rem 1rem 2rem' : '1.5rem 1.5rem 2.5rem' }}>
                            <Pagination
                                currentPage={currentPage}
                                totalItems={challenges.length}
                                itemsPerPage={itemsPerPage}
                                onPageChange={setCurrentPage}
                                isMobile={isMobile}
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
