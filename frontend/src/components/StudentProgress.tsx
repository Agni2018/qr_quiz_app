'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Pagination from '@/components/Pagination';
import { FaCheckCircle, FaSearch, FaBolt } from 'react-icons/fa';
import { useSearch } from '@/contexts/SearchContext';

export default function StudentProgress({ titleComponent }: { titleComponent?: React.ReactNode }) {
    const [attempts, setAttempts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { searchTerm: searchQuery } = useSearch();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

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

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    if (attempts.length === 0) {
        return (
            <Card className="p-20 text-center border-dashed border-2 border-slate-200 bg-white rounded-[40px] mt-12" style={{ padding:30,marginTop:50,marginLeft:10,marginRight:10 }}>
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

    // Pagination
    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const paginatedAttempts = filteredAttempts.slice(indexOfFirst, indexOfLast);

    return (
        <div className="flex flex-col gap-10 md:gap-16">
            {/* SEARCH BAR & HEADER */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pl-4 pr-10 md:pr-14 w-full">
                {titleComponent && (
                    <div className="shrink-0">
                        {titleComponent}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pl-4 pr-10 md:pr-14" >
                {paginatedAttempts.map((attempt) => (
                <Card
                    key={attempt._id}
                    className="group hover:-translate-y-2 transition-all duration-500 border-slate-200 hover:bg-slate-50 rounded-[2.5rem] flex flex-col h-full"
                    style={{ padding: '16px 20px', margin: '0.4rem 0.5rem', background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)' }}
                >
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border border-primary/20 group-hover:scale-110 transition-transform" style={{color:'green', background:'rgba(0,128,0,0.08)'}}>
                            <FaCheckCircle />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest rounded-xl" style={{padding:'6px 12px', color:'#000', background:'#f1f5f9', border:'1px solid #e2e8f0'}}>
                            {new Date(attempt.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                    </div>
                    <div className="flex-1 flex flex-col gap-1.5">
                        <h3 className="text-xl font-black group-hover:text-primary transition-colors leading-tight" style={{ color: '#000', marginTop: 4 }}>
                            {attempt.topicId?.name}
                        </h3>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#222' }}>Global Rank</span>
                            <span className={`text-xl font-black ${attempt.rank <= 3 ? 'text-yellow-500' : 'text-red-500'}`}>
                                #{attempt.rank || '-'}
                            </span>
                        </div>
                        <p className="text-sm line-clamp-2 leading-relaxed font-medium" style={{ color: '#444' }}>{attempt.topicId?.description}</p>
                    </div>

                    <div className="flex flex-col gap-3" style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #e2e8f0', marginBottom: 2 }}>
                        <div 
                            className="flex flex-row items-center justify-between rounded-2xl gap-4"
                            style={{ 
                                background: '#fff', 
                                border: '1.5px solid #e2e8f0', 
                                boxShadow: '0 2px 12px rgba(0,0,0,0.08)', 
                                padding: '12px 20px',
                                marginTop: 2
                            }}
                        >
                            <div className="flex flex-col shrink-0">
                                <span className="text-[9px] font-black uppercase tracking-widest leading-none mb-1.5" style={{ color: '#555' }}>Performance</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-black" style={{ color: '#000' }}>{attempt.score} <span className="text-xs font-bold ml-1" style={{ color: '#777' }}>PTS</span></span>
                                    {attempt.topicId?.timeBasedScoring && (
                                        <FaBolt className="text-indigo-500" title="Time-based Scoring" size={14} />
                                    )}
                                </div>
                            </div>
                            {(() => {
                                const isPassed = attempt.pointsEarned > 0 || 
                                               (attempt.topicId && attempt.score > 0 && attempt.score >= (attempt.topicId.passingMarks || 0));
                                return (
                                    <div className="flex flex-col items-end text-right min-w-0">
                                        <span className="text-[9px] font-black uppercase tracking-widest leading-none mb-1.5" style={{ color: '#555' }}>Status</span>
                                        <span className={`text-sm font-black leading-tight ${isPassed ? 'text-green-500' : 'text-red-500'}`}>
                                            {isPassed ? `+${attempt.pointsEarned || 3} Points` : 'FAILED'}
                                        </span>
                                    </div>
                                );
                            })()}
                        </div>
                        <Link href={`/quiz/${attempt.topicId?._id}/result?attemptId=${attempt._id}`}>
                            <Button variant="secondary" className="w-full h-12 rounded-2xl font-black text-xs uppercase tracking-widest bg-primary hover:scale-[1.02] transition-all shadow-xl shadow-primary/20">
                                View Details
                            </Button>
                        </Link>
                    </div>
                </Card>
            ))}
            {filteredAttempts.length === 0 && (
                <div className="col-span-full py-20 text-center flex flex-col items-center gap-4" style={{ color: '#555' }}>
                    <p className="font-bold">No topics found matching "{searchQuery}"</p>
                </div>
            )}
            </div>

            {/* Pagination */}
            {filteredAttempts.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: isMobile ? '1rem 1rem 2rem' : '1rem 1.5rem 2.5rem' }}>
                    <Pagination
                        currentPage={currentPage}
                        totalItems={filteredAttempts.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        isMobile={isMobile}
                    />
                </div>
            )}
        </div>
    );
}
