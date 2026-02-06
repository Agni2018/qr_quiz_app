'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import ThemeToggle from '@/components/ThemeToggle';
import BadgeManagement from '@/components/BadgeManagement';
import ReusableLibrary from '@/components/ReusableLibrary';
import {
    FaPlus,
    FaArrowRight,
    FaTrash,
    FaSignOutAlt,
    FaBars,
    FaTimes,
    FaCopy
} from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function UserDashboard() {
    const [topics, setTopics] = useState<any[]>([]);
    const [analytics, setAnalytics] = useState<any>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [activeView, setActiveView] = useState<'analytics' | 'manage' | 'reusable' | 'badges'>('analytics');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [newTopic, setNewTopic] = useState({
        name: '',
        description: '',
        timeLimit: 0,
        negativeMarking: 0,
        timeBasedScoring: false
    });

    // Participants Modal State
    const [showParticipantsModal, setShowParticipantsModal] = useState(false);
    const [selectedTopicName, setSelectedTopicName] = useState('');
    const [participants, setParticipants] = useState<any[]>([]);
    const [loadingParticipants, setLoadingParticipants] = useState(false);

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
        setNewTopic({
            name: '',
            description: '',
            timeLimit: 0,
            negativeMarking: 0,
            timeBasedScoring: false
        });
        refreshData();
    };

    const deleteTopic = async (id: string) => {
        const ok = confirm('Are you sure you want to delete this topic?');
        if (!ok) return;
        await api.delete(`/topics/${id}`);
        refreshData();
    };

    const copyTopic = async (id: string) => {
        const ok = confirm('Are you sure you want to duplicate this topic and all its questions?');
        if (!ok) return;
        try {
            await api.post(`/topics/${id}/copy`);
            refreshData();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to copy topic');
        }
    };

    const handleViewParticipants = async (topicId: string, topicName: string) => {
        setSelectedTopicName(topicName);
        setShowParticipantsModal(true);
        setLoadingParticipants(true);
        try {
            const res = await api.get(`/analytics/topic/${topicId}/participants`);
            setParticipants(res.data);
        } catch (err) {
            console.error(err);
            alert('Failed to load participants');
        } finally {
            setLoadingParticipants(false);
        }
    };

    if (authLoading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
                <div style={{ width: '3rem', height: '3rem', border: '4px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%' }} className="animate-spin" />
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)', color: 'var(--text-primary)' }}>

            {/* MOBILE HEADER */}
            <header style={{
                position: 'sticky',
                top: 0,
                zIndex: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.5rem',
                borderBottom: '1px solid var(--border-color)',
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(var(--blur))'
            }} className="mobile-only lg:hidden">
                <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Dashboard</h1>
                <button onClick={() => setSidebarOpen(true)} style={{ color: 'var(--text-primary)' }}>
                    <FaBars />
                </button>
            </header>

            {sidebarOpen && (
                <div
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.6)', zIndex: 40 }}
                    className="lg:hidden"
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
                        border-r
                        px-10 md:px-12 py-14 lg:py-12 lg:pt-12
                        transform transition-transform
                        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                        lg:translate-x-0
                    `}
                    style={{
                        background: 'var(--glass-bg)',
                        backdropFilter: 'blur(var(--blur))',
                        borderColor: 'var(--border-color)'
                    }}
                >
                    <button
                        className="absolute top-6 right-6 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                        style={{ color: 'var(--text-primary)' }}
                    >
                        <FaTimes />
                    </button>

                    {/* Dashboard heading - show on mobile, show on desktop too */}
                    <h1 className="text-3xl font-black mb-3">Dashboard</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '4rem' }}>Manage your quiz ecosystem</p>

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

                        <Button
                            variant={activeView === 'reusable' ? 'secondary' : 'outline'}
                            className="justify-start"
                            onClick={() => setActiveView('reusable')}
                        >
                            📚 Reusable Questions
                        </Button>

                        <Button
                            variant={activeView === 'badges' ? 'secondary' : 'outline'}
                            className="justify-start"
                            onClick={() => setActiveView('badges')}
                        >
                            🏆 Badge Management
                        </Button>
                    </div>
                </aside>

                {/* MAIN */}
                <main className="px-6 lg:pl-32 lg:pr-32 py-8 lg:py-0 lg:pt-16">
                    <div className="max-w-[1400px] flex flex-col gap-10 md:gap-20">

                        {/* TOP BAR */}
                        <div className="flex justify-end gap-4 mb-10 md:mb-20">
                            <ThemeToggle />
                            {activeView === 'manage' && (
                                <Button onClick={() => setShowModal(true)}>
                                    <FaPlus /> Create Topic
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                onClick={async () => {
                                    try {
                                        await api.post('/auth/logout');
                                    } catch (err) {
                                        console.error('Logout error:', err);
                                    }
                                    localStorage.clear();
                                    // Force a full page reload to clear memory and BFCache
                                    window.location.href = '/';
                                }}
                            >
                                <FaSignOutAlt /> Logout
                            </Button>
                        </div>

                        {/* ANALYTICS VIEW */}
                        {activeView === 'analytics' && analytics && (
                            <section className="flex flex-col gap-10 md:gap-16">

                                {/* Analytics Heading */}
                                <h2 style={{
                                    fontSize: '2.75rem',
                                    fontWeight: 900,
                                    letterSpacing: '-0.03em',
                                    marginBottom: '0.75rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    color: 'var(--text-primary)'
                                }}>
                                    <span style={{ fontSize: '1.5rem', opacity: 0.8 }}>📊</span>
                                    <span style={{
                                        backgroundImage: 'linear-gradient(to right, var(--primary), var(--accent), var(--secondary))',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                    }}>
                                        Analytics Overview
                                    </span>
                                </h2>

                                {/* Active Topics Card */}
                                <Card className="relative overflow-hidden p-10 rounded-3xl border shadow-2xl hover:shadow-primary/30 transition-all transform hover:-translate-y-2 group" style={{ borderColor: 'var(--border-color)', background: 'var(--card-bg)' }}>
                                    {/* Decorator Gradient */}
                                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary opacity-10 blur-[100px] group-hover:opacity-20 transition-opacity" />

                                    <div className="flex justify-between items-center relative z-10">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xl shadow-inner border border-primary/20">
                                                    <FaBars />
                                                </div>
                                                <span style={{ fontSize: '1.5rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '-0.02em' }}>
                                                    Active Topics
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted opacity-70">Currently published quiz categories</p>
                                        </div>
                                        <div className="text-right">
                                            <span style={{ fontSize: '5rem', fontWeight: 900, background: 'linear-gradient(135deg, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} className="drop-shadow-2xl">
                                                {topics.length === 0 ? '0' : analytics.activeTopics}
                                            </span>
                                        </div>
                                    </div>
                                </Card>

                                {/* Topic Performance */}
                                <div className="flex flex-col gap-14 mt-28">
                                    <div className="flex flex-col gap-8">
                                        <div className="flex items-center gap-6">
                                            <div style={{
                                                width: '4.5rem',
                                                height: '4.5rem',
                                                borderRadius: '1.25rem',
                                                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '2.25rem',
                                                boxShadow: '0 8px 30px rgba(99, 102, 241, 0.4)',
                                                border: '1px solid rgba(255, 255, 255, 0.1)'
                                            }}>
                                                📈
                                            </div>
                                            <div className="flex flex-col">
                                                <h3 style={{
                                                    fontSize: '2.75rem',
                                                    fontWeight: 900,
                                                    letterSpacing: '-0.04em',
                                                    backgroundImage: 'linear-gradient(to right, var(--text-primary), var(--primary), var(--accent), var(--secondary))',
                                                    WebkitBackgroundClip: 'text',
                                                    WebkitTextFillColor: 'transparent',
                                                    backgroundClip: 'text',
                                                    lineHeight: 1
                                                }}>
                                                    Topic Performance
                                                </h3>
                                                <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem', marginTop: '0.6rem', fontWeight: 500 }}>
                                                    Detailed analytics for each available quiz category
                                                </p>
                                            </div>
                                        </div>
                                        <div style={{
                                            width: '100%',
                                            height: '1px',
                                            background: 'linear-gradient(to right, var(--border-color), transparent)',
                                            opacity: 0.5
                                        }} />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                                        {analytics.topicStats.map((stat: any) => (
                                            <Card
                                                key={stat.topicId}
                                                className="group p-8 rounded-[2rem] border shadow-lg hover:shadow-primary/20 transition-all transform hover:-translate-y-2 relative overflow-hidden flex flex-col gap-6"
                                                style={{ borderColor: 'var(--border-color)', background: 'var(--card-bg)' }}
                                            >
                                                {/* Card Accent */}
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-3xl rounded-full translate-x-12 -translate-y-12" />

                                                <div className="flex items-start justify-between relative z-10">
                                                    <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary text-2xl border border-secondary/20 shadow-sm">
                                                        📦
                                                    </div>
                                                    <div className="h-2 w-16 bg-border-color rounded-full overflow-hidden mt-5">
                                                        <div className="h-full bg-primary" style={{ width: '60%' }} />
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-1 relative z-10">
                                                    <h4 style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }} className="truncate">
                                                        {stat.topicName}
                                                    </h4>
                                                    <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontWeight: 600 }}>
                                                        Topic Metrics
                                                    </p>
                                                </div>

                                                <div className="flex items-end justify-between mt-4 relative z-10">
                                                    <div className="flex flex-col">
                                                        <span style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary)', lineHeight: 1 }}>
                                                            {stat.participantCount}
                                                        </span>
                                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Total Participants</span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleViewParticipants(stat.topicId, stat.topicName)}
                                                        className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-sm shadow-lg group-hover:scale-110 transition-transform cursor-pointer hover:bg-primary/80"
                                                    >
                                                        <FaArrowRight />
                                                    </button>
                                                </div>

                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* MANAGE VIEW */}
                        {activeView === 'manage' && (
                            <section className="flex flex-col gap-10 md:gap-16">
                                <h2 style={{
                                    fontSize: '2.75rem',
                                    fontWeight: 900,
                                    letterSpacing: '-0.03em',
                                    marginBottom: '2rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    color: 'var(--text-primary)'
                                }}>
                                    <span style={{ fontSize: '1.5rem', opacity: 0.8 }}>🎓</span>
                                    <span style={{
                                        backgroundImage: 'linear-gradient(to right, var(--primary), var(--secondary))',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                    }}>
                                        Manage Topics
                                    </span>
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                                    {topics.map(topic => {
                                        const isActive = topic.status === 'active';

                                        return (
                                            <Card
                                                key={topic._id}
                                                className={`
                                                    p-8 rounded-3xl border flex flex-col shadow-lg hover:shadow-purple-500/40 transform hover:-translate-y-1 transition-all
                                                    ${isActive ? '' : 'opacity-90'}
                                                `}
                                                style={{
                                                    borderColor: isActive ? 'var(--border-color)' : 'var(--danger)',
                                                    background: isActive ? 'var(--card-bg)' : 'rgba(239, 68, 68, 0.05)'
                                                }}
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <h3 className="font-semibold text-lg">{topic.name}</h3>
                                                    <span
                                                        className="text-xs px-3 py-1 rounded-full"
                                                        style={{
                                                            background: isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                            color: isActive ? '#10b981' : '#ef4444'
                                                        }}
                                                    >
                                                        {isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>

                                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>{topic.description}</p>

                                                {/* Advanced Stats */}
                                                <div className="flex gap-4 mb-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                                    {topic.timeLimit > 0 && <span>⏱️ {topic.timeLimit}s</span>}
                                                    {topic.negativeMarking > 0 && <span>❌ -{topic.negativeMarking} pts</span>}
                                                    {topic.timeBasedScoring && <span>⚡ Bonus ON</span>}
                                                </div>

                                                <div className="flex gap-3 mt-auto">
                                                    <Link href={`/users/topic/${topic._id}`} className="flex-1">
                                                        <Button className="w-full">
                                                            Manage <FaArrowRight />
                                                        </Button>
                                                    </Link>

                                                    <Button variant="outline" onClick={() => copyTopic(topic._id)} title="Duplicate Topic">
                                                        <FaCopy />
                                                    </Button>

                                                    <Button variant="danger" onClick={() => deleteTopic(topic._id)} title="Delete Topic">
                                                        <FaTrash />
                                                    </Button>
                                                </div>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </section>
                        )}

                        {/* REUSABLE QUESTIONS VIEW */}
                        {activeView === 'reusable' && (
                            <section className="flex flex-col gap-10 md:gap-16">
                                <h2 style={{
                                    fontSize: '2.75rem',
                                    fontWeight: 900,
                                    letterSpacing: '-0.03em',
                                    marginBottom: '0.75rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1.5rem',
                                    color: 'var(--text-primary)'
                                }}>
                                    <span style={{
                                        width: '4rem',
                                        height: '4rem',
                                        borderRadius: '1.25rem',
                                        background: 'linear-gradient(135deg, #3b82f6, #10b981)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.75rem',
                                        boxShadow: '0 8px 30px rgba(59, 130, 246, 0.4)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)'
                                    }}>
                                        📚
                                    </span>
                                    <span style={{
                                        backgroundImage: 'linear-gradient(to right, #3b82f6, #10b981)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                    }}>
                                        Reusable Questions
                                    </span>
                                </h2>
                                <ReusableLibrary />
                            </section>
                        )}

                        {/* BADGES VIEW */}
                        {activeView === 'badges' && (
                            <section className="flex flex-col gap-10 md:gap-16">
                                <h2 style={{
                                    fontSize: '2.75rem',
                                    fontWeight: 900,
                                    letterSpacing: '-0.03em',
                                    marginBottom: '0.75rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1.5rem',
                                    color: 'var(--text-primary)'
                                }}>
                                    <span style={{
                                        width: '4rem',
                                        height: '4rem',
                                        borderRadius: '1.25rem',
                                        background: 'linear-gradient(135deg, #f59e0b, #ec4899)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.75rem',
                                        boxShadow: '0 8px 30px rgba(245, 158, 11, 0.4)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)'
                                    }}>
                                        🏆
                                    </span>
                                    <span style={{
                                        backgroundImage: 'linear-gradient(to right, #f59e0b, #ec4899)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                    }}>
                                        Badge Management
                                    </span>
                                </h2>
                                <BadgeManagement />
                            </section>
                        )}
                    </div>
                </main>
            </div >

            {/* CREATE TOPIC MODAL */}
            {
                showModal && (
                    <div
                        className="fixed inset-0 z-50 backdrop-blur flex items-start md:items-center justify-center px-6 pt-20 md:pt-0"
                        style={{ background: 'rgba(0, 0, 0, 0.8)' }}
                        onClick={() => setShowModal(false)}
                    >
                        <Card
                            noGlass
                            className="w-full max-w-md p-8 rounded-3xl"
                            style={{ background: 'var(--background)' }}
                            onClick={e => e.stopPropagation()}
                        >
                            <h2 className="text-2xl font-black mb-6">New Topic</h2>

                            <div className="flex flex-col gap-8">
                                <Input
                                    label="Topic Name"
                                    placeholder="Enter topic name..."
                                    value={newTopic.name}
                                    onChange={e => setNewTopic({ ...newTopic, name: e.target.value })}
                                />

                                <Input
                                    label="Description"
                                    placeholder="Enter topic description..."
                                    value={newTopic.description}
                                    onChange={e =>
                                        setNewTopic({ ...newTopic, description: e.target.value })
                                    }
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Time Limit (sec)"
                                        type="number"
                                        value={newTopic.timeLimit}
                                        onChange={e => setNewTopic({ ...newTopic, timeLimit: Number(e.target.value) })}
                                    />
                                    <Input
                                        label="Negative Mark"
                                        type="number"
                                        value={newTopic.negativeMarking}
                                        onChange={e => setNewTopic({ ...newTopic, negativeMarking: Number(e.target.value) })}
                                    />
                                </div>

                                <div
                                    onClick={() => setNewTopic({ ...newTopic, timeBasedScoring: !newTopic.timeBasedScoring })}
                                    className={`
                                    p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between
                                    ${newTopic.timeBasedScoring ? 'bg-primary/20 border-primary' : 'bg-black/20 border-white/10'}
                                `}
                                >
                                    <span className="text-sm font-bold">Time-based Scoring</span>
                                    <div className={`w-10 h-5 rounded-full relative ${newTopic.timeBasedScoring ? 'bg-primary' : 'bg-slate-700'}`}>
                                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${newTopic.timeBasedScoring ? 'right-1' : 'left-1'}`} />
                                    </div>
                                </div>
                            </div>

                            {/* Spacer to prevent sticking */}
                            <div style={{ height: '2rem' }} />

                            <div className="flex gap-4">
                                <Button className="flex-1" onClick={createTopic}>
                                    Create Topic
                                </Button>
                                <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
                                    Cancel
                                </Button>
                            </div>



                        </Card>
                    </div>
                )
            }

            {/* PARTICIPANTS MODAL */}
            {
                showParticipantsModal && (
                    <div
                        className="fixed inset-0 z-[100] backdrop-blur-md flex items-start md:items-center justify-center px-4 pt-20 md:pt-0"
                        style={{ background: 'rgba(0, 0, 0, 0.7)' }}
                        onClick={() => setShowParticipantsModal(false)}
                    >
                        <Card
                            noGlass
                            className="w-full max-w-3xl p-0 rounded-[2rem] overflow-hidden flex flex-col max-h-[80vh] shadow-2xl animate-in zoom-in-95 duration-200"
                            style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="p-8 pb-4 border-b border-white/5 bg-gradient-to-r from-primary/5 to-transparent">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-3xl font-black tracking-tight flex items-center gap-3 text-white">
                                        <span className="text-primary">👥</span>
                                        {selectedTopicName}
                                    </h3>
                                    <button onClick={() => setShowParticipantsModal(false)} className="text-slate-400 hover:text-white transition-colors">
                                        <FaTimes size={24} />
                                    </button>
                                </div>
                                <p className="text-slate-400 font-medium ml-1">
                                    Recent Participant History
                                </p>
                            </div>

                            {/* List */}
                            <div className="overflow-y-auto p-8 flex flex-col gap-4 custom-scrollbar">
                                {loadingParticipants ? (
                                    <div className="text-center py-20 text-slate-500 animate-pulse">Loading participants...</div>
                                ) : participants.length === 0 ? (
                                    <div className="text-center py-20 text-slate-500 flex flex-col items-center gap-4 opacity-50">
                                        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-3xl">📭</div>
                                        <p>No participants found yet.</p>
                                    </div>
                                ) : (
                                    participants.map((p, idx) => (
                                        <div
                                            key={idx}
                                            className="group p-5 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                                    {p.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-lg text-white">{p.name}</span>
                                                    <span className="text-xs text-slate-400 font-mono opacity-70">{p.email}</span>
                                                    <span className="text-[10px] text-slate-500 mt-1">
                                                        {new Date(p.completedAt).toLocaleDateString()} • {new Date(p.completedAt).toLocaleTimeString()}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
                                                        {p.score}
                                                    </span>
                                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2">pts</span>
                                                </div>
                                                <div className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-slate-300">
                                                    {p.answersCount} answers
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>
                    </div>
                )
            }

        </div >
    );
}
