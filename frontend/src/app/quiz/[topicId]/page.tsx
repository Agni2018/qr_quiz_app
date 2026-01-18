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
    const [user, setUser] = useState({ name: '', email: '', phone: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        axios.get(`http://localhost:5000/api/topics/${topicId}`)
            .then(res => setTopic(res.data))
            .catch(err => console.error(err));
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
            const res = await axios.post('http://localhost:5000/api/quiz/start', {
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

    if (!topic) return <div className="container" style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem' }}><div className="glass" style={{ padding: '2rem' }}>Loading Quiz...</div></div>;

    return (
        <main className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '90vh' }}>
            <Card style={{ maxWidth: '400px', width: '100%', border: '1px solid var(--primary)' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>{topic.name}</h1>
                    <p style={{ color: '#cbd5e1' }}>{topic.description}</p>
                </div>

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
            </Card>
        </main>
    );
}
