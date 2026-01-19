'use client';

import { useState, useEffect, use } from 'react';
import axios from 'axios';
import Card from '@/components/Card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminLeaderboard({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Client-side auth check - redirect if no token
        const token = localStorage.getItem('token');
        if (!token) {
            router.replace('/');
            return;
        }

        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/quiz/leaderboard/${id}`)
            .then(res => {
                setLeaderboard(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    return (
        <main className="container">
            <Link href={`/admin/topic/${id}`} style={{ color: '#94a3b8', marginBottom: '1rem', display: 'inline-block' }}>&larr; Back to Topic</Link>
            <h1 style={{ marginBottom: '2rem' }}>Leaderboard</h1>

            <Card>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {loading && <p>Loading...</p>}
                    {!loading && leaderboard.length === 0 && <p>No attempts specific yet.</p>}

                    {leaderboard.map((entry, index) => (
                        <div
                            key={index}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: '1rem',
                                borderRadius: 'var(--radius)',
                                background: 'rgba(255,255,255,0.03)',
                            }}
                        >
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <span style={{
                                    width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    borderRadius: '50%', background: index < 3 ? 'var(--primary)' : 'rgba(255,255,255,0.1)', fontWeight: 600
                                }}>
                                    {index + 1}
                                </span>
                                <div>
                                    <div style={{ fontWeight: 500 }}>{entry.user.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{new Date(entry.completedAt).toLocaleString()}</div>
                                </div>
                            </div>
                            <span style={{ fontWeight: 700, color: 'var(--secondary)' }}>{entry.score} pts</span>
                        </div>
                    ))}
                </div>
            </Card>
        </main>
    );
}
