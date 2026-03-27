'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { FaCheckCircle, FaSearch } from 'react-icons/fa';

export default function StudentProgress({ titleComponent }: { titleComponent?: React.ReactNode }) {
    const [attempts, setAttempts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/quiz/student-attempts');
                setAttempts(res.data);
            } catch (err) {
                console.error('Error fetching attempts:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    if (attempts.length === 0) {
        return (
            <Card className="p-20 text-center border-dashed border-2 border-slate-200 bg-white rounded-[40px] mt-12" style={{ padding:30,marginTop:50 }}>
                <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-10 text-5xl shadow-inner border border-slate-100" style={{marginTop:20}}>📝</div>
                <h3 className="text-4xl font-black mb-4 text-black" style={{ color: '#000' }}>No topics yet</h3>
                <p className="text-slate-500 mb-12 text-xl max-w-md mx-auto leading-relaxed" style={{ color: '#333' }}>Start your academic journey by exploring new quiz topics!</p>
                <Link href="/dashboard/student/explore">
                    <Button className="px-16 py-6 rounded-[2rem] text-xl font-black bg-primary shadow-xl shadow-primary/20" style={{marginTop:20}}>Discover Topics</Button>
                </Link>
            </Card>
        );
    }

    const filteredAttempts = attempts.filter(attempt => 
        attempt.topicId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        attempt.topicId?.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-10 md:gap-16">
            {/* SEARCH BAR & HEADER */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-4 w-full">
                {titleComponent && (
                    <div className="shrink-0">
                        {titleComponent}
                    </div>
                )}
                
                <div className="relative w-full lg:max-w-md group" style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                    <input
                        type="text"
                        placeholder="Filter topics..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#0a101f]/80 border border-white/5 rounded-2xl py-4 pr-16 text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/30 transition-all font-bold shadow-xl"
                        style={{ paddingLeft: '1.5rem' }}
                    />
                    <FaSearch className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors size-5" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 px-4" >
                {filteredAttempts.map((attempt) => (
                <Card
                    key={attempt._id}
                    className="group hover:-translate-y-2 transition-all duration-500 border-slate-200 hover:bg-slate-50 rounded-[2.5rem] flex flex-col h-full shadow-2xl bg-white"
                    style={{ padding: '30px' }}
                >
                    <div className="flex justify-between items-start mb-8">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary text-2xl border border-primary/20 group-hover:scale-110 transition-transform">
                            <FaCheckCircle />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white/5 py-2 px-5 rounded-xl">
                            {new Date(attempt.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                    </div>
                    <div className="flex-1 flex flex-col gap-3">
                        <h3 className="text-2xl font-black group-hover:text-primary transition-colors leading-tight text-black" style={{ color: '#000' }}>
                            {attempt.topicId?.name}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Global Rank</span>
                            <span className={`text-xl font-black ${attempt.rank <= 3 ? 'text-yellow-500' : 'text-primary'}`}>
                                #{attempt.rank || '-'}
                            </span>
                        </div>
                        <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">{attempt.topicId?.description}</p>
                    </div>

                    <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col gap-6">
                        <div 
                            className="flex flex-row items-center justify-between bg-slate-50 rounded-2xl gap-4 p-5 border border-slate-100"
                        >
                            <div className="flex flex-col shrink-0">
                                <span className="text-slate-500 text-[9px] font-black uppercase tracking-widest leading-none mb-2" style={{ color: '#333' }}>Performance</span>
                                <span className="text-2xl font-black text-black" style={{ color: '#000' }}>{attempt.score} <span className="text-xs text-slate-500 font-bold ml-1">PTS</span></span>
                            </div>
                            {(() => {
                                const isPassed = attempt.pointsEarned > 0 || 
                                               (attempt.topicId && attempt.score > 0 && attempt.score >= (attempt.topicId.passingMarks || 0));
                                return (
                                    <div className="flex flex-col items-end text-right min-w-0">
                                        <span className={`text-[9px] font-black uppercase tracking-widest leading-none mb-2 ${isPassed ? 'text-primary' : 'text-slate-500'}`}>Status</span>
                                        <span className={`text-sm font-black leading-tight ${isPassed ? 'text-primary' : 'text-slate-500'}`}>
                                            {isPassed ? '+3 Points' : 'FAILED'}
                                        </span>
                                    </div>
                                );
                            })()}
                        </div>
                        <Link href={`/quiz/${attempt.topicId?._id}/result?attemptId=${attempt._id}`}>
                            <Button variant="secondary" className="w-full h-14 rounded-2xl font-black text-xs uppercase tracking-widest bg-primary hover:scale-[1.02] transition-all shadow-xl shadow-primary/20">
                                View Details
                            </Button>
                        </Link>
                    </div>
                </Card>
            ))}
            {filteredAttempts.length === 0 && (
                <div className="col-span-full py-20 text-center flex flex-col items-center gap-4 text-slate-500">
                    <p className="font-bold">No topics found matching "{searchQuery}"</p>
                </div>
            )}
            </div>
        </div>
    );
}
