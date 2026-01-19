'use client';

import { useState, useEffect, use, useMemo } from 'react';
import axios from 'axios';
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
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/questions/topic/${topicId}`)
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
            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/quiz/submit`, {
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
        <main className="container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

            {/* Progress Bar */}
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '4px', background: 'rgba(255,255,255,0.1)' }}>
                <div style={{
                    height: '100%',
                    width: `${((currentQIndex + 1) / questions.length) * 100}%`,
                    background: 'var(--primary)',
                    transition: 'width 0.3s ease'
                }} />
            </div>

            <AnimatePresence mode='wait'>
                <motion.div
                    key={currentQIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card style={{ padding: '2rem', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
                        <span style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem' }}>
                            Question {currentQIndex + 1} of {questions.length}
                        </span>

                        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '2rem' }}>
                            {currentQ.content.text}
                        </h2>

                        {/* Render Input based on type */}
                        <div style={{ flex: 1 }}>
                            {/* Single Choice and True/False */}
                            {(currentQ.type === 'single_choice' || currentQ.type === 'true_false') && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {(currentQ.type === 'true_false' ? ['True', 'False'] : currentQ.options).map((opt: string) => (
                                        <button
                                            key={opt}
                                            onClick={() => handleAnswer(opt)}
                                            style={{
                                                padding: '1rem',
                                                borderRadius: 'var(--radius)',
                                                border: currentAnswer === opt ? '2px solid var(--primary)' : '1px solid var(--glass-border)',
                                                background: currentAnswer === opt ? 'rgba(139, 92, 246, 0.2)' : 'rgba(0,0,0,0.2)',
                                                color: 'white',
                                                textAlign: 'left',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Multi Select - Checkboxes */}
                            {currentQ.type === 'multi_select' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                                                style={{
                                                    padding: '1rem',
                                                    borderRadius: 'var(--radius)',
                                                    border: selected ? '2px solid var(--primary)' : '1px solid var(--glass-border)',
                                                    background: selected ? 'rgba(139, 92, 246, 0.2)' : 'rgba(0,0,0,0.2)',
                                                    color: 'white',
                                                    textAlign: 'left',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.75rem'
                                                }}
                                            >
                                                <div style={{
                                                    width: '20px',
                                                    height: '20px',
                                                    borderRadius: '4px',
                                                    border: '2px solid ' + (selected ? 'var(--primary)' : '#94a3b8'),
                                                    background: selected ? 'var(--primary)' : 'transparent',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '0.75rem'
                                                }}>
                                                    {selected && '✓'}
                                                </div>
                                                {opt}
                                            </button>
                                        );
                                    })}
                                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                                        Select all that apply
                                    </p>
                                </div>
                            )}

                            {/* Match the Following */}
                            {currentQ.type === 'match' && (
                                <div>
                                    <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '1rem' }}>
                                        Match the items from left to right:
                                    </p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {currentQ.options.map((pair: any, idx: number) => {
                                            const currentMatches = currentAnswer || [];
                                            const userMatch = currentMatches[idx];
                                            return (
                                                <div key={idx} style={{
                                                    background: 'rgba(0,0,0,0.2)',
                                                    border: '1px solid var(--glass-border)',
                                                    borderRadius: 'var(--radius)',
                                                    padding: '1rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '1rem'
                                                }}>
                                                    <span style={{ flex: 1, fontWeight: 500 }}>{pair.left}</span>
                                                    <span style={{ color: '#94a3b8' }}>→</span>
                                                    <select
                                                        value={userMatch?.right || ''}
                                                        onChange={(e) => {
                                                            const newMatches = [...(currentAnswer || [])];
                                                            newMatches[idx] = { left: pair.left, right: e.target.value };
                                                            handleAnswer(newMatches);
                                                        }}
                                                        style={{
                                                            flex: 1,
                                                            padding: '0.5rem',
                                                            borderRadius: 'var(--radius)',
                                                            background: 'rgba(0,0,0,0.3)',
                                                            color: 'white',
                                                            border: '1px solid var(--glass-border)'
                                                        }}
                                                    >
                                                        <option value="">Select match...</option>
                                                        {shuffledMatchOptions.map((rightValue: string, i: number) => (
                                                            <option key={i} value={rightValue}>{rightValue}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Fill in the Blank - Text Input */}
                            {currentQ.type === 'fill_blank' && (
                                <textarea
                                    value={currentAnswer || ''}
                                    onChange={(e) => handleAnswer(e.target.value)}
                                    placeholder="Type your answer here..."
                                    style={{
                                        width: '100%',
                                        minHeight: '150px',
                                        padding: '1rem',
                                        borderRadius: 'var(--radius)',
                                        background: 'rgba(0,0,0,0.2)',
                                        border: '1px solid var(--glass-border)',
                                        color: 'white',
                                        fontSize: '1rem'
                                    }}
                                />
                            )}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                            <Button
                                variant="outline"
                                disabled={currentQIndex === 0}
                                onClick={() => setCurrentQIndex(currentQIndex - 1)}
                            >
                                Previous
                            </Button>
                            <Button
                                onClick={nextQuestion}
                                disabled={
                                    !currentAnswer ||
                                    (Array.isArray(currentAnswer) && currentAnswer.length === 0)
                                }
                            >
                                {currentQIndex === questions.length - 1 ? (submitting ? 'Submitting...' : 'Submit Quiz') : 'Next Question'}
                            </Button>
                        </div>

                    </Card>
                </motion.div>
            </AnimatePresence>
        </main>
    );
}
