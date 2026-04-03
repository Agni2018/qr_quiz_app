'use client';

import { useState, useEffect, use } from 'react';
import api from '@/lib/api';
import QRCode from 'react-qr-code';
import Card from '@/components/Card';
import Button from '@/components/Button';
import QuestionForm from '@/components/QuestionForm';
import UploadMaterialModal from '@/components/UploadMaterialModal';
import Link from 'next/link';
import AlertModal from '@/components/AlertModal';
import Pagination from '@/components/Pagination';
import { FaChevronLeft, FaFolder, FaFileAlt, FaTimes } from 'react-icons/fa';

import { useRouter } from 'next/navigation';

export default function TopicDetails({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const ITEMS_PER_PAGE = 4;
    const [topic, setTopic] = useState<any>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);
    const [quizLink, setQuizLink] = useState('');
    const [alertModal, setAlertModal] = useState({ isOpen: false, message: '', type: 'info' as 'success' | 'error' | 'info' });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setQuizLink(`${window.location.origin}/quiz/${id}`);
        }
    }, [id]);

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
                <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">Verifying Session...</p>
            </div>
        );
    }

    if (!topic) return <div className="container min-h-screen flex items-center justify-center">Loading Data...</div>;



    return (
        <main className="container">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden z-10" style={{ marginBottom: '40px' }}>
                <div className="flex items-center gap-4 relative z-10 overflow-x-auto w-full no-scrollbar pb-1 sm:pb-0">
                    <Button 
                        variant="primary" 
                        onClick={() => router.push(topic?.categoryId ? `/users/manage-topics?category=${topic.categoryId._id}` : '/users/manage-topics')}
                        className="px-6 h-12 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-black flex items-center gap-2 shadow-xl shadow-indigo-500/10 border-none transition-all active:scale-95 shrink-0"
                        style={{ background: '#4f46e5', color: 'white' }}
                    >
                        <FaChevronLeft /> Back
                    </Button>
                    <div className="h-6 w-[1px] bg-slate-200 mx-1 sm:mx-2 shrink-0" />
                    <h3 className="text-xl sm:text-2xl font-black flex flex-nowrap sm:flex-wrap items-center gap-2 sm:gap-3 text-slate-900 tracking-tight whitespace-nowrap sm:whitespace-normal" style={{color:'#4f46e5'}}>
                        <Link href="/users/manage-topics" className="hover:text-indigo-600 transition-colors">Manage Topics</Link>
                        
                        {topic?.categoryId && (
                            <>
                                <span className="text-slate-300 mx-1">/</span>
                                <Link href={`/users/manage-topics?category=${topic.categoryId._id}`} className="flex items-center gap-2 hover:text-indigo-600 transition-colors">
                                    <span className="text-indigo-500" style={{color:'#4f46e5'}}><FaFolder /></span>
                                    {topic.categoryId.name}
                                </Link>
                            </>
                        )}
                        
                        <span className="text-slate-300 mx-1">/</span>
                        <span className="flex items-center gap-2 text-slate-700" style={{color: '#333'}}>
                            {topic?.name}
                        </span>
                    </h3>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">

                {/* Left Column: Questions */}
                <div>
                    {/* Wrap header + form + questions in single flex-col with gap */}
                    <div className="flex flex-col gap-12">

                        {/* Header + Add Button */}
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">
                            <h2 className="text-3xl font-bold" style={{color:'#4f46e5'}}>Questions ({questions.length})</h2>
                            <Button onClick={() => setShowAddForm(true)} disabled={showAddForm}>Add Question</Button>
                        </div>

                        {/* Question Form */}
                        {showAddForm && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-6 overflow-hidden">
                                <div className="relative w-[calc(100%-2rem)] sm:w-full max-w-4xl max-h-[95vh] overflow-y-auto rounded-[32px] shadow-2xl mx-auto">
                                    <button 
                                        onClick={() => setShowAddForm(false)}
                                        className="absolute top-6 right-6 z-[110] text-slate-400 hover:text-black hover:bg-slate-100 p-2 rounded-full transition-colors bg-white/50 backdrop-blur-md border-none cursor-pointer"
                                    >
                                        <FaTimes size={24} />
                                    </button>
                                    <QuestionForm
                                        topicId={id}
                                        onQuestionAdded={() => { 
                                            setShowAddForm(false); 
                                            fetchData(); 
                                            setAlertModal({ isOpen: true, message: 'Question created successfully!', type: 'success' });
                                        }}
                                        onCancel={() => setShowAddForm(false)}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Questions List */}
                        <div className="bg-white border border-slate-200 rounded-2xl flex flex-col gap-4 lg:mr-4" style={{ paddingInline: 20, paddingBlock: 12 }}>
                            {questions.length === 0 ? (
                                <p className="text-slate-400 text-sm">No questions created yet.</p>
                            ) : (
                                <>
                                    {questions
                                        .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                                        .map((q, i) => (
                                            <Card key={q._id} className="p-6 border border-slate-200 hover:border-slate-300 transition-all flex flex-col gap-2" style={{ background: 'white', paddingInline: 12, paddingBlock: 8 }}>
                                                <div className="flex justify-between items-start gap-3">
                                                    <h4 className="text-base sm:text-lg font-bold text-black" style={{ color: '#000' }}>Q{(currentPage - 1) * ITEMS_PER_PAGE + i + 1}. {q.content.text}</h4>
                                                    <span className="text-[0.65rem] font-black uppercase tracking-[0.2em] bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-100 shrink-0">{q.marks} Marks</span>
                                                </div>
                                                <div className="flex flex-wrap gap-3 sm:gap-4">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-[0.55rem] font-black uppercase tracking-widest text-slate-500">Type</span>
                                                        <span className="text-xs font-medium text-slate-700 capitalize">{q.type.replace('_', ' ')}</span>
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-[0.55rem] font-black uppercase tracking-widest text-slate-500">Answer</span>
                                                        <span className="text-xs font-medium text-emerald-600">{String(q.correctAnswer)}</span>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))
                                    }
                                </>
                            )}

                            {/* Pagination — shown regardless of the number of questions */}
                            <div className="flex justify-center sm:justify-start mt-4">
                                <Pagination
                                    currentPage={currentPage}
                                    totalItems={questions.length}
                                    itemsPerPage={ITEMS_PER_PAGE}
                                    onPageChange={(page) => {
                                        setCurrentPage(page);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    isMobile={false}
                                    style={{ width: '100%', maxWidth: '100%', minWidth: 0 }}
                                />
                            </div>
                        </div>

                    </div>
                </div>

                {/* Right Column: QR & Info */}
                <div className="flex flex-col gap-3" >
                    <Card className="flex flex-col items-center text-center p-9 border border-slate-200" style={{ paddingInline: 30, paddingBlock: 20, background: 'white' }}>
                        <h3 className="text-lg font-bold mb-3 text-black" style={{ color: '#000' }}>Share Quiz</h3>
                        {questions.length === 0 ? (
                            <p className="text-slate-500 text-sm">Create questions to receive the quiz link and QR code.</p>
                        ) : (
                            <>
                                <div className="bg-white p-4 rounded-2xl border border-slate-100 mb-3">
                                    <QRCode value={quizLink} size={140} />
                                </div>
                                <div className="w-full flex flex-col gap-2">
                                    <p className="text-[0.65rem] text-slate-500 font-bold uppercase tracking-wider"style={{color:'black'}}>Direct Link</p>
                                    <div className="bg-slate-50 p-3 rounded-xl break-all text-[0.8rem] text-emerald-600 font-mono border border-slate-200" style={{padding:8}}>
                                        <a href={quizLink} target="_blank" className="hover:underline" style={{padding:10}}>{quizLink}</a>
                                    </div>
                                </div>
                            </>
                        )}
                    </Card>

                    <Card className="flex flex-col gap-3 p-9 border border-slate-200" style={{ paddingInline: 30, paddingBlock: 20, background: 'white' }}>
                        <h3 className="text-lg font-bold mb-1 text-black" style={{ color: '#000' }}>Quiz Settings</h3>

                        <div className="flex items-center justify-between py-1 border-b border-slate-200">
                            <span className="text-sm font-medium text-slate-600">Topic Status</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" checked={topic.status === 'active'} onChange={handleToggleStatus} />
                                <div className="w-11 h-6 bg-red-500/30 peer-checked:bg-emerald-500/30 rounded-full peer peer-focus:ring-2 peer-focus:ring-purple-400 transition-colors"></div>
                                <span className={`absolute left-1 top-1 w-4 h-4 bg-red-500 peer-checked:bg-emerald-500 rounded-full transition-transform peer-checked:translate-x-5`}></span>
                            </label>
                        </div>

                        <div className="flex flex-col gap-2 mt-1">
                            <Link href={`/users/leaderboard/${id}`} className="w-full">
                                <Button variant="primary" className="w-full py-3 text-sm rounded-xl border-2 border-white/5 font-bold">View Leaderboard</Button>
                            </Link>
                        </div>
                    </Card>

                    <Card className="flex flex-col gap-3 p-9 relative overflow-hidden group border border-slate-200" style={{ paddingInline: 30, paddingBlock: 20, background: 'white' }}>
                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-2xl rounded-full translate-x-8 -translate-y-8 group-hover:bg-indigo-500/10 transition-colors" />
                        <h3 className="text-lg font-bold mb-1 text-black" style={{ color: '#000' }}>Study Materials</h3>
                        <p className="text-slate-500 text-xs leading-relaxed" style={{ color: '#000' }}>
                            Upload PDFs, videos, or documents to help students prepare for this quiz.
                        </p>
                        <Button
                            onClick={() => setShowUploadModal(true)}
                            className="w-full py-3 text-sm rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 font-bold flex items-center justify-center gap-2"
                        >
                            <span className="text-lg">📤</span> Upload Materials
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
                        setAlertModal({ isOpen: true, message: 'Material uploaded successfully!', type: 'success' });
                    }}
                />
            )}

            <AlertModal
                isOpen={alertModal.isOpen}
                onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
                message={alertModal.message}
                type={alertModal.type}
            />
        </main>

    );
}
