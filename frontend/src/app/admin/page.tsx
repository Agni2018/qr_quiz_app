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
    const router = useRouter();

    useEffect(() => {
        // Client-side auth check - redirect if no token
        const token = localStorage.getItem('token');
        if (!token) {
            router.replace('/');
            return;
        }
        fetchTopics();
    }, []);

    const fetchTopics = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/topics');
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
            await axios.post('http://localhost:5000/api/topics', newTopic);
            setShowModal(false);
            setNewTopic({ name: '', description: '' });
            fetchTopics();
        } catch (error) {
            console.error(error);
        }
    };

    const deleteTopic = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        try {
            await axios.delete(`http://localhost:5000/api/topics/${id}`);
            fetchTopics();
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
                                await axios.post('http://localhost:5000/api/auth/logout');
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
