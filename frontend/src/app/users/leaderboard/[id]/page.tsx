'use client';

import { useState, useEffect, use } from 'react';
import api from '@/lib/api';
import Card from '@/components/Card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function UserLeaderboard({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                await api.get('/auth/status');
            } catch (err) {
                // Interceptor will handle redirect
            }
        };

        checkAuth();

        api.get(`/quiz/leaderboard/${id}`)
            .then(res => {
                setLeaderboard(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });

        window.addEventListener('focus', checkAuth);
        return () => window.removeEventListener('focus', checkAuth);
    }, [id]);

    return (
        <main className="container py-12 px-6">
            <div className="mb-12">
                <Link href={`/users/topic/${id}`} className="text-slate-500 hover:text-white transition-colors text-sm font-medium flex items-center gap-2 mb-6">
                    &larr; Back to Topic Details
                </Link>
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-xl md:text-2xl shrink-0">
                        🏆
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight">Leaderboard</h1>
                </div>
            </div>

            <Card className="p-6 md:p-10 border border-white/5 bg-slate-900/40 backdrop-blur-xl rounded-[32px]">
                <div className="flex flex-col gap-6">
                    {loading && (
                        <div className="flex flex-col items-center py-20 gap-4">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500"></div>
                            <p className="text-slate-400 font-medium text-sm">Loading participants...</p>
                        </div>
                    )}

                    {!loading && leaderboard.length === 0 && (
                        <div className="py-20 text-center">
                            <span className="text-5xl mb-4 block">👻</span>
                            <p className="text-slate-400 text-lg font-medium">No attempts recorded yet for this topic.</p>
                        </div>
                    )}

                    {leaderboard.map((entry, index) => (
                        <div
                            key={index}
                            className="group flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 md:p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] hover:border-amber-500/20 transition-all duration-300 gap-4"
                        >
                            <div className="flex gap-4 md:gap-6 items-center">
                                <span className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl font-black text-lg transition-transform group-hover:scale-110 shadow-lg shrink-0 ${index === 0 ? 'bg-amber-500 text-black shadow-amber-500/20' :
                                    index === 1 ? 'bg-slate-300 text-black shadow-slate-300/20' :
                                        index === 2 ? 'bg-orange-600 text-white shadow-orange-600/20' :
                                            'bg-white/10 text-slate-400'
                                    }`}>
                                    {index + 1}
                                </span>
                                <div>
                                    <div className="font-bold text-base md:text-lg text-white/90 mb-1 break-all">{entry.user.name}</div>
                                    <div className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-500">
                                        {new Date(entry.completedAt).toLocaleDateString()} at {new Date(entry.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto mt-2 sm:mt-0 pt-4 sm:pt-0 border-t border-white/5 sm:border-t-0">
                                <span className="sm:hidden text-[0.6rem] font-black uppercase tracking-widest text-slate-500">Score</span>
                                <div className="flex flex-col items-end">
                                    <span className="text-xl md:text-2xl font-black text-amber-500 tabular-nums">
                                        {entry.score}
                                    </span>
                                    <span className="hidden sm:block text-[0.6rem] font-black uppercase tracking-widest text-slate-500 mt-1">Points</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </main>
    );
}
