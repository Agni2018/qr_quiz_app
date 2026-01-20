'use client';

import { useState, useEffect, use } from 'react';
import api from '@/lib/api';
import QRCode from 'react-qr-code';
import Card from '@/components/Card';
import Button from '@/components/Button';
import QuestionForm from '@/components/QuestionForm';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function TopicDetails({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [topic, setTopic] = useState<any>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                await api.get('/auth/status');
            } catch (err) {
                // Interceptor will handle redirect
            }
        };

        checkAuth();
        fetchData();

        window.addEventListener('focus', checkAuth);
        return () => window.removeEventListener('focus', checkAuth);
    }, []);

    const fetchData = async () => {
        try {
            const [topicRes, qRes] = await Promise.all([
                api.get(`/topics/${id}`),
                api.get(`/questions/topic/${id}`)
            ]);
            setTopic(topicRes.data);
            setQuestions(qRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleToggleStatus = async () => {
        const newStatus = topic.status === 'active' ? 'inactive' : 'active';
        try {
            await api.put(`/topics/${id}`, { status: newStatus });
            fetchData();
        } catch (err) {
            console.error('Failed to update status', err);
        }
    };

    if (!topic) return <div className="container">Loading...</div>;

    const quizLink = `http://localhost:3000/quiz/${id}`;

    return (
        <main className="container">
            <div className="mb-12">
                <Link href="/users" className="text-slate-500 hover:text-violet-400 text-sm flex items-center gap-2 transition-colors mb-6">
                    &larr; Back to Dashboard
                </Link>
                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
                    {topic.name}
                </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">

                {/* Left Column: Questions */}
                <div>
                    <div className="flex justify-between items-center mb-16">
                        <h2 className="text-3xl font-bold">Questions ({questions.length})</h2>
                        <Button onClick={() => setShowAddForm(true)} disabled={showAddForm}>Add Question</Button>
                    </div>

                    {showAddForm && (
                        <div className="mb-20">
                            <QuestionForm
                                topicId={id}
                                onQuestionAdded={() => { setShowAddForm(false); fetchData(); }}
                                onCancel={() => setShowAddForm(false)}
                            />
                        </div>
                    )}

                    <div className="flex flex-col gap-8 mt-16">
                        {questions.map((q, i) => (
                            <Card key={q._id} className="p-6 border border-white/5 hover:border-violet-500/20 transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <h4 className="text-xl font-bold text-white/90">Q{i + 1}. {q.content.text}</h4>
                                    <span className="text-[0.65rem] font-black uppercase tracking-[0.2em] bg-violet-500/10 text-violet-400 px-3 py-1 rounded-full">{q.marks} Marks</span>
                                </div>
                                <div className="flex gap-6">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[0.6rem] font-black uppercase tracking-widest text-slate-500">Type</span>
                                        <span className="text-sm font-medium text-slate-300 capitalize">{q.type.replace('_', ' ')}</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[0.6rem] font-black uppercase tracking-widest text-slate-500">Answer</span>
                                        <span className="text-sm font-medium text-emerald-400/80">{String(q.correctAnswer)}</span>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Right Column: QR & Info */}
                <div className="flex flex-col gap-10">
                    <Card className="flex flex-col items-center text-center p-8">
                        <h3 className="text-xl font-bold mb-6">Share Quiz</h3>
                        <div className="bg-white p-6 rounded-2xl shadow-inner mb-6">
                            <QRCode value={quizLink} size={160} />
                        </div>
                        <div className="w-full flex flex-col gap-3">
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Direct Link</p>
                            <div className="bg-black/20 p-4 rounded-xl break-all text-[0.85rem] text-violet-300 font-mono border border-white/5">
                                <a href={quizLink} target="_blank" className="hover:underline">{quizLink}</a>
                            </div>
                        </div>
                    </Card>

                    <Card className="flex flex-col gap-6 p-8">
                        <h3 className="text-xl font-bold mb-2">Quiz Settings</h3>
                        <div className="flex flex-col gap-4">
                            <div className="flex justify-between items-center py-3 border-b border-white/5">
                                <span className="text-slate-400 font-medium">Topic Status</span>
                                <span className={`font-black uppercase tracking-widest px-4 py-1.5 rounded-full text-[0.65rem] border ${topic.status === 'active'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                                    }`}>{topic.status}</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 mt-4">
                            <Button
                                variant="secondary"
                                className={`w-full py-4 rounded-2xl border-2 font-bold transition-all ${topic.status === 'active'
                                    ? 'border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white'
                                    : 'border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white'
                                    }`}
                                onClick={handleToggleStatus}
                            >
                                {topic.status === 'active' ? 'Inactivate Quiz' : 'Activate Quiz'}
                            </Button>

                            <Link href={`/users/leaderboard/${id}`} className="w-full">
                                <Button variant="secondary" className="w-full py-4 rounded-2xl border-2 border-white/5 font-bold">View Leaderboard</Button>
                            </Link>
                        </div>
                    </Card>
                </div>

            </div>
        </main>
    );
}
