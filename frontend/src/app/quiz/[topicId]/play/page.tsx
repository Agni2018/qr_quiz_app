'use client';

import { useState, useEffect, use, useMemo } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { motion, AnimatePresence } from 'framer-motion';

export default function QuizPlay({ params }: { params: Promise<{ topicId: string }> }) {
    const { topicId } = use(params);
    const router = useRouter();
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [answers, setAnswers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        // 1. Get User
        const storedUser = localStorage.getItem('quizUser');
        if (!storedUser) {
            router.push(`/quiz/${topicId}`);
            return;
        }
        setUser(JSON.parse(storedUser));

        // 2. Fetch Questions
        api.get(`/questions/topic/${topicId}`)
            .then(res => {
                setQuestions(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });

        // 3. Disable Back Button
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

    const handleAnswer = (value: any) => {
        const newAnswers = [...answers];
        const currentQ = questions[currentQIndex];

        // Update or Add answer
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

    const submitQuiz = async () => {
        setSubmitting(true);
        try {
            const res = await api.post('/quiz/submit', {
                topicId: topicId,
                user,
                answers
            });
            // Clear user session or keep it for result view?
            // Redirect to result using replace to prevent going back to quiz
            router.replace(`/quiz/${topicId}/result?attemptId=${res.data.attemptId}`);
        } catch (err) {
            console.error(err);
            alert('Submission failed! Please try again.');
            setSubmitting(false);
        }
    };

    // Shuffle function for randomizing match options
    const shuffleArray = (array: any[]) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    // Define currentQ before early returns to avoid hook order issues
    const currentQ = questions[currentQIndex];

    // Shuffle match options once per question (memoized)
    const shuffledMatchOptions = useMemo(() => {
        if (currentQ?.type === 'match' && currentQ?.options) {
            return shuffleArray(currentQ.options.map((p: any) => p.right));
        }
        return [];
    }, [currentQ?._id, currentQ?.type]);

    if (loading) return <div className="container">Loading Questions...</div>;
    if (!questions.length) return <div className="container">No questions found for this quiz.</div>;

    const currentAnswer = answers.find(a => a.questionId === currentQ._id)?.submittedAnswer;

    return (
        <main className="container min-h-screen flex flex-col justify-center">

            {/* Progress Bar */}
            <div className="fixed top-0 left-0 right-0 h-1 bg-white/10">
                <div className="h-full bg-[var(--primary)] transition-[width] duration-300 ease-in-out" style={{
                    width: `${((currentQIndex + 1) / questions.length) * 100}%`
                }} />
            </div>

            <AnimatePresence mode='wait'>
                <motion.div
                    key={currentQIndex}
                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: -10 }}
                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                >
                    <Card className="p-10 md:p-14 min-h-[500px] flex flex-col border border-white/5 bg-slate-900/60 backdrop-blur-2xl rounded-[40px] shadow-3xl">
                        <div className="flex justify-between items-center mb-10">
                            <span className="text-[0.65rem] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full bg-white/5 text-slate-400 border border-white/5">
                                Question {currentQIndex + 1} of {questions.length}
                            </span>
                            <div className="flex gap-1">
                                {questions.map((_, i) => (
                                    <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === currentQIndex ? 'w-6 bg-violet-500' : 'w-2 bg-white/10'}`} />
                                ))}
                            </div>
                        </div>

                        <h2 className="text-2xl md:text-3xl font-black text-white/95 leading-tight mb-16">
                            {currentQ.content.text}
                        </h2>

                        {/* Render Input based on type */}
                        <div className="flex-1 mb-12">
                            {/* Single Choice and True/False */}
                            {(currentQ.type === 'single_choice' || currentQ.type === 'true_false') && (
                                <div className="flex flex-col gap-5">
                                    {(currentQ.type === 'true_false' ? ['True', 'False'] : currentQ.options).map((opt: string) => (
                                        <button
                                            key={opt}
                                            onClick={() => handleAnswer(opt)}
                                            className={`group p-6 rounded-2xl text-left cursor-pointer transition-all duration-300 border-2 flex items-center justify-between ${currentAnswer === opt
                                                ? 'border-violet-500 bg-violet-500/10 shadow-lg shadow-violet-500/10'
                                                : 'border-white/5 bg-black/20 hover:border-white/20 hover:bg-black/30'
                                                }`}
                                        >
                                            <span className={`text-lg font-bold transition-colors ${currentAnswer === opt ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                                                {opt}
                                            </span>
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${currentAnswer === opt ? 'border-violet-400 bg-violet-400' : 'border-slate-700'}`}>
                                                {currentAnswer === opt && <div className="w-2.5 h-2.5 rounded-full bg-violet-900" />}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Multi Select - Checkboxes */}
                            {currentQ.type === 'multi_select' && (
                                <div className="flex flex-col gap-5">
                                    {currentQ.options.map((opt: string) => {
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
                                                className={`group p-6 rounded-2xl text-left cursor-pointer transition-all duration-300 border-2 flex items-center gap-5 ${selected
                                                    ? 'border-violet-500 bg-violet-500/10 shadow-lg shadow-violet-500/10'
                                                    : 'border-white/5 bg-black/20 hover:border-white/20 hover:bg-black/30'
                                                    }`}
                                            >
                                                <div className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${selected ? 'border-violet-400 bg-violet-400' : 'border-slate-700'}`}>
                                                    {selected && <span className="text-violet-900 font-bold">✓</span>}
                                                </div>
                                                <span className={`text-lg font-bold transition-colors ${selected ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                                                    {opt}
                                                </span>
                                            </button>
                                        );
                                    })}
                                    <div className="mt-6 flex items-center gap-3 text-slate-500 px-2 font-bold text-[0.65rem] uppercase tracking-widest">
                                        <div className="w-2 h-2 rounded-full bg-violet-500/50" />
                                        Select all that apply
                                    </div>
                                </div>
                            )}

                            {/* Match the Following */}
                            {currentQ.type === 'match' && (
                                <div className="flex flex-col gap-6">
                                    <div className="flex items-center gap-3 text-slate-500 px-2 font-bold text-[0.65rem] uppercase tracking-widest mb-4">
                                        <div className="w-2 h-2 rounded-full bg-violet-500/50" />
                                        Match the items from left to right:
                                    </div>
                                    <div className="flex flex-col gap-4">
                                        {currentQ.options.map((pair: any, idx: number) => {
                                            const currentMatches = currentAnswer || [];
                                            const userMatch = currentMatches[idx];
                                            return (
                                                <div key={idx} className="bg-black/20 border-2 border-white/5 rounded-2xl p-5 flex flex-col md:flex-row items-center gap-6">
                                                    <div className="flex-1 text-center md:text-left">
                                                        <span className="text-xl font-bold text-white/90">{pair.left}</span>
                                                    </div>
                                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
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
                                                            className="w-full p-4 rounded-xl bg-black/30 text-white border-2 border-white/10 focus:border-violet-500/50 outline-none transition-all cursor-pointer font-bold text-sm"
                                                        >
                                                            <option value="" className="bg-slate-900">Select match...</option>
                                                            {shuffledMatchOptions.map((rightValue: string, i: number) => (
                                                                <option key={i} value={rightValue} className="bg-slate-900">{rightValue}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Fill in the Blank - Text Input */}
                            {currentQ.type === 'fill_blank' && (
                                <div className="flex flex-col gap-6">
                                    <div className="flex items-center gap-3 text-slate-500 px-2 font-bold text-[0.65rem] uppercase tracking-widest">
                                        <div className="w-2 h-2 rounded-full bg-violet-500/50" />
                                        Type your answer here:
                                    </div>
                                    <textarea
                                        value={currentAnswer || ''}
                                        onChange={(e) => handleAnswer(e.target.value)}
                                        placeholder="Enter response..."
                                        className="w-full min-h-[150px] p-6 rounded-2xl bg-black/20 border-2 border-white/5 focus:border-violet-500/50 outline-none transition-all text-white text-xl font-bold placeholder:text-slate-700"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between items-center mt-12 pt-10 border-t border-white/5">
                            <Button
                                variant="outline"
                                disabled={currentQIndex === 0}
                                onClick={() => setCurrentQIndex(currentQIndex - 1)}
                                className="px-8 py-4 rounded-2xl border-white/10 text-slate-400 font-bold hover:bg-white/5"
                            >
                                Previous
                            </Button>
                            <Button
                                onClick={nextQuestion}
                                disabled={
                                    !currentAnswer ||
                                    (Array.isArray(currentAnswer) && currentAnswer.length === 0)
                                }
                                className="px-10 py-5 rounded-3xl bg-violet-500 text-white font-black text-lg shadow-xl shadow-violet-500/20 hover:scale-105 transition-transform"
                            >
                                {currentQIndex === questions.length - 1 ? (submitting ? 'Submitting...' : '✨ Submit Quiz') : 'Next Question →'}
                            </Button>
                        </div>
                    </Card>
                </motion.div>
            </AnimatePresence>
        </main>
    );
}
