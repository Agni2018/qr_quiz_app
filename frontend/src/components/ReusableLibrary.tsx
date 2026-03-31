'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Card from './Card';
import Button from './Button';
import { FaTrash, FaPlus, FaRegClone, FaGlobe } from 'react-icons/fa';
import QuestionForm from './QuestionForm';
import AlertModal from '@/components/AlertModal';
import ConfirmModal from '@/components/ConfirmModal';
import Pagination from './Pagination';
import { useSearch } from '@/contexts/SearchContext';

const ITEMS_PER_PAGE = 9;

export default function ReusableLibrary() {
    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const { searchTerm } = useSearch();
    const [alertModal, setAlertModal] = useState({ isOpen: false, message: '', type: 'info' as 'success' | 'error' | 'info' });
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, message: '', isDanger: false, onConfirm: () => {} });

    const fetchQuestions = async () => {
        try {
            const res = await api.get('/questions/reusable');
            setQuestions(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, questions.length]);

    const deleteQuestion = (id: string) => {
        setConfirmModal({
            isOpen: true,
            isDanger: true,
            message: 'Are you sure? This will remove it from the library.',
            onConfirm: async () => {
                try {
                    await api.delete(`/questions/${id}`);
                    fetchQuestions();
                    setAlertModal({ isOpen: true, message: 'Question deleted from library successfully', type: 'success' });
                } catch (err) {
                    setAlertModal({ isOpen: true, message: 'Failed to delete question', type: 'error' });
                }
            }
        });
    };

    const filteredQuestions = questions.filter(q => 
        q.content?.text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.type?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-slate-100 border-t-orange-500 rounded-full animate-spin" />
        </div>
    );

    const totalItems = filteredQuestions.length;
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedQuestions = filteredQuestions.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return (
        <div className="flex flex-col gap-10">
            <div className="flex flex-col lg:flex-row justify-between items-end gap-6">
                <div className="flex flex-col gap-1">
                    <span className="text-[12px] font-bold text-orange-500 uppercase tracking-[0.2em] mb-2">Global Repository</span>
                    <h3 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase shrink-0">Question Bank</h3>
                    <p className="text-sm font-bold text-orange-400 mt-2" style={{color:'darkorange'}} >Reusable questions that can be imported into any topic.</p>
                </div>
                <Button 
                    onClick={() => setShowForm(true)}
                    className="h-14 px-8 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
                    style={{ background: '#f97316' }}
                >
                    <FaPlus className="mr-2" /> New Bank Question
                </Button>
            </div>

            {showForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar rounded-[2.5rem] shadow-2xl bg-white">
                        <QuestionForm
                            topicId={undefined}
                            onQuestionAdded={() => {
                                setShowForm(false);
                                fetchQuestions();
                                setAlertModal({ isOpen: true, message: 'Question created in library successfully!', type: 'success' });
                            }}
                            onCancel={() => setShowForm(false)}
                        />
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {paginatedQuestions.length === 0 ? (
                    <div className="col-span-full py-24 text-center bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200 flex flex-col items-center justify-center">
                        <FaRegClone className="text-6xl mb-6 text-slate-200" />
                        <h4 className="text-xl font-black text-slate-400 uppercase tracking-tight">No Questions Found</h4>
                        <p className="text-slate-400 font-bold text-sm mt-2 max-w-xs">{searchTerm ? `No results for "${searchTerm}"` : 'Start building your question bank to save time.'}</p>
                    </div>
                ) : (
                    paginatedQuestions.map(q => (
                        <div
                            key={q._id}
                            className="group hover:shadow-2xl transition-all duration-300 rounded-[2.5rem] flex flex-col bg-white border border-slate-100 relative overflow-hidden"
                            style={{ padding: '30px', minHeight: (typeof window !== 'undefined' && window.innerWidth < 768) ? 'auto' : '320px', marginTop: '10px', marginBottom: '10px' }}
                        >
                            {/* Accent line */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-orange-500/10 group-hover:bg-orange-500 transition-colors" />

                            <div className="flex flex-col h-full">
                                <div className="flex justify-between items-start gap-4 mb-6">
                                    <div className="flex flex-col gap-1.5">
                                        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-orange-50 rounded text-orange-500 w-fit" >
                                            {q.type.replace('_', ' ')}
                                        </span>
                                        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400" style={{color:'black'}}>
                                            {q.marks} PTS{Array.isArray(q.options) && q.options.length > 0 ? ` • ${q.options.length} OPTIONS` : ''}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => deleteQuestion(q._id)}
                                        className="text-slate-300 hover:text-red-500 transition-all p-2 rounded-xl"
                                        title="Delete from library"
                                        style={{color:'red'}}
                                    >
                                        <FaTrash size={14} />
                                    </button>
                                </div>

                                <div className="flex-1 mb-8">
                                    <p className="text-xl font-black text-slate-900 leading-tight uppercase tracking-tight" style={{color:'black',marginTop:40}}>
                                        {q.content?.text}
                                    </p>
                                </div>

                                <div className="mt-auto pt-6 border-t border-slate-50 flex justify-between items-center">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300"style={{color:'green'}}>Global Library</span>
                                    <FaGlobe className="text-orange-500 opacity-30 group-hover:opacity-100 transition-opacity" size={16} style={{color:'darkgreen'}} />
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {totalItems > ITEMS_PER_PAGE && (
                <div className="flex justify-center mt-10">
                    <Pagination
                        currentPage={currentPage}
                        totalItems={totalItems}
                        itemsPerPage={ITEMS_PER_PAGE}
                        onPageChange={setCurrentPage}
                    />
                </div>
            )}

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmModal.onConfirm}
                message={confirmModal.message}
                isDanger={confirmModal.isDanger}
            />
            <AlertModal
                isOpen={alertModal.isOpen}
                onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
                message={alertModal.message}
                type={alertModal.type}
            />
        </div>
    );
}
