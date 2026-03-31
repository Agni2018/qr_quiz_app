'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import Card from '@/components/Card';
import Pagination from '@/components/Pagination';
import { FaPlus, FaCheckCircle, FaRocket, FaClock, FaMinusCircle, FaStar, FaBolt } from 'react-icons/fa';
import AlertModal from '@/components/AlertModal';
import ConfirmModal from '@/components/ConfirmModal';
import Button from '@/components/Button';
import { useSearch } from '@/contexts/SearchContext';

export default function StudentExplore() {
    const [availableQuizzes, setAvailableQuizzes] = useState<any[]>([]);
    const [attempts, setAttempts] = useState<any[]>([]);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { searchTerm: searchQuery } = useSearch();
    const [currentPage, setCurrentPage] = useState(1);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
    const [alertMessage, setAlertMessage] = useState('');
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

    // Filtering
    const filteredQuizzes = availableQuizzes.filter(quiz => 
        quiz.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        quiz.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Pagination
    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const paginatedQuizzes = filteredQuizzes.slice(indexOfFirst, indexOfLast);

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
                                {hasAttempted ? (
                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border bg-slate-100 border-slate-200" style={{ marginBottom: 30, color: '#64748b' }}>
                                        <FaCheckCircle />
                                    </div>
                                ) : (
                                    <Button
                                        onClick={() => {
                                            if (quiz.questionCount === 0) {
                                                setAlertMessage("questions haven't been created");
                                                setIsAlertOpen(true);
                                            } else {
                                                setSelectedQuizId(quiz._id);
                                                setIsConfirmOpen(true);
                                            }
                                        }}
                                        className="h-14 px-6 rounded-2xl flex items-center gap-3 text-lg font-black group/btn transition-all duration-300"
                                        style={{
                                            background: 'var(--primary)',
                                            boxShadow: '0 8px 20px -6px var(--primary)',
                                            marginBottom: 30
                                        }}
                                    >
                                        <FaRocket className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                                        <span>Attempt</span>
                                    </Button>
                                )}
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
                            <p className="text-lg mb-6 line-clamp-2 leading-relaxed font-medium" style={{ color: '#444' }}>{quiz.description}</p>
                            
                            {/* Stats Section */}
                            <div className="flex flex-wrap gap-4 mb-8">
                                <div className="flex items-center gap-2 text-sm font-bold text-black" style={{ color: '#111' }}>
                                    <FaClock className="text-orange-500" /> {quiz.timeLimit}S
                                </div>
                                <div className="flex items-center gap-2 text-sm font-bold text-black" style={{ color: '#111' }}>
                                    <FaMinusCircle className="text-red-400" /> {quiz.negativeMarking} NEG
                                </div>
                                <div className="flex items-center gap-2 text-sm font-bold text-black" style={{ color: '#111' }}>
                                    <FaStar className="text-yellow-400" /> {quiz.passingMarks} PASS
                                </div>
                                {quiz.timeBasedScoring && (
                                    <div className="flex items-center gap-2 text-sm font-bold text-black" style={{ color: '#111' }}>
                                        <FaBolt className="text-orange-500" /> TS-ENABLED
                                    </div>
                                )}
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Pagination */}
            {filteredQuizzes.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 1rem', padding: isMobile ? '1.5rem 1rem 2rem' : '1.5rem 1.5rem 2.5rem' }}>
                    <Pagination
                        currentPage={currentPage}
                        totalItems={filteredQuizzes.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        isMobile={isMobile}
                    />
                </div>
            )}
            
            {filteredQuizzes.length === 0 && (
                <div className="col-span-full py-20 text-center flex flex-col items-center gap-4" style={{ color: '#555' }}>
                    <p className="font-bold text-xl">No quizzes found matching "{searchQuery}"</p>
                </div>
            )}

            <AlertModal
                isOpen={isAlertOpen}
                onClose={() => setIsAlertOpen(false)}
                title="Quiz Not Ready"
                message={alertMessage}
                type="info"
            />

            <ConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={() => {
                    if (selectedQuizId) {
                        router.push(`/quiz/${selectedQuizId}?direct=true`);
                    }
                }}
                title="Start Quiz"
                message="Are you sure you want to attempt this quiz?"
                confirmText="Yes, Start"
                cancelText="Not Now"
            />
        </div>
    );
}
