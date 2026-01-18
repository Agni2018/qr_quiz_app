'use client';

import { useState, useEffect, use } from 'react';
import axios from 'axios';
import { useSearchParams } from 'next/navigation';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Link from 'next/link';

export default function QuizResult({ params }: { params: Promise<{ topicId: string }> }) {
    const { topicId } = use(params);
    const searchParams = useSearchParams();
    const attemptId = searchParams.get('attemptId');

    const [attempt, setAttempt] = useState<any>(null);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (attemptId) {
                    const attemptRes = await axios.get(`http://localhost:5000/api/quiz/result/${attemptId}`);
                    setAttempt(attemptRes.data);
                }

                const lbRes = await axios.get(`http://localhost:5000/api/quiz/leaderboard/${topicId}`);
                setLeaderboard(lbRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [attemptId, topicId]);

    if (loading) return <div className="container">Loading Results...</div>;

    return (
        <main className="container" style={{ paddingBottom: '4rem' }}>

            {/* Score Card */}
            {attempt && (
                <Card style={{ textAlign: 'center', marginBottom: '3rem', padding: '3rem', border: '2px solid var(--primary)', background: 'linear-gradient(180deg, rgba(139, 92, 246, 0.1), rgba(0,0,0,0))' }}>
                    <h1 style={{ fontSize: '1.2rem', color: '#cbd5e1', marginBottom: '1rem' }}>Quiz Completed</h1>
                    <div style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>
                        {attempt.score}
                    </div>
                    <p style={{ marginTop: '0.5rem', fontSize: '1.1rem' }}>Total Score</p>

                    <div style={{ marginTop: '2rem' }}>
                        <h3 style={{ fontSize: '1.5rem' }}>Great job, {attempt.user.name}!</h3>
                    </div>
                </Card>
            )}

            {/* Leaderboard */}
            <Card>
                <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>Leaderboard</h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {leaderboard.length === 0 && <p>No attempts yet.</p>}
                    {leaderboard.map((entry, index) => (
                        <div
                            key={index}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: '1rem',
                                borderRadius: 'var(--radius)',
                                background: entry._id === attempt?._id ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255,255,255,0.03)',
                                border: entry._id === attempt?._id ? '1px solid var(--primary)' : 'none'
                            }}
                        >
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <span style={{
                                    width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    borderRadius: '50%', background: index < 3 ? 'var(--primary)' : 'rgba(255,255,255,0.1)', fontWeight: 600
                                }}>
                                    {index + 1}
                                </span>
                                <span style={{ fontWeight: 500 }}>{entry.user.name}</span>
                            </div>
                            <span style={{ fontWeight: 700, color: 'var(--secondary)' }}>{entry.score} pts</span>
                        </div>
                    ))}
                </div>
            </Card>

            <div
                style={{
                    marginTop: '3rem',
                    textAlign: 'center',
                    padding: '1.5rem',
                    borderRadius: 'var(--radius)',
                    background: 'linear-gradient(180deg, rgba(139, 92, 246, 0.12), rgba(255,255,255,0.02))',
                    border: '1px solid var(--glass-border)',
                    color: '#cbd5e1'
                }}
            >
                <h3
                    style={{
                        fontSize: '1.4rem',
                        fontWeight: 600,
                        color: 'var(--primary)',
                        marginBottom: '0.5rem'
                    }}
                >
                    🎉 Thanks for attempting the quiz!
                </h3>
                <p style={{ fontSize: '0.95rem', opacity: 0.85 }}>
                    Your response has been recorded successfully.
                </p>
            </div>


        </main>
    );
}
