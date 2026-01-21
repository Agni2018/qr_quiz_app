'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import {
    FaPlus,
    FaArrowRight,
    FaTrash,
    FaSignOutAlt,
    FaBars,
    FaTimes
} from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function UserDashboard() {
    const [topics, setTopics] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newTopic, setNewTopic] = useState({ name: '', description: '' });
    const [analytics, setAnalytics] = useState<any>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [activeView, setActiveView] =
        useState<'analytics' | 'manage'>('analytics');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const router = useRouter();

    /* ================= AUTH + INITIAL LOAD ================= */
    useEffect(() => {
        const checkAuth = async () => {
            try {
                await api.get('/auth/status');
                setAuthLoading(false);
            } catch {
                router.replace('/');
            }
        };

        checkAuth();
        fetchTopics();
        fetchAnalytics();

        window.addEventListener('focus', checkAuth);
        return () => window.removeEventListener('focus', checkAuth);
    }, []);

    /* ================= DATA FETCHERS ================= */
    const fetchAnalytics = async () => {
        try {
            const res = await api.get('/analytics/overview');
            setAnalytics(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchTopics = async () => {
        try {
            const res = await api.get('/topics');
            setTopics(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    /* ================= CRUD ================= */
    const createTopic = async () => {
        if (!newTopic.name) return;
        try {
            await api.post('/topics', newTopic);
            setShowModal(false);
            setNewTopic({ name: '', description: '' });
            fetchTopics();
            fetchAnalytics();
        } catch (err) {
            console.error(err);
        }
    };

    const deleteTopic = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        try {
            await api.delete(`/topics/${id}`);
            fetchTopics();
            fetchAnalytics();
        } catch (err) {
            console.error(err);
        }
    };

    /* ================= AUTH LOADER ================= */
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#020617]">
                <div className="flex flex-col items-center gap-6">
                    <div className="w-12 h-12 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
                    <p className="text-slate-400 font-bold uppercase tracking-[0.25em] text-xs">
                        Verifying Session
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] text-white flex flex-col lg:flex-row">

            {/* ================= MOBILE HEADER ================= */}
            <header className="lg:hidden flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/60 backdrop-blur-xl sticky top-0 z-50">
                <h1 className="text-xl font-black">Dashboard</h1>
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="text-xl"
                >
                    <FaBars />
                </button>
            </header>

            {/* ================= MOBILE SIDEBAR OVERLAY ================= */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/70 z-50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ================= SIDEBAR ================= */}
            <aside
                className={`
                    fixed lg:sticky top-0
                    h-screen w-[280px]
                    px-8 py-24
                    flex flex-col gap-8
                    bg-black/80 backdrop-blur-xl
                    border-r border-white/10
                    z-50
                    transform transition-transform duration-300
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    lg:translate-x-0
                `}
            >
                <button
                    className="absolute top-6 right-6 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                >
                    <FaTimes />
                </button>

                <div>
                    <h1 className="text-3xl font-black tracking-tight">
                        Dashboard
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Manage your quiz ecosystem
                    </p>
                </div>

                <div className="flex flex-col gap-3 mt-6">
                    <Button
                        variant={activeView === 'analytics' ? 'secondary' : 'outline'}
                        className="justify-start"
                        onClick={() => {
                            setActiveView('analytics');
                            setSidebarOpen(false);
                        }}
                    >
                        📊 Analytics
                    </Button>

                    <Button
                        variant={activeView === 'manage' ? 'secondary' : 'outline'}
                        className="justify-start"
                        onClick={() => {
                            setActiveView('manage');
                            setSidebarOpen(false);
                        }}
                    >
                        🎓 Manage Topics
                    </Button>
                </div>

                <div className="mt-auto flex flex-col gap-3">
                    <Button
                        onClick={() => {
                            setShowModal(true);
                            setSidebarOpen(false);
                        }}
                        className="shadow-lg shadow-violet-500/30"
                    >
                        <FaPlus /> Create Topic
                    </Button>

                    <Button
                        variant="outline"
                        className="border-white/10 hover:bg-white/5"
                        onClick={async () => {
                            try {
                                await api.post('/auth/logout');
                            } catch { }
                            localStorage.clear();
                            router.replace('/');
                        }}
                    >
                        <FaSignOutAlt /> Logout
                    </Button>
                </div>
            </aside>

            {/* ================= MAIN ================= */}
            <main className="flex-1 px-6 sm:px-10 lg:px-20 py-10 lg:py-24 flex flex-col gap-24 overflow-x-hidden">

                {/* ================= ANALYTICS ================= */}
                {activeView === 'analytics' && analytics && !loading && (
                    <>
                        <section className="flex flex-col gap-10">
                            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                                📊 Analytics Overview
                            </h2>

                            {analytics.totalTopics === 0 ? (
                                <div className="border-2 border-dashed border-white/10 rounded-[32px] py-20 text-center bg-white/[0.02]">
                                    <div className="text-6xl mb-4 opacity-40">📭</div>
                                    <h3 className="text-2xl font-extrabold mb-2">
                                        No Topics Yet
                                    </h3>
                                    <p className="text-slate-400 max-w-md mx-auto">
                                        Create a topic to unlock real-time analytics.
                                    </p>
                                </div>
                            ) : (
                                <div className="relative rounded-[36px] p-8 sm:p-12 lg:p-16 bg-gradient-to-br from-violet-900/50 to-slate-950 border border-white/10 shadow-2xl overflow-hidden">
                                    <div className="absolute -top-24 -right-24 w-[360px] h-[360px] bg-violet-600/40 rounded-full blur-3xl" />

                                    <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
                                        <div>

                                            <h3 className="text-3xl sm:text-4xl font-black mt-4">
                                                Active Topics
                                            </h3>
                                        </div>

                                        <div className="text-6xl sm:text-7xl lg:text-9xl font-black text-violet-400">
                                            {analytics.activeTopics}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </section>

                        {analytics.totalTopics > 0 && (
                            <section className="flex flex-col gap-10">
                                <h2 className="text-2xl sm:text-3xl font-black">
                                    Topic Performance
                                </h2>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                    {analytics.topicStats.map((stat: any) => (
                                        <div
                                            key={stat.topicId}
                                            className="rounded-[28px] p-8 flex flex-col justify-between bg-gradient-to-br from-white/[0.10] to-white/[0.02] border border-white/10 shadow-xl hover:shadow-violet-500/30 transition"
                                        >
                                            <h4 className="text-lg font-bold leading-snug">
                                                {stat.topicName}
                                            </h4>

                                            <div>
                                                <p className="text-4xl font-black text-violet-400">
                                                    {stat.participantCount}
                                                </p>
                                                <p className="text-xs uppercase tracking-widest text-slate-400 mt-2">
                                                    Participants
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </>
                )}

                {/* ================= MANAGE ================= */}
                {activeView === 'manage' && (
                    <section className="flex flex-col gap-10">
                        <h2 className="text-3xl sm:text-4xl font-black">
                            Manage Topics
                        </h2>

                        {loading ? (
                            <div className="flex justify-center py-20">
                                <div className="w-12 h-12 border-b-2 border-violet-500 rounded-full animate-spin" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {topics.map(topic => (
                                    <Card
                                        key={topic._id}
                                        className="p-8 rounded-[28px] border border-white/10 flex flex-col gap-6"
                                    >
                                        <div className="flex justify-between gap-4">
                                            <h3 className="text-lg font-bold">
                                                {topic.name}
                                            </h3>

                                            <span
                                                className={`px-3 py-1 rounded-full text-[0.6rem] font-black uppercase tracking-widest border ${topic.status === 'active'
                                                    ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                                                    : 'text-red-400 border-red-500/30 bg-red-500/10'
                                                    }`}
                                            >
                                                {topic.status}
                                            </span>
                                        </div>

                                        <p className="text-slate-400 text-sm leading-relaxed">
                                            {topic.description}
                                        </p>

                                        <div className="flex gap-3 mt-auto">
                                            <Link href={`/users/topic/${topic._id}`} className="flex-1">
                                                <Button className="w-full">
                                                    Manage <FaArrowRight />
                                                </Button>
                                            </Link>

                                            <Button
                                                variant="danger"
                                                onClick={() => deleteTopic(topic._id)}
                                            >
                                                <FaTrash />
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </section>
                )}
            </main>

            {/* ================= CREATE MODAL ================= */}
            {showModal && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center px-6"
                    onClick={() => setShowModal(false)}
                >
                    <Card
                        noGlass
                        className="w-full max-w-[480px] p-8 rounded-[32px] bg-[#020617]"
                        onClick={e => e.stopPropagation()}
                    >
                        <h2 className="text-2xl font-black mb-6">
                            New Topic
                        </h2>

                        <Input
                            label="Topic Name"
                            value={newTopic.name}
                            onChange={e =>
                                setNewTopic({ ...newTopic, name: e.target.value })
                            }
                        />

                        <Input
                            label="Description"
                            value={newTopic.description}
                            onChange={e =>
                                setNewTopic({ ...newTopic, description: e.target.value })
                            }
                        />

                        <div className="flex gap-4 mt-6">
                            <Button className="flex-1" onClick={createTopic}>
                                Create
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setShowModal(false)}
                            >
                                Cancel
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}





