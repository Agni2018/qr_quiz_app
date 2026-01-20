'use client';

import { useState, useEffect, use } from 'react';
import api from '@/lib/api';
import { useSearchParams } from 'next/navigation';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Link from 'next/link';

export default function QuizResult({ params }: { params: Promise<{ topicId: string }> }) {
    const { topicId } = use(params);
    const searchParams = useSearchParams();
    const attemptId = searchParams.get('attemptId');

    const [attempt, setAttempt] = useState<any>(null);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (attemptId) {
                    const attemptRes = await api.get(`/quiz/result/${attemptId}`);
                    setAttempt(attemptRes.data);
                }

                const lbRes = await api.get(`/quiz/leaderboard/${topicId}`);
                setLeaderboard(lbRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [attemptId, topicId]);

    if (loading) return <div className="container">Loading Results...</div>;

    return (
        <main className="container py-16 flex flex-col gap-12">

            {/* Score Card */}
            {attempt && (
                <Card className="text-center p-16 border border-violet-500/30 bg-slate-900/40 backdrop-blur-3xl rounded-[40px] shadow-3xl relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl -mt-32"></div>

                    <div className="relative z-10">
                        <h1 className="text-sm font-black uppercase tracking-[0.3em] text-slate-500 mb-6">Quiz Final Score</h1>
                        <div className="text-[6rem] font-black text-violet-400 leading-none mb-4 tabular-nums">
                            {attempt.score}
                        </div>
                        <p className="text-slate-400 font-bold text-lg uppercase tracking-widest mb-10">Challenge Completed</p>

                        <div className="py-8 px-10 rounded-3xl bg-white/5 border border-white/5 inline-block">
                            <h3 className="text-3xl font-black text-white/90 mb-2">✨ Great job, {attempt.user.name}!</h3>
                            <p className="text-slate-400 font-medium">Your performance was recorded on the global records.</p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Leaderboard Section */}
            <section className="flex flex-col gap-8">
                <div className="flex items-center gap-4 px-4">
                    <div className="w-1.5 h-8 bg-amber-500 rounded-full"></div>
                    <h2 className="text-3xl font-black tracking-tight text-white/95">Global Leaderboard</h2>
                </div>

                <Card className="p-10 border border-white/5 bg-slate-900/40 backdrop-blur-xl rounded-[32px]">
                    <div className="flex flex-col gap-5">
                        {leaderboard.length === 0 && (
                            <div className="py-12 text-center text-slate-500 font-medium">No records found.</div>
                        )}
                        {leaderboard.map((entry, index) => (
                            <div
                                key={index}
                                className={`flex justify-between items-center p-6 rounded-2xl transition-all duration-300 ${entry._id === attempt?._id
                                    ? 'bg-violet-500/20 border-2 border-violet-500 shadow-lg shadow-violet-500/10'
                                    : 'bg-white/[0.03] border-2 border-transparent hover:bg-white/[0.05]'
                                    }`}
                            >
                                <div className="flex gap-6 items-center">
                                    <span className={`w-10 h-10 flex items-center justify-center rounded-xl font-black text-sm ${index === 0 ? 'bg-amber-500 text-black' :
                                        index === 1 ? 'bg-slate-300 text-black' :
                                            index === 2 ? 'bg-orange-600 text-white' :
                                                'bg-white/10 text-slate-400'
                                        }`}>
                                        {index + 1}
                                    </span>
                                    <span className={`text-lg font-bold ${entry._id === attempt?._id ? 'text-white' : 'text-white/80'}`}>
                                        {entry.user.name} {entry._id === attempt?._id && <span className="ml-2 text-xs font-black uppercase tracking-widest text-violet-400">(You)</span>}
                                    </span>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className={`text-2xl font-black tabular-nums ${entry._id === attempt?._id ? 'text-violet-400' : 'text-slate-300'}`}>
                                        {entry.score}
                                    </span>
                                    <span className="text-[0.6rem] font-black uppercase tracking-widest text-slate-500">Pts</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </section>

            <footer className="text-center py-12 px-10 rounded-[40px] bg-gradient-to-b from-white/[0.03] to-transparent border border-white/5">
                <h3 className="text-2xl font-black text-violet-400 mb-3">
                    🎉 Thank you for participating!
                </h3>

            </footer>


        </main>
    );
}
