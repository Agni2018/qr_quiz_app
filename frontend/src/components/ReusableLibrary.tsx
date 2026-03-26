'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Card from './Card';
import Button from './Button';
import { FaTrash, FaPlus, FaPuzzlePiece, FaCheckDouble, FaEdit, FaRegClone, FaGlobe } from 'react-icons/fa';
import QuestionForm from './QuestionForm';
import AlertModal from '@/components/AlertModal';
import ConfirmModal from '@/components/ConfirmModal';

export default function ReusableLibrary() {
    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [alertModal, setAlertModal] = useState({ isOpen: false, message: '', type: 'info' as 'success' | 'error' | 'info' });
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, message: '', onConfirm: () => {} });

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

    const deleteQuestion = (id: string) => {
        setConfirmModal({
            isOpen: true,
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

    if (loading) return <div>Loading question bank...</div>;

    return (
        <div className="flex flex-col gap-10">
            <div className="flex justify-between items-center">
                <div className="flex flex-col gap-1">
                    <h3 className="text-2xl font-black" style={{ margin: '0 1rem 1rem 1rem' }}>Global Question Bank</h3>
                    <p className="text-slate-500 text-sm" style={{ margin: '0 1rem 1rem 1rem' }}>Reusable questions that can be imported into any topic.</p>
                </div>
                <Button onClick={() => setShowForm(true)} style={{ margin: '0 1rem 1rem 1rem' }}>
                    <FaPlus className="mr-2" /> New Bank Question
                </Button>
            </div>

            {showForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-black/80 backdrop-blur-md">
                    <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar rounded-[32px] shadow-2xl" style={{margin:'1rem 1rem 1rem 1rem'}}>
                        <QuestionForm
                            topicId={undefined}
                            onQuestionAdded={() => { setShowForm(false); fetchQuestions(); }}
                            onCancel={() => setShowForm(false)}
                        />
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {questions.length === 0 ? (
                    <Card className="col-span-full p-20 border-dashed border-white/10 flex flex-col items-center justify-center text-center opacity-50">
                        <FaRegClone className="text-6xl mb-6 text-slate-700" />
                        <h4 className="text-xl font-bold mb-2">Library is Empty</h4>
                        <p className="text-slate-500 max-w-xs">Start building your question bank to save time when creating new topics.</p>
                    </Card>
                ) : (
                    questions.map(q => (
                        <Card key={q._id} className="group hover:-translate-y-2 transition-all duration-300 border-white/5 hover:border-white/10 rounded-[2rem] flex flex-col shadow-xl overflow-hidden relative" style={{ background: '#1a1f2e', padding: '2.5rem', margin: '0 1rem 1rem 1rem' }}>
                            {/* Accent line */}
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/30" />

                            <div className="flex flex-col gap-10 flex-1">
                                <div className="flex flex-col sm:flex-row justify-between items-start relative z-10 gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#00d26a]">
                                            {q.type.replace('_', ' ')}
                                        </span>
                                        <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-slate-500">
                                            {q.marks} PTS{Array.isArray(q.options) && q.options.length > 0 ? ` • ${q.options.length} OPTIONS` : ''}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => deleteQuestion(q._id)}
                                        className="text-slate-600 hover:text-red-500 hover:bg-red-500/10 transition-all p-2 rounded-xl -mr-3 -mt-3"
                                        title="Delete from library"
                                    >
                                        <FaTrash size={14} />
                                    </button>
                                </div>

                                <div className="flex-1 relative z-10">
                                    <p className="text-xl font-bold text-white leading-relaxed">
                                        {q.content?.text}
                                    </p>
                                </div>

                                <div className="flex justify-between items-center w-full mt-auto relative z-10 pt-5 border-t border-white/5" >
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500" style={{marginTop:10}}>GLOBAL LIBRARY</span>
                                    <FaGlobe className="text-[#00d26a] text-sm opacity-80"  style={{marginTop:10}}/>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmModal.onConfirm}
                message={confirmModal.message}
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
