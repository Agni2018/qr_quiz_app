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
    const [analytics, setAnalytics] = useState<any>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [activeView, setActiveView] = useState<'analytics' | 'manage'>('analytics');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [newTopic, setNewTopic] = useState({ name: '', description: '' });

    const router = useRouter();

    useEffect(() => {
        const init = async () => {
            try {
                await api.get('/auth/status');
                const [t, a] = await Promise.all([
                    api.get('/topics'),
                    api.get('/analytics/overview')
                ]);
                setTopics(t.data);
                setAnalytics(a.data);
            } catch {
                router.replace('/');
            } finally {
                setAuthLoading(false);
            }
        };
        init();
    }, []);

    const refreshData = async () => {
        const [t, a] = await Promise.all([api.get('/topics'), api.get('/analytics/overview')]);
        setTopics(t.data);
        setAnalytics(a.data);
    };

    const createTopic = async () => {
        if (!newTopic.name.trim()) return;
        await api.post('/topics', newTopic);
        setShowModal(false);
        setNewTopic({ name: '', description: '' });
        refreshData();
    };

    const deleteTopic = async (id: string) => {
        const ok = confirm('Are you sure you want to delete this topic?');
        if (!ok) return;
        await api.delete(`/topics/${id}`);
        refreshData();
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#020617]">
                <div className="w-12 h-12 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] text-white">

            {/* MOBILE HEADER */}
            <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/70 backdrop-blur">
                <h1 className="text-xl font-black">Dashboard</h1>
                <button onClick={() => setSidebarOpen(true)}>
                    <FaBars />
                </button>
            </header>

            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* GRID */}
            <div className="lg:grid lg:grid-cols-[300px_1fr] lg:gap-14">

                {/* SIDEBAR */}
                <aside
                    className={`
                        fixed lg:static top-0 left-0 z-50
                        h-screen w-[300px]
                        bg-black/90 backdrop-blur-xl
                        border-r border-white/10
                        px-10 py-14
                        transform transition-transform
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

                    <h1 className="text-3xl font-black mb-3">Dashboard</h1>
                    <p className="text-slate-400 text-sm mb-16">Manage your quiz ecosystem</p>

                    <div className="flex flex-col gap-5">
                        <Button
                            variant={activeView === 'analytics' ? 'secondary' : 'outline'}
                            className="justify-start"
                            onClick={() => setActiveView('analytics')}
                        >
                            📊 Analytics
                        </Button>

                        <Button
                            variant={activeView === 'manage' ? 'secondary' : 'outline'}
                            className="justify-start"
                            onClick={() => setActiveView('manage')}
                        >
                            🎓 Manage Topics
                        </Button>
                    </div>
                </aside>

                {/* MAIN */}
                <main className="px-8 lg:px-0 py-24">
                    <div className="max-w-[1400px] flex flex-col gap-16">

                        {/* TOP BAR */}
                        <div className="flex justify-end gap-4">
                            {activeView === 'manage' && (
                                <Button onClick={() => setShowModal(true)}>
                                    <FaPlus /> Create Topic
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                onClick={async () => {
                                    await api.post('/auth/logout');
                                    router.replace('/');
                                }}
                            >
                                <FaSignOutAlt /> Logout
                            </Button>
                        </div>

                        {/* ANALYTICS VIEW */}
                        {activeView === 'analytics' && analytics && (
                            <section className="flex flex-col gap-14">

                                {/* Analytics Heading */}
                                <h2 className="text-5xl font-extrabold text-purple-400 tracking-tight bg-gradient-to-r from-purple-400 via-indigo-500 to-purple-400 bg-clip-text text-transparent">
                                    Analytics Overview
                                </h2>

                                {/* Active Topics Card */}
                                <Card className="p-16 rounded-3xl bg-gradient-to-br from-purple-900/80 via-indigo-900/70 to-slate-950 border border-white/20 shadow-2xl hover:shadow-purple-500/50 transition-shadow transform hover:-translate-y-1">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xl text-slate-300 font-semibold">Active Topics</span>
                                        <span className="text-7xl font-extrabold text-purple-300 drop-shadow-lg">
                                            {topics.length === 0 ? 'No topics created yet' : analytics.activeTopics}
                                        </span>
                                    </div>
                                </Card>

                                {/* Topic Performance */}
                                <div className="flex flex-col gap-8">
                                    <h3 className="text-3xl font-bold text-indigo-400 tracking-wide">
                                        Topic Performance
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                                        {analytics.topicStats.map((stat: any) => (
                                            <Card
                                                key={stat.topicId}
                                                className="p-10 rounded-3xl bg-gradient-to-br from-violet-900/30 via-purple-900/20 to-black border border-white/10 shadow-lg hover:scale-105 hover:shadow-purple-400/50 transition-all transform"
                                            >
                                                <h4 className="font-semibold text-lg mb-4 text-purple-200">{stat.topicName}</h4>
                                                <p className="text-4xl font-extrabold text-purple-300 mb-2 drop-shadow-md">{stat.participantCount}</p>
                                                <p className="text-xs uppercase tracking-wide text-slate-400">Participants</p>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* MANAGE VIEW */}
                        {activeView === 'manage' && (
                            <section className="flex flex-col gap-12">
                                <h2 className="text-5xl font-black">Manage Topics</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                                    {topics.map(topic => {
                                        const isActive = topic.status === 'active';

                                        return (
                                            <Card
                                                key={topic._id}
                                                className={`
                                                    p-8 rounded-3xl border flex flex-col
                                                    ${isActive
                                                        ? 'bg-white/[0.05] border-white/10 shadow-lg hover:shadow-purple-500/40 transform hover:-translate-y-1 transition-all'
                                                        : 'bg-red-500/5 border-red-500/30 opacity-90 shadow-sm'}
                                                `}
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <h3 className="font-semibold text-lg">{topic.name}</h3>
                                                    <span
                                                        className={`
                                                            text-xs px-3 py-1 rounded-full
                                                            ${isActive
                                                                ? 'bg-emerald-500/10 text-emerald-400'
                                                                : 'bg-red-500/10 text-red-400'}
                                                        `}
                                                    >
                                                        {isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>

                                                <p className="text-slate-400 text-sm leading-relaxed mb-6">{topic.description}</p>

                                                <div className="flex gap-3 mt-auto">
                                                    <Link href={`/users/topic/${topic._id}`} className="flex-1">
                                                        <Button className="w-full">
                                                            Manage <FaArrowRight />
                                                        </Button>
                                                    </Link>

                                                    <Button variant="danger" onClick={() => deleteTopic(topic._id)}>
                                                        <FaTrash />
                                                    </Button>
                                                </div>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </section>
                        )}
                    </div>
                </main>
            </div>

            {/* CREATE TOPIC MODAL */}
            {showModal && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 backdrop-blur flex items-center justify-center px-6"
                    onClick={() => setShowModal(false)}
                >
                    <Card
                        noGlass
                        className="w-full max-w-md p-8 rounded-3xl bg-[#020617]"
                        onClick={e => e.stopPropagation()}
                    >
                        <h2 className="text-2xl font-black mb-6">New Topic</h2>

                        <Input
                            label="Topic Name"
                            value={newTopic.name}
                            onChange={e => setNewTopic({ ...newTopic, name: e.target.value })}
                        />

                        <Input
                            label="Description"
                            value={newTopic.description}
                            onChange={e =>
                                setNewTopic({ ...newTopic, description: e.target.value })
                            }
                        />

                        <div className="flex gap-4 mt-8">
                            <Button className="flex-1" onClick={createTopic}>
                                Create
                            </Button>
                            <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
                                Cancel
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
