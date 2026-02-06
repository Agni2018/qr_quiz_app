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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {questions.length === 0 ? (
                    <Card className="col-span-full p-20 border-dashed border-white/10 flex flex-col items-center justify-center text-center opacity-50">
                        <FaRegClone className="text-6xl mb-6 text-slate-700" />
                        <h4 className="text-xl font-bold mb-2">Library is Empty</h4>
                        <p className="text-slate-500 max-w-xs">Start building your question bank to save time when creating new topics.</p>
                    </Card>
                ) : (
                    questions.map(q => (
                        <Card key={q._id} className="p-8 border-white/5 bg-slate-900/40 relative overflow-hidden group">
                            {/* Accent line */}
                            <div className="absolute top-0 left-0 w-1 h-full bg-primary/20" />

                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="px-3 py-1 rounded-lg bg-primary text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                                        {q.type.replace('_', ' ')}
                                    </div>
                                    <div className="px-3 py-1 rounded-lg bg-white/5 text-slate-400 text-[10px] font-black uppercase tracking-widest border border-white/5">
                                        {q.marks} pts
                                    </div>
                                </div>
                                <button onClick={() => deleteQuestion(q._id)} className="text-slate-500 hover:text-red-500 transition-colors p-2">
                                    <FaTrash size={14} />
                                </button>
                            </div>

                            <p className="text-lg font-medium text-slate-200 mb-6 leading-relaxed">
                                {q.content?.text}
                            </p>

                            <div className="flex flex-wrap gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                {Array.isArray(q.options) && q.options.length > 0 && (
                                    <span>{q.options.length} Options</span>
                                )}
                                <span>•</span>
                                <span>Shared Library</span>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
