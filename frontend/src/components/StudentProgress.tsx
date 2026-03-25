'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { FaCheckCircle } from 'react-icons/fa';

export default function StudentProgress() {
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

    if (attempts.length === 0) {
        return (
            <Card className="p-20 text-center border-dashed border-2 border-white/5 rounded-[40px] mt-12" style={{ background: '#1a1f2e' }}>
                <div className="w-24 h-24 bg-slate-900 rounded-[2rem] flex items-center justify-center mx-auto mb-10 text-5xl shadow-inner shadow-white/5">📝</div>
                <h3 className="text-4xl font-black mb-4">No topics yet</h3>
                <p className="text-slate-500 mb-12 text-xl max-w-md mx-auto leading-relaxed">Start your academic journey by exploring new quiz topics!</p>
                <Link href="/dashboard/student/explore">
                    <Button className="px-16 py-6 rounded-[2rem] text-xl font-black bg-primary shadow-xl shadow-primary/20">Discover Topics</Button>
                </Link>
            </Card>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-10 mt-12" >
            {attempts.map((attempt) => (
                <Card
                    key={attempt._id}
                    className="group hover:-translate-y-3 transition-all duration-500 border-white/5 hover:bg-slate-900/60 rounded-[2.5rem] flex flex-col h-full shadow-2xl"
                    style={{ padding: '2.5rem', marginTop: 2, background: '#1a1f2e' }}
                >
                    <div className="flex justify-between items-start mb-8">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary text-2xl border border-primary/20 group-hover:scale-110 transition-transform" style={{ marginBottom: 30 }}>
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

                    <div className="mt-10 pt-8 border-t border-white/5 flex flex-col gap-6" style={{ marginTop: 30 }}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex flex-col">
                                <span className="text-slate-500 text-[0.65rem] font-black uppercase tracking-widest leading-none mb-1">Performance</span>
                                <span className="text-2xl font-black text-white">{attempt.score} <span className="text-sm text-slate-400 font-medium ml-1">pts</span></span>
                            </div>
                            {(() => {
                                const isPassed = attempt.pointsEarned > 0 || 
                                               (attempt.topicId && attempt.score > 0 && attempt.score >= (attempt.topicId.passingMarks || 0));
                                return (
                                    <div className="flex flex-col items-start sm:items-end">
                                        <span className={`text-[0.65rem] font-black uppercase tracking-widest leading-none mb-1 ${isPassed ? 'text-primary' : 'text-slate-500'}`}>Status</span>
                                        <span className={`text-lg font-black ${isPassed ? 'text-primary' : 'text-slate-500'}`}>
                                            {isPassed ? '+3 Points Earned' : 'Passing Mark Not Met'}
                                        </span>
                                    </div>
                                );
                            })()}
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
    );
}
