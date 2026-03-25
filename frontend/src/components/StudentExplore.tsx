'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import Card from '@/components/Card';
import { FaPlus, FaCheckCircle } from 'react-icons/fa';

export default function StudentExplore() {
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


    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    if (availableQuizzes.length === 0) {
        return (
            <Card className="p-20 text-center border-dashed border-2 border-white/5 rounded-[40px] mt-12" style={{ background: '#1a1f2e' }}>
                <div className="w-24 h-24 bg-slate-900 rounded-[2rem] flex items-center justify-center mx-auto mb-10 text-5xl shadow-inner shadow-white/5">💡</div>
                <h3 className="text-4xl font-black mb-4">All Caught Up!</h3>
                <p className="text-slate-500 mb-12 text-xl max-w-md mx-auto leading-relaxed">No new quizzes available right now. Check back soon for more!</p>
            </Card>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-10 mt-12">
            {availableQuizzes.map((quiz) => {
                const hasAttempted = attempts.some(a => a.topicId?._id === quiz._id);
                return (
                    <Card
                        key={quiz._id}
                        className={`p-10 transition-all duration-500 border-white/5 rounded-[2.5rem] flex flex-col h-full shadow-2xl ${hasAttempted ? 'opacity-70' : ''}`}
                        style={{ padding: 30, background: '#1a1f2e' }}
                    >
                        <div className="flex justify-between items-start mb-8">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border transition-all duration-700 ${hasAttempted ? 'bg-slate-500/10 text-slate-500 border-slate-500/20' : 'bg-primary/10 text-primary border-primary/20'}`} style={{ marginBottom: 30 }}>
                                {hasAttempted ? <FaCheckCircle /> : <FaPlus />}
                            </div>
                            {hasAttempted && (
                                <div className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20" style={{padding:5}}>
                                    <span className="text-red-500 font-black uppercase tracking-widest text-[10px]">
                                        Attempted Already
                                    </span>
                                </div>
                            )}
                        </div>
                        <h3 className="text-2xl font-black mb-3 transition-colors text-white">
                            {quiz.name}
                        </h3>
                        <p className="text-slate-500 text-lg mb-10 line-clamp-2 leading-relaxed flex-1">{quiz.description}</p>


                    </Card>
                );
            })}
        </div>
    );
}
