'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { FaPlus, FaQrcode, FaArrowRight, FaTrash, FaSignOutAlt } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
    const [topics, setTopics] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newTopic, setNewTopic] = useState({ name: '', description: '' });
    const [analytics, setAnalytics] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        // Client-side auth check - redirect if no token
        const token = localStorage.getItem('token');
        if (!token) {
            router.replace('/');
            return;
        }
        fetchTopics();
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/analytics/overview`);
            setAnalytics(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchTopics = async () => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/topics`);
            setTopics(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const createTopic = async () => {
        if (!newTopic.name) return;
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/topics`, newTopic);
            setShowModal(false);
            setNewTopic({ name: '', description: '' });
            fetchTopics();
            fetchAnalytics();
        } catch (error) {
            console.error(error);
        }
    };

    const deleteTopic = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/topics/${id}`);
            fetchTopics();
            fetchAnalytics();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <main className="container">
            <header
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2rem'
                }}
            >
                <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Dashboard</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Button onClick={() => setShowModal(true)}>
                        <FaPlus /> Create Topic
                    </Button>
                    <Button
                        variant="outline"
                        onClick={async () => {
                            try {
                                await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`);
                            } catch (error) {
                                console.error('Logout error', error);
                            }
                            localStorage.removeItem('token');
                            localStorage.removeItem('username');
                            // Clear cookie fallback for non-httpOnly (if any)
                            document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax";
                            router.replace('/');
                        }}
                    >
                        <FaSignOutAlt /> Logout
                    </Button>
                </div>
            </header>

            {/* Analytics Section */}
            {!loading && analytics && (
                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                        📊 Analytics Overview
                    </h2>

                    {analytics.totalTopics === 0 ? (
                        <div
                            style={{
                                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
                                border: '2px dashed rgba(139, 92, 246, 0.3)',
                                borderRadius: '16px',
                                padding: '4rem 2rem',
                                textAlign: 'center',
                                animation: 'fadeIn 0.6s ease-out'
                            }}
                        >
                            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📭</div>
                            <h3 style={{
                                fontSize: '1.75rem',
                                fontWeight: 700,
                                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                marginBottom: '0.5rem'
                            }}>
                                No Topics Created Yet
                            </h3>
                            <p style={{ color: '#94a3b8', fontSize: '1rem' }}>
                                Create your first topic to start tracking analytics
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Summary Card */}
                            <div
                                style={{
                                    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                                    borderRadius: '20px',
                                    padding: '2rem',
                                    marginBottom: '2rem',
                                    boxShadow: '0 20px 40px rgba(99, 102, 241, 0.3)',
                                    animation: 'slideDown 0.5s ease-out',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: '-50%',
                                        right: '-10%',
                                        width: '300px',
                                        height: '300px',
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        borderRadius: '50%',
                                        filter: 'blur(60px)'
                                    }}
                                />
                                <div style={{ position: 'relative', zIndex: 1 }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎯</div>
                                    <h3 style={{ fontSize: '1.25rem', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '0.5rem' }}>
                                        Total Topics Created
                                    </h3>
                                    <div style={{
                                        fontSize: '4rem',
                                        fontWeight: 800,
                                        color: '#fff',
                                        lineHeight: 1
                                    }}>
                                        {analytics.totalTopics}
                                    </div>
                                </div>
                            </div>

                            {/* Topics Analytics Grid */}
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: '#e2e8f0' }}>
                                📈 Topic Performance
                            </h3>
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                                    gap: '1.5rem',
                                    marginBottom: '2rem'
                                }}
                            >
                                {analytics.topicStats.map((stat: any, index: number) => (
                                    <div
                                        key={stat.topicId}
                                        style={{
                                            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.6) 100%)',
                                            backdropFilter: 'blur(10px)',
                                            border: '1px solid rgba(148, 163, 184, 0.2)',
                                            borderRadius: '16px',
                                            padding: '1.5rem',
                                            transition: 'all 0.3s ease',
                                            animation: `fadeInUp 0.5s ease-out ${index * 0.1}s backwards`,
                                            cursor: 'default',
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-4px)';
                                            e.currentTarget.style.boxShadow = '0 12px 24px rgba(99, 102, 241, 0.2)';
                                            e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = 'none';
                                            e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.2)';
                                        }}
                                    >
                                        <div
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                height: '4px',
                                                background: `linear-gradient(90deg, #6366f1 0%, #a855f7 ${(stat.participantCount / Math.max(...analytics.topicStats.map((s: any) => s.participantCount))) * 100}%, rgba(148, 163, 184, 0.2) ${(stat.participantCount / Math.max(...analytics.topicStats.map((s: any) => s.participantCount))) * 100}%)`,
                                            }}
                                        />
                                        <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
                                            <div
                                                style={{
                                                    width: '48px',
                                                    height: '48px',
                                                    borderRadius: '12px',
                                                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '1.5rem',
                                                    flexShrink: 0
                                                }}
                                            >
                                                📚
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <h4
                                                    style={{
                                                        fontSize: '1.1rem',
                                                        fontWeight: 600,
                                                        color: '#e2e8f0',
                                                        marginBottom: '0.5rem',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                >
                                                    {stat.topicName}
                                                </h4>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                                                        👥 Participants:
                                                    </span>
                                                    <span
                                                        style={{
                                                            fontSize: '1.5rem',
                                                            fontWeight: 700,
                                                            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                                                            WebkitBackgroundClip: 'text',
                                                            WebkitTextFillColor: 'transparent'
                                                        }}
                                                    >
                                                        {stat.participantCount}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </section>
            )}

            {/* Topics Management Section */}
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                🎓 Manage Topics
            </h2>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '1.5rem'
                    }}
                >
                    {topics.map(topic => (
                        <Card
                            key={topic._id}
                            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
                        >
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                                    {topic.name}
                                </h3>
                                <p
                                    style={{
                                        color: '#94a3b8',
                                        fontSize: '0.9rem',
                                        marginTop: '0.5rem'
                                    }}
                                >
                                    {topic.description}
                                </p>
                                <div style={{ marginTop: '0.5rem' }}>
                                    <span
                                        style={{
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '20px',
                                            fontSize: '0.75rem',
                                            background:
                                                topic.status === 'active'
                                                    ? 'rgba(34, 197, 94, 0.2)'
                                                    : 'rgba(148, 163, 184, 0.2)',
                                            color:
                                                topic.status === 'active'
                                                    ? '#4ade80'
                                                    : '#cbd5e1'
                                        }}
                                    >
                                        {topic.status.toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            <div
                                style={{
                                    marginTop: 'auto',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    gap: '0.5rem'
                                }}
                            >
                                <Link href={`/admin/topic/${topic._id}`} style={{ flex: 1 }}>
                                    <Button variant="secondary" style={{ width: '100%' }}>
                                        Manage <FaArrowRight />
                                    </Button>
                                </Link>
                                <Button
                                    variant="danger"
                                    onClick={() => deleteTopic(topic._id)}
                                    style={{ padding: '0.75rem' }}
                                >
                                    <FaTrash />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {showModal && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.6)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 50
                    }}
                    onClick={() => setShowModal(false)}
                >
                    <Card
                        style={{ width: '400px', background: 'var(--background)' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>
                            New Topic
                        </h2>
                        <Input
                            label="Topic Name"
                            value={newTopic.name}
                            onChange={e =>
                                setNewTopic({ ...newTopic, name: e.target.value })
                            }
                            autoFocus
                        />
                        <Input
                            label="Description"
                            value={newTopic.description}
                            onChange={e =>
                                setNewTopic({
                                    ...newTopic,
                                    description: e.target.value
                                })
                            }
                        />
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <Button style={{ flex: 1 }} onClick={createTopic}>
                                Create
                            </Button>
                            <Button
                                variant="outline"
                                style={{ flex: 1 }}
                                onClick={() => setShowModal(false)}
                            >
                                Cancel
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </main>
    );
}
