'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Card from './Card';
import Button from './Button';
import { FaRegClone, FaSearch, FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface QuestionBankModalProps {
    onSelect: (question: any) => void;
    onClose: () => void;
}

export default function QuestionBankModal({ onSelect, onClose }: QuestionBankModalProps) {
    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const res = await api.get('/questions/reusable');
                setQuestions(res.data);
            } catch (err) {
                console.error('Failed to fetch reusable questions:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchQuestions();
    }, []);

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    const filteredQuestions = questions.filter(q =>
        q.content?.text?.toLowerCase().includes(search.toLowerCase()) ||
        q.type.toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedQuestions = filteredQuestions.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-12 bg-black/95 backdrop-blur-2xl">
            <div className="max-w-4xl w-full bg-[#1e293b] rounded-[40px] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="relative py-6 md:py-10 border-b border-white/5 flex items-center justify-center bg-black/5 shrink-0 overflow-visible">
                    <h3 className="text-2xl font-black text-white leading-normal">Question Bank</h3>
                    <button
                        onClick={onClose}
                        className="absolute right-4 md:right-12 p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white shrink-0"
                    >
                        <FaTimes size={18} />
                    </button>
                </div>

                {/* Explicit Header Spacer */}
                <div className="h-6 w-full shrink-0 bg-[#1e293b]" />

                {/* Search */}
                <div className="px-6 md:px-12 pb-6 md:pb-8 bg-black/10 border-b border-white/5 shrink-0">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search questions or types..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-black/30 border-2 border-white/5 rounded-2xl py-4 h-14 pl-6 pr-14 focus:border-violet-500/50 transition-all outline-none text-slate-200"
                        />
                        <FaSearch className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    </div>
                </div>

                {/* List Container - Scrollable */}
                <div className="flex-1 overflow-y-auto px-6 md:px-12 custom-scrollbar">
                    {/* Explicit Top Spacer */}
                    <div className="h-10 w-full shrink-0" />

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 md:py-24 gap-8">
                            <div className="w-14 h-14 border-[5px] border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
                            <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-sm">Accessing Bank...</p>
                        </div>
                    ) : filteredQuestions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 md:py-32 text-center opacity-50">
                            <FaRegClone className="text-8xl mb-10 text-slate-800" />
                            <h4 className="text-3xl font-bold mb-4">No Questions Found</h4>
                            <p className="text-slate-500 max-w-sm text-xl leading-relaxed">Try a different search term or add more questions to your bank.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-10">
                            {paginatedQuestions.map((q) => (
                                <div
                                    key={q._id}
                                    onClick={() => onSelect(q)}
                                    className="px-6 md:px-12 py-6 md:py-10 rounded-[24px] border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-violet-500/30 transition-all cursor-pointer group relative overflow-visible"
                                >
                                    <div className="flex justify-between items-center mb-6 pl-2 pr-4">
                                        <div className="flex-1">
                                            <div className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 text-violet-400 font-bold text-xs uppercase tracking-widest flex items-center gap-1.5 shrink-0">
                                                Import <FaSearch size={10} className="mt-0.5" />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 shrink-0">
                                            <div className="px-4 py-1.5 rounded-xl bg-violet-500/10 text-violet-400 text-xs font-black uppercase tracking-widest border border-violet-500/20">
                                                {q.type.replace('_', ' ')}
                                            </div>
                                            <div className="px-4 py-1.5 rounded-xl bg-white/5 text-slate-400 text-xs font-black uppercase tracking-widest border border-white/5">
                                                {q.marks} pts
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-lg font-medium text-slate-200 leading-relaxed">
                                        {q.content?.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                    {/* Explicit Bottom Spacer */}
                    <div className="h-10 w-full shrink-0" />
                </div>

                {/* Sticky Pagination Footer */}
                {!loading && filteredQuestions.length > 5 && (
                    <div className="px-10 md:px-16 h-28 md:h-36 bg-black/60 backdrop-blur-md border-t border-white/10 flex items-center justify-between shrink-0 overflow-visible">
                        <div className="flex-1 flex items-center pl-20 md:pl-32">
                            <div className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                                Page <span className="text-violet-400 ml-4 font-black text-base">{currentPage}</span> <span className="mx-4 text-white/5">|</span> <span className="text-slate-600">{totalPages}</span>
                            </div>
                        </div>
                        <div className="flex gap-4 md:gap-6">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                className="px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 hover:border-violet-500/50 transition-all disabled:opacity-10 disabled:cursor-not-allowed font-black uppercase tracking-[0.2em] text-[10px] md:text-[11px] flex items-center gap-2 md:gap-3 group"
                            >
                                <FaChevronLeft className="group-hover:-translate-x-1 transition-transform" /> Prev
                            </button>
                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                className="px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 hover:border-violet-500/50 transition-all disabled:opacity-10 disabled:cursor-not-allowed font-black uppercase tracking-[0.2em] text-[10px] md:text-[11px] flex items-center gap-2 md:gap-3 group"
                            >
                                Next <FaChevronRight className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
