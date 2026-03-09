'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import Card from '@/components/Card';
import { FaPlus, FaCheckCircle } from 'react-icons/fa';

export default function ExplorePage() {
    const [availableQuizzes, setAvailableQuizzes] = useState<any[]>([]);
    const [attempts, setAttempts] = useState<any[]>([]);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statusRes, quizzesRes, attemptsRes] = await Promise.all([
                    api.get('/auth/status'),
                    api.get('/topics'),
                    api.get('/quiz/student-attempts')
                ]);
                setUser(statusRes.data.user);
                setAvailableQuizzes(quizzesRes.data.filter((q: any) => q.status === 'active'));
                setAttempts(attemptsRes.data);
            } catch (err) {
                console.error('Error fetching explore data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleStartQuiz = async (quizId: string) => {
        if (!user) return;
        try {
            const res = await api.post('/quiz/start', {
                topicId: quizId,
                name: user.username,
                email: user.email,
                phone: 'N/A'
            });

            if (res.data.canAttempt) {
                localStorage.setItem('quizUser', JSON.stringify({
                    name: user.username,
                    email: user.email,
                    phone: 'N/A'
                }));
                router.push(`/quiz/${quizId}/play`);
            }
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to start quiz');
        }
    };

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
                    background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.25rem',
                    boxShadow: '0 10px 40px rgba(139, 92, 246, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    transform: 'rotate(-3deg)'
                }} className="group-hover:rotate-0 transition-transform duration-500">
                    💡
                </div>
                <div className="flex flex-col" >
                    <h2
                        className="text-7xl font-black tracking-tighter"
                        style={{
                            backgroundImage: 'linear-gradient(to right, #8b5cf6, #6366f1)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}
                    >
                        Explore Topics
                    </h2>
                    <div className="h-2 w-32 rounded-full mt-2 opacity-40 bg-gradient-to-r from-[#8b5cf6] to-transparent" />
                </div>
            </div>

            {availableQuizzes.length === 0 ? (
                <Card className="p-20 text-center bg-slate-950/40 border-dashed border-2 border-white/5 rounded-[40px] mt-12">
                    <div className="w-24 h-24 bg-slate-900 rounded-[2rem] flex items-center justify-center mx-auto mb-10 text-5xl shadow-inner shadow-white/5">💡</div>
                    <h3 className="text-4xl font-black mb-4">All Caught Up!</h3>
                    <p className="text-slate-500 mb-12 text-xl max-w-md mx-auto leading-relaxed">No new quizzes available right now. Check back soon for more!</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-10 mt-12">
                    {availableQuizzes.map((quiz) => {
                        const hasAttempted = attempts.some(a => a.topicId?._id === quiz._id);
                        return (
                            <Card
                                key={quiz._id}
                                onClick={() => !hasAttempted && handleStartQuiz(quiz._id)}
                                className={`p-10 group transition-all duration-500 border-white/5 bg-slate-950/40 rounded-[2.5rem] flex flex-col h-full shadow-2xl ${hasAttempted ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-3 hover:bg-slate-900/60 cursor-pointer'}`}
                                style={{padding:30}}
                            >
                                <div className="flex justify-between items-start mb-8">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border transition-all duration-700 ${hasAttempted ? 'bg-slate-500/10 text-slate-500 border-slate-500/20' : 'bg-primary/10 text-primary border-primary/20 group-hover:rotate-[360deg]'}`} style={{marginBottom:30}}>
                                        {hasAttempted ? <FaCheckCircle /> : <FaPlus />}
                                    </div>
                                </div>
                                <h3 className={`text-2xl font-black mb-3 transition-colors ${!hasAttempted && 'group-hover:text-primary'}`}>
                                    {quiz.name}
                                </h3>
                                <p className="text-slate-500 text-lg mb-10 line-clamp-2 leading-relaxed flex-1">{quiz.description}</p>

                                {hasAttempted && (
                                    <div className="mt-auto pt-6 border-t border-white/5 text-center" style={{marginTop:30}}>
                                        <span className="text-red-500 font-black uppercase tracking-widest text-sm">
                                            Attempted Already
                                        </span>
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
