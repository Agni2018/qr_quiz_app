'use client';

import { useState, useEffect, use } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';

export default function QuizLanding({ params }: { params: Promise<{ topicId: string }> }) {
    const { topicId } = use(params);
    const router = useRouter();
    const [topic, setTopic] = useState<any>(null);
    const [questionCount, setQuestionCount] = useState<number | null>(null);
    const [user, setUser] = useState({ name: '', email: '', phone: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Fetch topic details
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/topics/${topicId}`)
            .then(res => setTopic(res.data))
            .catch(err => console.error(err));

        // Fetch questions count for this topic
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/questions/topic/${topicId}`)
            .then(res => setQuestionCount(res.data.length))
            .catch(err => {
                console.error(err);
                setQuestionCount(0);
            });
    }, [topicId]);

    const handleStart = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user.name || !user.email || !user.phone) {
            setError('All fields are required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/quiz/start`, {
                topicId: topicId,
                ...user
            });

            if (res.data.canAttempt) {
                // Save user details to localStorage to persist across play session
                localStorage.setItem('quizUser', JSON.stringify(user));
                router.push(`/quiz/${topicId}/play`);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to start quiz');
            if (err.response?.status === 403) {
                // Already attempted, maybe redirect to results?
                // for now just show error
            }
        } finally {
            setLoading(false);
        }
    };

    if (!topic || questionCount === null) return <div className="container" style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem' }}><div className="glass" style={{ padding: '2rem' }}>Loading Quiz...</div></div>;

    return (
        <main className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '90vh' }}>
            <Card style={{ maxWidth: '400px', width: '100%', border: '1px solid var(--primary)' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>{topic.name}</h1>
                    <p style={{ color: '#cbd5e1' }}>{topic.description}</p>
                </div>

                {questionCount === 0 ? (
                    <div
                        style={{
                            textAlign: 'center',
                            padding: '3rem 1.5rem',
                            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
                            borderRadius: '12px',
                            border: '2px dashed rgba(139, 92, 246, 0.3)'
                        }}
                    >
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
                        <h3
                            style={{
                                fontSize: '1.5rem',
                                fontWeight: 700,
                                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                marginBottom: '0.5rem'
                            }}
                        >
                            No Questions Yet
                        </h3>
                        <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
                            Questions haven't been added to this quiz yet. Please check back later!
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleStart}>
                        <Input
                            label="Full Name"
                            value={user.name}
                            onChange={e => setUser({ ...user, name: e.target.value })}
                            placeholder="John Doe"
                        />
                        <Input
                            label="Email Address"
                            type="email"
                            value={user.email}
                            onChange={e => setUser({ ...user, email: e.target.value })}
                            placeholder="john@example.com"
                        />
                        <Input
                            label="Phone Number"
                            type="tel"
                            value={user.phone}
                            onChange={e => setUser({ ...user, phone: e.target.value })}
                            placeholder="1234567890"
                        />

                        {error && <p style={{ color: '#ef4444', fontSize: '0.9rem', marginBottom: '1rem', textAlign: 'center' }}>{error}</p>}

                        <Button type="submit" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
                            {loading ? 'Validating...' : 'Start Quiz'}
                        </Button>
                    </form>
                )}
            </Card>
        </main>
    );
}
