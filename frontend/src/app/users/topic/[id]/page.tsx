'use client';

import { useState, useEffect, use } from 'react';
import api from '@/lib/api';
import QRCode from 'react-qr-code';
import Card from '@/components/Card';
import Button from '@/components/Button';
import QuestionForm from '@/components/QuestionForm';
import UploadMaterialModal from '@/components/UploadMaterialModal';
import Link from 'next/link';

import { useRouter } from 'next/navigation';

export default function TopicDetails({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [topic, setTopic] = useState<any>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);

    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                await api.get('/auth/status');
                setAuthLoading(false);
            } catch (err) {
                // Interceptor handles redirect
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

    if (authLoading) {
        return (
            <div className="container min-h-screen flex flex-col items-center justify-center gap-6">
                <div className="w-12 h-12 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
                <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">Verifying Session...</p>
            </div>
        );
    }

    if (!topic) return <div className="container min-h-screen flex items-center justify-center">Loading Data...</div>;

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
                    {/* Wrap header + form + questions in single flex-col with gap */}
                    <div className="flex flex-col gap-12">

                        {/* Header + Add Button */}
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">
                            <h2 className="text-3xl font-bold">Questions ({questions.length})</h2>
                            <Button onClick={() => setShowAddForm(true)} disabled={showAddForm}>Add Question</Button>
                        </div>

                        {/* Question Form */}
                        {showAddForm && (
                            <QuestionForm
                                topicId={id}
                                onQuestionAdded={() => { setShowAddForm(false); fetchData(); }}
                                onCancel={() => setShowAddForm(false)}
                            />
                        )}

                        {/* Questions List */}
                        {questions.length === 0 ? (
                            <p className="text-slate-400 text-sm">No questions created yet.</p>
                        ) : (
                            questions.map((q, i) => (
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
                            ))
                        )}

                    </div>
                </div>

                {/* Right Column: QR & Info */}
                <div className="flex flex-col gap-10">
                    <Card className="flex flex-col items-center text-center p-8">
                        <h3 className="text-xl font-bold mb-6">Share Quiz</h3>
                        {questions.length === 0 ? (
                            <p className="text-slate-400 text-sm">Create questions to receive the quiz link and QR code.</p>
                        ) : (
                            <>
                                <div className="bg-white p-6 rounded-2xl shadow-inner mb-6">
                                    <QRCode value={quizLink} size={160} />
                                </div>
                                <div className="w-full flex flex-col gap-3">
                                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Direct Link</p>
                                    <div className="bg-black/20 p-4 rounded-xl break-all text-[0.85rem] text-violet-300 font-mono border border-white/5">
                                        <a href={quizLink} target="_blank" className="hover:underline">{quizLink}</a>
                                    </div>
                                </div>
                            </>
                        )}
                    </Card>

                    <Card className="flex flex-col gap-6 p-8">
                        <h3 className="text-xl font-bold mb-2">Quiz Settings</h3>

                        <div className="flex items-center justify-between py-3 border-b border-white/5">
                            <span className="text-slate-400 font-medium">Topic Status</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" checked={topic.status === 'active'} onChange={handleToggleStatus} />
                                <div className="w-14 h-7 bg-red-500/30 peer-checked:bg-emerald-500/30 rounded-full peer peer-focus:ring-2 peer-focus:ring-purple-400 transition-colors"></div>
                                <span className={`absolute left-1 top-1 w-5 h-5 bg-red-500 peer-checked:bg-emerald-500 rounded-full transition-transform peer-checked:translate-x-7`}></span>
                            </label>
                        </div>

                        <div className="flex flex-col gap-4 mt-4">
                            <Link href={`/users/leaderboard/${id}`} className="w-full">
                                <Button variant="secondary" className="w-full py-4 rounded-2xl border-2 border-white/5 font-bold">View Leaderboard</Button>
                            </Link>
                        </div>
                    </Card>

                    <Card className="flex flex-col gap-6 p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-2xl rounded-full translate-x-8 -translate-y-8 group-hover:bg-primary/10 transition-colors" />
                        <h3 className="text-xl font-bold mb-2">Study Materials</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Upload PDFs, videos, or documents to help students prepare for this quiz.
                        </p>
                        <Button
                            onClick={() => setShowUploadModal(true)}
                            className="w-full py-4 rounded-2xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 font-bold flex items-center justify-center gap-2"
                        >
                            <span className="text-xl">📤</span> Upload Materials
                        </Button>
                    </Card>
                </div>

            </div>

            {showUploadModal && (
                <UploadMaterialModal
                    topicId={id}
                    topicName={topic.name}
                    onClose={() => setShowUploadModal(false)}
                    onSuccess={() => {
                        setShowUploadModal(false);
                        alert('Material uploaded successfully!');
                    }}
                />
            )}
        </main>

    );
}
