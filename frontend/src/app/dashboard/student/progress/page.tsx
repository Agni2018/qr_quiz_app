'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { FaCheckCircle } from 'react-icons/fa';

export default function ProgressPage() {
    const [attempts, setAttempts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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

    return (
        <div className="animate-fade-in mb-24" >
            <div className="flex items-center gap-8 mb-32 group" style={{margin:'10px 0 50px 0'}}>
                <div style={{
                    width: '5rem',
                    height: '5rem',
                    borderRadius: '1.5rem',
                    background: 'linear-gradient(135deg, var(--secondary), var(--primary))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.25rem',
                    boxShadow: '0 10px 40px rgba(59, 130, 246, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    transform: 'rotate(-3deg)'
                }} className="group-hover:rotate-0 transition-transform duration-500">
                    📝
                </div>
                <div className="flex flex-col" >
                    <h2
                        className="text-7xl font-black tracking-tighter"
                        style={{
                            backgroundImage: 'linear-gradient(to right, var(--primary), var(--secondary))',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
        
                        }}
                    >
                        Manage Topics
                    </h2>
                    <div className="h-2 w-32 rounded-full mt-2 opacity-40 bg-gradient-to-r from-primary to-transparent" />
                </div>
            </div>

            {attempts.length === 0 ? (
                <Card className="p-20 text-center bg-slate-950/40 border-dashed border-2 border-white/5 rounded-[40px] mt-12">
                    <div className="w-24 h-24 bg-slate-900 rounded-[2rem] flex items-center justify-center mx-auto mb-10 text-5xl shadow-inner shadow-white/5">📝</div>
                    <h3 className="text-4xl font-black mb-4">No topics yet</h3>
                    <p className="text-slate-500 mb-12 text-xl max-w-md mx-auto leading-relaxed">Start your academic journey by exploring new quiz topics!</p>
                    <Link href="/dashboard/student/explore">
                        <Button className="px-16 py-6 rounded-[2rem] text-xl font-black bg-primary shadow-xl shadow-primary/20">Discover Topics</Button>
                    </Link>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-10 mt-12" >
                    {attempts.map((attempt) => (
                        <Card
                            key={attempt._id}
                            className="group hover:-translate-y-3 transition-all duration-500 border-white/5 bg-slate-950/40 hover:bg-slate-900/60 rounded-[2.5rem] flex flex-col h-full shadow-2xl"
                            style={{ padding: '2.5rem', marginTop: 2 }}
                        >
                            <div className="flex justify-between items-start mb-8">
                                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary text-2xl border border-primary/20 group-hover:scale-110 transition-transform" style={{marginBottom:30}}>
                                    <FaCheckCircle />
                                </div>
                                <span className="text-[0.7rem] font-black uppercase tracking-widest text-slate-400 bg-white/5 py-2 px-5 rounded-xl">
                                    {new Date(attempt.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                            </div>
                            <div className="flex-1 flex flex-col gap-3">
                                <h3 className="text-2xl font-black group-hover:text-primary transition-colors leading-tight">
                                    {attempt.topicId?.name}
                                </h3>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs font-black uppercase tracking-widest text-slate-500">Global Rank</span>
                                    <span className={`text-lg font-black ${attempt.rank <= 3 ? 'text-yellow-500' : 'text-primary'}`}>
                                        #{attempt.rank || '-'}
                                    </span>
                                </div>
                                <p className="text-slate-500 text-lg line-clamp-2 leading-relaxed">{attempt.topicId?.description}</p>
                            </div>

                            <div className="mt-10 pt-8 border-t border-white/5 flex flex-col gap-6" style={{marginTop:30}}>
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-slate-500 text-[0.65rem] font-black uppercase tracking-widest leading-none mb-1">Performance</span>
                                        <span className="text-2xl font-black text-white">{attempt.score} <span className="text-sm text-slate-400 font-medium ml-1">pts</span></span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-primary text-[0.65rem] font-black uppercase tracking-widest leading-none mb-1">Status</span>
                                        <span className="text-lg font-black text-primary/80">+1 Point Earned</span>
                                    </div>
                                </div>
                                <Link href={`/quiz/${attempt.topicId?._id}/result?attemptId=${attempt._id}`}>
                                    <Button variant="secondary" className="w-full py-4 rounded-xl font-black text-sm bg-primary hover:scale-[1.02] transition-all shadow-lg shadow-primary/40">
                                        View Details →
                                    </Button>
                                </Link>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
