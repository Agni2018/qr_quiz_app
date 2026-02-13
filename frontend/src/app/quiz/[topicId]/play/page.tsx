'use client';

import { useState, useEffect, use, useMemo } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import Card from '@/components/Card';
import Button from '@/components/Button';
import TextArea from '@/components/TextArea';
import { motion, AnimatePresence } from 'framer-motion';
import { MdTimer, MdPersonOutline, MdChevronRight, MdChevronLeft, MdSend } from 'react-icons/md';
import { HiOutlineQuestionMarkCircle } from 'react-icons/hi';

export default function QuizPlay({ params }: { params: Promise<{ topicId: string }> }) {
    const { topicId } = use(params);
    const router = useRouter();
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [answers, setAnswers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [topic, setTopic] = useState<any>(null);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [startTime, setStartTime] = useState<number>(Date.now());
    const [isTimeOut, setIsTimeOut] = useState(false);
    const [duplicateDetected, setDuplicateDetected] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('quizUser');
        if (!storedUser) {
            router.push(`/quiz/${topicId}`);
            return;
        }
        setUser(JSON.parse(storedUser));

        Promise.all([
            api.get(`/questions/topic/${topicId}`),
            api.get(`/topics/${topicId}`)
        ]).then(([qRes, tRes]) => {
            setQuestions(qRes.data);
            setTopic(tRes.data);
            if (tRes.data.timeLimit > 0) {
                setTimeLeft(tRes.data.timeLimit);
            }
            setStartTime(Date.now());
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });

        const handlePopState = (e: PopStateEvent) => {
            window.history.pushState(null, '', window.location.href);
            alert('You cannot go back during the quiz!');
        };

        window.history.pushState(null, '', window.location.href);
        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [topicId, router]);

    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0 || submitting) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev !== null && prev <= 1) {
                    clearInterval(timer);
                    setIsTimeOut(true);
                    submitQuiz(true);
                    return 0;
                }
                return prev !== null ? prev - 1 : null;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, submitting]);

    const handleAnswer = (value: any) => {
        const newAnswers = [...answers];
        const currentQ = questions[currentQIndex];
        if (!currentQ) return;
        const existingIdx = newAnswers.findIndex(a => a.questionId === currentQ._id);
        if (existingIdx >= 0) {
            newAnswers[existingIdx].submittedAnswer = value;
        } else {
            newAnswers.push({ questionId: currentQ._id, submittedAnswer: value });
        }
        setAnswers(newAnswers);
    };

    const nextQuestion = () => {
        if (currentQIndex < questions.length - 1) {
            setCurrentQIndex(currentQIndex + 1);
        } else {
            submitQuiz();
        }
    };

    const submitQuiz = async (isAuto = false) => {
        if (submitting) return;

        if (!isAuto) {
            const confirmed = window.confirm('Are you sure you want to submit your assessment?');
            if (!confirmed) return;
        }

        setSubmitting(true);

        if (isAuto) {
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        const userId = localStorage.getItem('userId');
        const timeTaken = Math.floor((Date.now() - startTime) / 1000);

        try {
            const res = await api.post('/quiz/submit', {
                topicId: topicId,
                userId,
                user,
                answers,
                timeTaken
            });

            if (res.data.message && (res.data.message.includes('already attempted') || res.data.message.includes('duplicate'))) {
                setDuplicateDetected(true);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            router.replace(`/quiz/${topicId}/result?attemptId=${res.data.attemptId || ''}`);
        } catch (err: any) {
            console.error(err);
            if (err.response?.data?.message?.includes('already attempted')) {
                setDuplicateDetected(true);
                await new Promise(resolve => setTimeout(resolve, 2000));
                router.replace(`/quiz/${topicId}`);
                return;
            }
            if (!isAuto) {
                alert('Submission failed! Please try again.');
                setSubmitting(false);
            }
        }
    };

    const shuffleArray = (array: any[]) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    const currentQ = questions[currentQIndex];

    const shuffledMatchOptions = useMemo(() => {
        if (currentQ?.type === 'match' && currentQ?.options) {
            return shuffleArray(currentQ.options.map((p: any) => p.right));
        }
        return [];
    }, [currentQ?._id, currentQ?.type]);

    const isAnswered = (qId: string) => {
        const ans = answers.find(a => a.questionId === qId)?.submittedAnswer;
        if (Array.isArray(ans)) return ans.length > 0;
        return ans !== undefined && ans !== null && ans !== '';
    };

    if (loading) return (
        <div className="min-h-screen bg-[#070514] flex items-center justify-center">
            <div className="flex flex-col items-center gap-6">
                <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin shadow-2xl shadow-violet-500/20" />
                <span className="text-violet-400 font-black uppercase tracking-[0.4em] text-[10px]">Initializing Assessment</span>
            </div>
        </div>
    );

    if (!questions.length) return <div className="container p-12 text-center text-slate-400 font-bold">No questions found for this topic.</div>;

    const currentAnswer = answers.find(a => a.questionId === currentQ?._id)?.submittedAnswer;

    return (
        <main className="min-h-screen bg-[#070514] text-slate-200 font-sans selection:bg-violet-500/30">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 h-24 bg-[#120f26]/90 backdrop-blur-xl border-b border-white/5 z-[100] px-6 md:px-12 flex items-center justify-between">
                <div className="flex items-center gap-5 h-full">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-violet-500/30 ring-1 ring-white/10 shrink-0">
                        <HiOutlineQuestionMarkCircle className="text-3xl text-white" />
                    </div>
                    <div className="h-10 w-[1px] bg-white/10 hidden sm:block mx-1" />
                    <div className="flex flex-col hidden sm:flex">
                        <h1 className="text-xl md:text-2xl font-black uppercase tracking-widest text-white leading-tight">Quizmaster Pro</h1>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">{topic?.category || 'General Knowledge'} Assessment</span>
                    </div>
                </div>

                {/* Timer In Header */}
                {timeLeft !== null && (
                    <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center top-[18px]">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2 opacity-80 whitespace-nowrap uppercase">Time Remaining</span>
                        <div className="flex items-center gap-3">
                            <MdTimer className={`text-2xl ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-emerald-400'}`} />
                            <span className={`text-3xl font-black tabular-nums tracking-widest leading-none ${timeLeft < 60 ? 'text-red-400' : 'text-white'}`}>
                                {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
                            </span>
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-4 bg-white/5 px-6 py-2.5 rounded-full border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                        <div className="w-8 h-8 rounded-full bg-slate-700/50 flex items-center justify-center ring-1 ring-white/10">
                            <MdPersonOutline className="text-xl text-slate-200" />
                        </div>
                        <span className="text-sm font-bold text-slate-100 hidden lg:inline tracking-wide">{user?.name || 'Student Name'}</span>
                    </button>
                </div>
            </header>

            <div className="pt-[220px] pb-12 px-6 md:px-12 max-w-[1700px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10" style={{ paddingTop: '220px' }}>

                {/* Main Content Area */}
                <div className="lg:col-span-8 flex flex-col gap-20">


                    {/* Question Card */}
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={currentQIndex}
                            initial={{ opacity: 0, scale: 0.99, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.99, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Card className="p-10 md:p-12 bg-[#1a1631]/80 backdrop-blur-sm border-white/5 rounded-[48px] shadow-3xl relative overflow-hidden flex flex-col min-h-[450px]">
                                <div className="flex items-start justify-between mb-8 relative z-10">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-violet-500 shadow-[0_0_5px_rgba(139,92,246,0.5)]" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Choose the Correct Answer</span>
                                        </div>
                                    </div>
                                    <div className="px-5 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">+{currentQ?.marks || 1}.0 Points</span>
                                    </div>
                                </div>

                                <h3 className="relative z-10 text-3xl font-black text-white leading-tight mb-[100px] tracking-tight" style={{ marginBottom: '100px' }}>
                                    {currentQ?.content.text}
                                </h3>

                                {/* Options Container: Tighten spacing to question */}
                                <div className="relative z-10 flex flex-col gap-4 mb-[100px]" style={{ marginBottom: '100px' }}>
                                    {(currentQ?.type === 'single_choice' || currentQ?.type === 'true_false' ? (currentQ.type === 'true_false' ? ['True', 'False'] : currentQ.options) : []).map((opt: string) => {
                                        const selected = currentAnswer === opt;
                                        return (
                                            <button
                                                key={opt}
                                                onClick={() => handleAnswer(opt)}
                                                className={`group relative p-6 rounded-[24px] text-left border-2 transition-all duration-300 flex items-center gap-6 ${selected
                                                    ? 'bg-violet-600/5 border-violet-500/40'
                                                    : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]'
                                                    }`}
                                            >
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${selected ? 'border-violet-500 bg-transparent' : 'border-slate-800'
                                                    }`}>
                                                    {selected && <div className="w-2.5 h-2.5 rounded-full bg-violet-500" />}
                                                </div>
                                                <span className={`text-xl font-bold transition-colors tracking-wide ${selected ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                                                    {opt}
                                                </span>
                                            </button>
                                        );
                                    })}

                                    {currentQ?.type === 'multi_select' && currentQ.options.map((opt: string) => {
                                        const selected = Array.isArray(currentAnswer) && currentAnswer.includes(opt);
                                        return (
                                            <button
                                                key={opt}
                                                onClick={() => {
                                                    const current = Array.isArray(currentAnswer) ? currentAnswer : [];
                                                    if (current.includes(opt)) {
                                                        handleAnswer(current.filter(a => a !== opt));
                                                    } else {
                                                        handleAnswer([...current, opt]);
                                                    }
                                                }}
                                                className={`group p-6 rounded-[24px] text-left border-2 transition-all duration-300 flex items-center gap-6 ${selected
                                                    ? 'bg-violet-600/5 border-violet-500/40'
                                                    : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]'
                                                    }`}
                                            >
                                                <div className={`w-6 h-6 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${selected ? 'border-violet-500 bg-violet-500' : 'border-slate-800'
                                                    }`}>
                                                    {selected && <span className="text-white text-xs font-black">✓</span>}
                                                </div>
                                                <span className={`text-xl font-bold transition-colors tracking-wide ${selected ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                                                    {opt}
                                                </span>
                                            </button>
                                        );
                                    })}

                                    {currentQ?.type === 'match' && (
                                        <div className="flex flex-col gap-4">
                                            {currentQ.options.map((pair: any, idx: number) => {
                                                const currentMatches = currentAnswer || [];
                                                const userMatch = currentMatches[idx];
                                                return (
                                                    <div key={idx} className="bg-white/5 border border-white/10 rounded-[24px] p-6 flex flex-col md:flex-row items-center gap-6">
                                                        <div className="flex-1 text-center md:text-left">
                                                            <span className="text-lg font-bold text-white tracking-wide">{pair.left}</span>
                                                        </div>
                                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                                                            <span className="text-slate-500 text-lg">↔</span>
                                                        </div>
                                                        <div className="flex-1 w-full">
                                                            <select
                                                                value={userMatch?.right || ''}
                                                                onChange={(e) => {
                                                                    const newMatches = [...(currentAnswer || [])];
                                                                    newMatches[idx] = { left: pair.left, right: e.target.value };
                                                                    handleAnswer(newMatches);
                                                                }}
                                                                className="w-full p-4 rounded-xl bg-[#0a0817] text-white border-2 border-white/10 focus:border-violet-500 transition-all cursor-pointer font-bold text-sm"
                                                            >
                                                                <option value="">Select match...</option>
                                                                {shuffledMatchOptions.map((rightValue: string, i: number) => (
                                                                    <option key={i} value={rightValue}>{rightValue}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {currentQ?.type === 'fill_blank' && (
                                        <TextArea
                                            value={currentAnswer || ''}
                                            onChange={(e) => handleAnswer(e.target.value)}
                                            placeholder="Type your response here..."
                                            className="!p-10 !px-12 !rounded-[2rem] bg-black/40 border-2 border-white/10 focus:!border-violet-500/50 outline-none transition-all !text-xl font-bold placeholder:text-slate-800 !min-h-[220px] shadow-inner"
                                            style={{ lineHeight: '1.8' }}
                                        />
                                    )}
                                </div>

                                {/* Integrated Navigation Buttons - Now INSIDE the question box at the bottom */}
                                <div className="mt-auto pt-32 border-t border-white/5 flex justify-between items-center relative z-10" style={{ paddingTop: '60px' }}>
                                    <button
                                        disabled={currentQIndex === 0}
                                        onClick={() => setCurrentQIndex(currentQIndex - 1)}
                                        className="group flex items-center gap-2 bg-white/5 border border-white/5 text-slate-500 px-8 py-4 rounded-2xl hover:border-white/20 hover:text-white transition-all disabled:opacity-30 disabled:pointer-events-none"
                                    >
                                        <MdChevronLeft className="text-xl group-hover:-translate-x-1 transition-transform" />
                                        <span className="font-black uppercase tracking-[0.2em] text-[10px]">Previous</span>
                                    </button>
                                    <button
                                        onClick={nextQuestion}
                                        className="group flex items-center gap-2 bg-violet-600 text-white px-10 py-4 rounded-2xl shadow-xl shadow-violet-600/20 hover:scale-105 active:scale-95 transition-all"
                                    >
                                        <span className="font-black uppercase tracking-[0.3em] text-[10px]">
                                            {currentQIndex === questions.length - 1 ? (submitting ? 'Submitting...' : 'Next Question') : 'Next Question'}
                                        </span>
                                        <MdChevronRight className="text-xl group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </Card>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Sidebar Palette Area */}
                <div className="lg:col-span-4 flex flex-col gap-14">
                    <Card className="p-8 bg-[#1a1631]/50 border-white/5 rounded-[48px] shadow-3xl flex flex-col min-h-[500px]">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h3 className="text-base font-black uppercase tracking-[0.4em] text-white leading-none mb-2">Question Palette</h3>
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Quick navigation grid</span>
                            </div>
                            <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{questions.length} Total</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 mb-10">
                            {questions.map((q, i) => {
                                const active = i === currentQIndex;
                                const answered = isAnswered(q._id);
                                return (
                                    <button
                                        key={q._id}
                                        onClick={() => setCurrentQIndex(i)}
                                        className={`aspect-square rounded-[14px] flex items-center justify-center text-lg font-black transition-all duration-300 border-2 ${active
                                            ? 'bg-transparent border-violet-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.2)]'
                                            : answered
                                                ? 'bg-emerald-500/90 text-white border-emerald-400'
                                                : 'bg-white/10 border-white/10 text-slate-600 hover:border-white/20 hover:text-slate-300'
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Legend */}
                        <div className="mt-auto flex flex-col gap-6">
                            <div className="h-[1px] w-full bg-white/5" />
                            <div className="flex flex-col gap-4">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 opacity-60">Legend</span>
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-4 group">
                                        <div className="w-1.5 h-4 rounded-full bg-violet-600 border border-violet-400" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Active Selection</span>
                                    </div>
                                    <div className="flex items-center gap-4 group">
                                        <div className="w-5 h-5 rounded-md bg-emerald-500 border border-emerald-400 shadow-lg shadow-emerald-500/10" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Question Answered</span>
                                    </div>
                                    <div className="flex items-center gap-4 group">
                                        <div className="w-1 h-4 rounded-full bg-white/10" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Remaining</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Quick Submit Assessment */}
                    <button
                        onClick={() => submitQuiz()}
                        disabled={submitting}
                        className="group w-full p-6 bg-[#1a1631]/80 hover:bg-violet-600 border border-white/10 rounded-[28px] flex items-center justify-center gap-4 transition-all duration-500 hover:shadow-2xl hover:shadow-violet-600/20"
                    >
                        <MdSend className="text-xl text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                        <span className="text-sm font-black uppercase tracking-[0.4em] text-white">Submit Assessment</span>
                    </button>
                    <div className="text-center pt-2">
                        <span className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.3em]">© 2024 Quizmaster Edition</span>
                    </div>
                </div>
            </div>

            {/* Overlays */}
            {isTimeOut && !duplicateDetected && (
                <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-xl w-full bg-[#1a1631] p-16 rounded-[60px] border border-red-500/40 flex flex-col items-center text-center gap-10 shadow-[0_0_100px_rgba(239,68,68,0.2)]"
                    >
                        <div className="w-32 h-32 rounded-full bg-red-500/10 flex items-center justify-center text-8xl shadow-2xl shadow-red-500/20">⏰</div>
                        <div>
                            <h2 className="text-4xl font-black text-white uppercase tracking-[0.3em] mb-6">Time Limit Reached</h2>
                            <p className="text-lg text-slate-400 font-bold leading-relaxed max-w-sm mx-auto">Your assessment is being finalized and submitted.</p>
                        </div>
                    </motion.div>
                </div>
            )}

            {duplicateDetected && (
                <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-xl w-full bg-[#1a1631] p-16 rounded-[60px] border border-orange-500/40 flex flex-col items-center text-center gap-10 shadow-[0_0_100px_rgba(249,115,22,0.2)]"
                    >
                        <div className="w-32 h-32 rounded-full bg-orange-500/10 flex items-center justify-center text-8xl shadow-2xl shadow-orange-500/20">⚠️</div>
                        <div>
                            <h2 className="text-3xl font-black text-white uppercase tracking-[0.2em] mb-6">Already Submitted</h2>
                            <p className="text-lg text-slate-400 font-bold leading-relaxed max-w-sm mx-auto">This assessment has already been completed by your account.</p>
                        </div>
                    </motion.div>
                </div>
            )}
        </main>
    );
}
