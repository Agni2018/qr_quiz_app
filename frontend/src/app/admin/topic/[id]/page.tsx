'use client';

import { useState, useEffect, use } from 'react';
import axios from 'axios';
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
        // Client-side auth check - redirect if no token
        const token = localStorage.getItem('token');
        if (!token) {
            router.replace('/');
            return;
        }
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [topicRes, qRes] = await Promise.all([
                axios.get(`http://localhost:5000/api/topics/${id}`),
                axios.get(`http://localhost:5000/api/questions/topic/${id}`)
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
            await axios.put(`http://localhost:5000/api/topics/${id}`, { status: newStatus });
            fetchData();
        } catch (err) {
            console.error('Failed to update status', err);
        }
    };

    if (!topic) return <div className="container">Loading...</div>;

    const quizLink = `http://localhost:3000/quiz/${id}`;

    return (
        <main className="container">
            <div style={{ marginBottom: '2rem' }}>
                <Link href="/admin" style={{ color: '#94a3b8', fontSize: '0.9rem' }}>&larr; Back to Dashboard</Link>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginTop: '0.5rem' }}>{topic.name}</h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>

                {/* Left Column: Questions */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2>Questions ({questions.length})</h2>
                        <Button onClick={() => setShowAddForm(true)} disabled={showAddForm}>Add Question</Button>
                    </div>

                    {showAddForm && (
                        <QuestionForm
                            topicId={id}
                            onQuestionAdded={() => { setShowAddForm(false); fetchData(); }}
                            onCancel={() => setShowAddForm(false)}
                        />
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                        {questions.map((q, i) => (
                            <Card key={q._id} style={{ padding: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <h4 style={{ fontWeight: 600 }}>Q{i + 1}. {q.content.text}</h4>
                                    <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>{q.marks} Marks</span>
                                </div>
                                <p style={{ fontSize: '0.9rem', color: '#cbd5e1', marginTop: '0.5rem' }}>Type: {q.type}</p>
                                <p style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>Answer: {String(q.correctAnswer)}</p>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Right Column: QR & Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <Card style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Share Quiz</h3>
                        <div style={{ background: 'white', padding: '1rem', borderRadius: '8px' }}>
                            <QRCode value={quizLink} size={150} />
                        </div>
                        <div style={{ marginTop: '1rem', wordBreak: 'break-all', fontSize: '0.85rem', color: '#94a3b8' }}>
                            <a href={quizLink} target="_blank" style={{ textDecoration: 'underline' }}>{quizLink}</a>
                        </div>
                    </Card>

                    <Card>
                        <h3>Stats</h3>
                        <p style={{ marginTop: '0.5rem' }}>
                            Status: <span style={{
                                color: topic.status === 'active' ? '#10b981' : '#ef4444',
                                fontWeight: 600,
                                textTransform: 'capitalize'
                            }}>{topic.status}</span>
                        </p>

                        <Button
                            variant="secondary"
                            style={{
                                marginTop: '1rem',
                                width: '100%',
                                borderColor: topic.status === 'active' ? '#ef4444' : '#10b981',
                                color: topic.status === 'active' ? '#ef4444' : '#10b981'
                            }}
                            onClick={handleToggleStatus}
                        >
                            {topic.status === 'active' ? 'Close Quiz' : 'Open Quiz'}
                        </Button>

                        <Link href={`/admin/leaderboard/${id}`}>
                            <Button variant="secondary" style={{ marginTop: '0.5rem', width: '100%' }}>View Leaderboard</Button>
                        </Link>
                    </Card>
                </div>

            </div>
        </main>
    );
}
