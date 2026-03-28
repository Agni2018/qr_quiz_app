'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import Card from '@/components/Card';
import Pagination from '@/components/Pagination';
import { FaPlus, FaCheckCircle } from 'react-icons/fa';

export default function StudentExplore() {
    const [availableQuizzes, setAvailableQuizzes] = useState<any[]>([]);
    const [attempts, setAttempts] = useState<any[]>([]);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const router = useRouter();

    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    const isMobile = windowWidth < 768;

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
            <Card className="p-20 text-center border-dashed border-2 border-slate-200 rounded-[40px] mt-12" style={{ background: 'white', margin: '1rem', boxShadow: '0 4px 24px rgba(0,0,0,0.10)' }}>
                <div className="w-24 h-24 bg-slate-100 rounded-[2rem] flex items-center justify-center mx-auto mb-10 text-5xl shadow-inner">💡</div>
                <h3 className="text-4xl font-black mb-4" style={{ color: '#000' }}>All Caught Up!</h3>
                <p className="mb-12 text-xl max-w-md mx-auto leading-relaxed" style={{ color: '#444' }}>No new quizzes available right now. Check back soon for more!</p>
            </Card>
        );
    }

    // Pagination
    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const paginatedQuizzes = availableQuizzes.slice(indexOfFirst, indexOfLast);

    return (
        <div className="flex flex-col">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-10 mt-12">
                {paginatedQuizzes.map((quiz) => {
                    const hasAttempted = attempts.some(a => a.topicId?._id === quiz._id);
                    return (
                        <Card
                            key={quiz._id}
                            className={`transition-all duration-500 border-slate-200 rounded-[2.5rem] flex flex-col h-full ${hasAttempted ? 'opacity-70' : ''}`}
                            style={{ padding: 30, background: 'white', margin: '1rem', boxShadow: '0 4px 24px rgba(0,0,0,0.10), 0 1.5px 6px rgba(0,0,0,0.06)' }}
                        >
                            <div className="flex justify-between items-start mb-8">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border transition-all duration-700 ${hasAttempted ? 'bg-slate-100 border-slate-200' : 'bg-primary/10 border-primary/20'}`} style={{ marginBottom: 30, color: hasAttempted ? '#64748b' : 'var(--primary)' }}>
                                    {hasAttempted ? <FaCheckCircle /> : <FaPlus />}
                                </div>
                                {hasAttempted && (
                                    <div className="px-3 py-1.5 rounded-lg" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                                        <span className="font-black uppercase tracking-widest text-[10px]" style={{ color: '#ef4444' }}>
                                            Attempted Already
                                        </span>
                                    </div>
                                )}
                            </div>
                            <h3 className="text-2xl font-black mb-3 transition-colors" style={{ color: '#000' }}>
                                {quiz.name}
                            </h3>
                            <p className="text-lg mb-10 line-clamp-2 leading-relaxed flex-1 font-medium" style={{ color: '#444' }}>{quiz.description}</p>
                        </Card>
                    );
                })}
            </div>

            {/* Pagination */}
            {availableQuizzes.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 1rem', padding: isMobile ? '1.5rem 1rem 2rem' : '1.5rem 1.5rem 2.5rem' }}>
                    <Pagination
                        currentPage={currentPage}
                        totalItems={availableQuizzes.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        isMobile={isMobile}
                    />
                </div>
            )}
        </div>
    );
}
