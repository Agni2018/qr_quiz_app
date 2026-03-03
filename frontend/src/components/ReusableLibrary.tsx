'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Card from './Card';
import Button from './Button';
import { FaTrash, FaPlus, FaPuzzlePiece, FaCheckDouble, FaEdit, FaRegClone } from 'react-icons/fa';
import QuestionForm from './QuestionForm';

export default function ReusableLibrary() {
    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

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

    const deleteQuestion = async (id: string) => {
        if (!confirm('Are you sure? This will remove it from the library.')) return;
        try {
            await api.delete(`/questions/${id}`);
            fetchQuestions();
        } catch (err) {
            alert('Failed to delete question');
        }
    };

    if (loading) return <div>Loading question bank...</div>;

    return (
        <div className="flex flex-col gap-10">
            <div className="flex justify-between items-center">
                <div className="flex flex-col gap-1">
                    <h3 className="text-2xl font-black">Global Question Bank</h3>
                    <p className="text-slate-500 text-sm">Reusable questions that can be imported into any topic.</p>
                </div>
                <Button onClick={() => setShowForm(true)}>
                    <FaPlus className="mr-2" /> New Bank Question
                </Button>
            </div>

            {showForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-black/80 backdrop-blur-md">
                    <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar rounded-[32px] shadow-2xl">
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
                        <Card key={q._id} className="group hover:-translate-y-2 transition-all duration-300 border-white/5 bg-slate-950/40 hover:bg-slate-900/60 rounded-[2rem] flex flex-col shadow-xl overflow-hidden relative" style={{ padding: '2.5rem' }}>
                            {/* Accent line */}
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/30" />

                            <div className="flex flex-col gap-10 flex-1">
                                <div className="flex justify-between items-start relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="px-4 py-2 rounded-lg bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                                            {q.type.replace('_', ' ')}
                                        </div>
                                        <div className="px-4 py-2 rounded-lg bg-white/5 text-slate-400 text-[10px] font-black uppercase tracking-widest border border-white/10">
                                            {q.marks} pts
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => deleteQuestion(q._id)}
                                        className="text-slate-600 hover:text-red-500 hover:bg-red-500/10 transition-all p-3 rounded-xl -mr-2 -mt-2"
                                        title="Delete from library"
                                    >
                                        <FaTrash size={16} />
                                    </button>
                                </div>

                                <div className="flex-1 relative z-10">
                                    <p className="text-xl font-bold text-white leading-relaxed">
                                        {q.content?.text}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3 text-xs font-black text-slate-600 uppercase tracking-widest mt-auto relative z-10 opacity-60">
                                    {Array.isArray(q.options) && q.options.length > 0 && (
                                        <>
                                            <span>{q.options.length} Options</span>
                                            <span className="text-slate-800">•</span>
                                        </>
                                    )}
                                    <span>Global Library</span>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
