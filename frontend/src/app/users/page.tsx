'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { FaPlus, FaArrowRight, FaTrash, FaSignOutAlt } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function UserDashboard() {
    const [topics, setTopics] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newTopic, setNewTopic] = useState({ name: '', description: '' });
    const [analytics, setAnalytics] = useState<any>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                await api.get('/auth/status');
                setAuthLoading(false);
            } catch (err) {
                // Interceptor will handle redirect
            }
        };

        checkAuth();
        fetchTopics();
        fetchAnalytics();

        // Check auth on focus to handle back-button/bfcache
        window.addEventListener('focus', checkAuth);
        return () => window.removeEventListener('focus', checkAuth);
    }, []);

    const fetchAnalytics = async () => {
        try {
            const res = await api.get('/analytics/overview');
            setAnalytics(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchTopics = async () => {
        try {
            const res = await api.get('/topics');
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
            await api.post('/topics', newTopic);
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
            await api.delete(`/topics/${id}`);
            fetchTopics();
            fetchAnalytics();
        } catch (error) {
            console.error(error);
        }
    };

    if (authLoading) {
        return (
            <div className="container min-h-screen flex flex-col items-center justify-center gap-6">
                <div className="w-12 h-12 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
                <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">Verifying Session...</p>
            </div>
        );
    }

    return (
        <main className="container py-24 px-6 flex flex-col gap-32">

            {/* HEADER */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center px-2 gap-8">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight mb-2">
                        Dashboard
                    </h1>
                    <p className="text-slate-400 font-medium">
                        Manage your quiz ecosystem
                    </p>
                </div>

                <div className="flex flex-wrap gap-4 w-full md:w-auto">
                    <Button
                        onClick={() => setShowModal(true)}
                        className="shadow-lg shadow-violet-500/20 flex-1 md:flex-none justify-center"
                    >
                        <FaPlus /> Create Topic
                    </Button>

                    <Button
                        variant="outline"
                        className="border-white/10 hover:bg-white/5 flex-1 md:flex-none justify-center"
                        onClick={async () => {
                            try {
                                await api.post('/auth/logout');
                            } catch (error) {
                                console.error('Logout error', error);
                            }
                            localStorage.removeItem('username');
                            localStorage.removeItem('role');
                            router.replace('/');
                        }}
                    >
                        <FaSignOutAlt /> Logout
                    </Button>
                </div>
            </header>

            {/* ANALYTICS OVERVIEW */}
            {!loading && analytics && (
                <section className="flex flex-col gap-12">
                    <div className="flex items-center gap-4 px-2">
                        <span className="text-3xl">📊</span>
                        <h2 className="text-3xl font-black tracking-tight">
                            Analytics Overview
                        </h2>
                    </div>

                    {analytics.totalTopics === 0 ? (
                        <div className="bg-white/[0.02] border-2 border-dashed border-white/10 rounded-[32px] py-24 px-8 text-center backdrop-blur-sm">
                            <div className="text-7xl mb-6 opacity-40">📭</div>
                            <h3 className="text-3xl font-extrabold mb-3">
                                No Topics Created Yet
                            </h3>
                            <p className="text-slate-400 max-w-sm mx-auto text-lg leading-relaxed">
                                Create your first topic to start tracking real-time participant analytics and engagement metrics.
                            </p>
                        </div>
                    ) : (
                        <div className="relative overflow-visible rounded-[32px] bg-slate-900/40 border border-white/10 p-8 md:p-12 shadow-2xl backdrop-blur-xl group">
                            {/* Animated background pulse */}
                            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl animate-pulse"></div>

                            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                                <div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="flex h-3 w-3 relative">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                        </span>
                                        <span className="text-emerald-400 text-xs font-black uppercase tracking-[0.2em]">Live Statistics</span>
                                    </div>
                                    <h3 className="text-3xl font-black text-white/95 mb-2 tracking-tight">
                                        Total Topics
                                    </h3>
                                    <p className="text-slate-400 text-lg font-medium opacity-70">Active quiz collections in your ecosystem</p>
                                </div>
                                <div className="flex items-baseline gap-3">
                                    <span className="text-8xl font-black text-white leading-none tracking-tighter bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
                                        {analytics.activeTopics}
                                    </span>
                                    <span className="text-violet-400 font-bold text-xl uppercase tracking-widest">Active</span>
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            )}

            {/* TOPIC PERFORMANCE */}
            {!loading && analytics && analytics.totalTopics > 0 && (
                <section className="flex flex-col gap-12">
                    <div className="flex items-center gap-4 px-2">
                        <span className="w-2 h-8 bg-violet-500 rounded-full"></span>
                        <h2 className="text-3xl font-black tracking-tight">
                            Topic Performance
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {analytics.topicStats.map(
                            (stat: any) => (
                                <div
                                    key={stat.topicId}
                                    className="group relative bg-white/[0.03] hover:bg-white/[0.06] transition-all rounded-[24px] p-8 border border-white/5 hover:border-violet-500/30 shadow-xl overflow-visible"
                                >
                                    {/* Decorative background element */}
                                    <div className="absolute -right-4 -bottom-4 text-6xl opacity-[0.03] group-hover:opacity-[0.08] transition-opacity rotate-12 group-hover:rotate-0 duration-500 pointer-events-none">📈</div>

                                    <div className="relative z-10">
                                        <h4 className="text-lg font-bold mb-4 opacity-90 group-hover:text-violet-300 transition-colors break-words leading-tight">
                                            {stat.topicName}
                                        </h4>
                                        <div className="flex flex-col">
                                            <span className="text-slate-500 text-[0.65rem] font-bold uppercase tracking-widest mb-1">Participants</span>
                                            <span className="text-3xl font-black text-violet-400 tabular-nums">
                                                {stat.participantCount}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Accent border bottom */}
                                    <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-violet-500/0 via-violet-500/40 to-violet-500/0 w-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                                </div>
                            )
                        )}
                    </div>
                </section>
            )}

            {/* MANAGE TOPICS SECTION */}
            <section className="flex flex-col gap-12">
                <div className="flex items-center gap-4 px-2">
                    <span className="text-3xl">🎓</span>
                    <h2 className="text-3xl font-black tracking-tight">
                        Manage Topics
                    </h2>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {topics.map(topic => (
                            <Card
                                key={topic._id}
                                className="group p-8 flex flex-col gap-6 rounded-[28px] border border-white/5 hover:border-violet-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/5 bg-white/[0.02] overflow-visible"
                            >
                                <div className="flex justify-between items-start gap-4">
                                    <h3 className="text-xl font-bold leading-tight group-hover:text-violet-300 transition-colors break-words">
                                        {topic.name}
                                    </h3>

                                    <span className={`py-1.5 px-4 rounded-full text-[0.65rem] font-black uppercase tracking-widest border shrink-0 ${topic.status === 'active'
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                        : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                        }`}
                                    >
                                        {topic.status}
                                    </span>
                                </div>

                                <p className="text-slate-400 text-sm leading-relaxed opacity-80 min-h-[40px]">
                                    {topic.description}
                                </p>

                                <div className="mt-8 flex gap-4">
                                    <Link
                                        href={`/users/topic/${topic._id}`}
                                        className="flex-1"
                                    >
                                        <Button
                                            variant="secondary"
                                            className="w-full flex justify-center items-center gap-2 py-3.5 rounded-2xl group/btn"
                                        >
                                            Manage <FaArrowRight className="group-hover/btn:translate-x-1 transition-transform" />
                                        </Button>
                                    </Link>

                                    <Button
                                        variant="danger"
                                        onClick={() =>
                                            deleteTopic(topic._id)
                                        }
                                        className="p-4 min-w-[54px] flex items-center justify-center rounded-2xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 transition-all"
                                    >
                                        <FaTrash />
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </section>

            {showModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-[6px] flex items-center justify-center z-50 p-6" onClick={() => setShowModal(false)}>
                    <Card
                        noGlass
                        className="w-full max-w-[480px] bg-[#1e293b] border border-white/10 shadow-3xl p-10 rounded-[32px]"
                        onClick={e => e.stopPropagation()}
                    >
                        <h2 className="mb-6 text-2xl font-bold">
                            New Topic
                        </h2>

                        <Input
                            label="Topic Name"
                            value={newTopic.name}
                            onChange={e =>
                                setNewTopic({
                                    ...newTopic,
                                    name: e.target.value
                                })
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

                        <div className="flex gap-4 mt-4">
                            <Button
                                className="flex-1"
                                onClick={createTopic}
                            >
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
        </main>
    );
}
