'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import TextArea from '@/components/TextArea';
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
    FaCopy,
    FaChartPie,
    FaGraduationCap,
    FaBook,
    FaAward,
    FaUpload,
    FaFileAlt,
    FaBookOpen,
    FaDownload,
    FaVideo,
    FaEnvelope
} from 'react-icons/fa';



import { useRouter } from 'next/navigation';

export default function UserDashboard() {
    const [topics, setTopics] = useState<any[]>([]);
    const [analytics, setAnalytics] = useState<any>(null);
    const [user, setUser] = useState<any>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [activeView, setActiveView] = useState<'analytics' | 'manage' | 'reusable' | 'badges' | 'materials'>('analytics');

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [newTopic, setNewTopic] = useState({
        name: '',
        description: '',
        timeLimit: 0,
        negativeMarking: 0,
        timeBasedScoring: false
    });
    const [materials, setMaterials] = useState<any[]>([]);
    const [loadingMaterials, setLoadingMaterials] = useState(false);


    // Participants Modal State
    const [showParticipantsModal, setShowParticipantsModal] = useState(false);
    const [showCertifyModal, setShowCertifyModal] = useState(false);
    const [selectedTopicId, setSelectedTopicId] = useState('');
    const [selectedTopicName, setSelectedTopicName] = useState('');
    const [participants, setParticipants] = useState<any[]>([]);
    const [loadingParticipants, setLoadingParticipants] = useState(false);
    const [certifying, setCertifying] = useState(false);
    const [showAdminMaterialsModal, setShowAdminMaterialsModal] = useState(false);
    const [selectedTopicMaterials, setSelectedTopicMaterials] = useState<any[]>([]);
    const [sendingMessageTo, setSendingMessageTo] = useState<string | null>(null);
    const [messageText, setMessageText] = useState('');
    const [isSendingMessage, setIsSendingMessage] = useState(false);


    const router = useRouter();

    useEffect(() => {
        const init = async () => {
            try {
                const statusRes = await api.get('/auth/status');
                setUser(statusRes.data.user);

                const [t, a] = await Promise.all([
                    api.get('/topics'),
                    api.get('/analytics/overview')
                ]);
                setTopics(t.data);
                setAnalytics(a.data);

                if (statusRes.data.user) {
                    const mRes = await api.get('/study-materials');
                    setMaterials(mRes.data);
                }

            } catch {
                router.replace('/');
            } finally {
                setAuthLoading(false);
            }
        };
        init();
    }, []);

    const refreshData = async () => {
        try {
            const [t, a, m] = await Promise.all([
                api.get('/topics'),
                api.get('/analytics/overview'),
                api.get('/study-materials')
            ]);
            setTopics(t.data);
            setAnalytics(a.data);
            setMaterials(m.data);
        } catch (err) {
            console.error('Refresh error:', err);
        }
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
        setSelectedTopicId(topicId);
        setSelectedTopicName(topicName);
        setShowParticipantsModal(true);
        setLoadingParticipants(true);
        setSendingMessageTo(null);
        setMessageText('');
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

    const handleOpenCertify = async (topicId: string, topicName: string) => {
        setSelectedTopicId(topicId);
        setSelectedTopicName(topicName);
        setShowCertifyModal(true);
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

    const handleGenerateCertificates = async () => {
        setCertifying(true);
        try {
            await api.post(`/quiz/certify/${selectedTopicId}`);
            alert('Certificates generated successfully!');
            setShowCertifyModal(false);
            refreshData();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to generate certificates');
        } finally {
            setCertifying(false);
        }
    };

    const handleViewMaterials = (topicId: string, topicName: string) => {

        const topicMaterials = materials.filter(m => (m.topicId?._id || m.topicId) === topicId);
        setSelectedTopicMaterials(topicMaterials);
        setSelectedTopicName(topicName);
        setShowAdminMaterialsModal(true);
    };

    const getFileUrl = (url: string) => {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        return `${baseUrl}${url}`;
    };

    const deleteMaterial = async (id: string) => {

        if (!confirm('Are you sure you want to delete this material?')) return;
        try {
            await api.delete(`/study-materials/${id}`);
            refreshData();
        } catch (err) {
            console.error(err);
            alert('Failed to delete material');
        }
    };

    const handleSendMessage = async (recipientId: string) => {
        if (!messageText.trim()) return;
        setIsSendingMessage(true);
        try {
            await api.post('/messages', { recipientId, text: messageText });
            alert('Message sent successfully!');
            setSendingMessageTo(null);
            setMessageText('');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to send message');
        } finally {
            setIsSendingMessage(false);
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
            <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-10">

                {/* SIDEBAR */}
                <aside
                    className={`
                        fixed lg:static top-0 left-0 z-50
                        h-screen w-[280px]
                        border-r
                        px-8 py-12
                        transform transition-transform
                        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                        lg:translate-x-0
                        flex flex-col
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

                    {/* Dashboard heading */}
                    <div className="mb-2 pl-2">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-[3px] bg-gradient-to-r from-primary to-indigo-400 rounded-full" />
                            <p className="text-slate-500 text-[0.7rem] font-black uppercase tracking-[0.3em] opacity-60">Admin Portal</p>
                        </div>
                        <div className="text-3xl font-light text-slate-400 mb-2">Welcome,</div>
                        <div className="text-4xl font-black bg-gradient-to-r from-white via-indigo-400 to-primary bg-clip-text text-transparent transform -tracking-wide leading-tight">
                            {user?.username || 'Admin'}
                        </div>
                    </div>

                    <div className="h-14 lg:h-16" /> {/* Large spacer between header and options */}

                    <nav className="flex flex-col gap-4 flex-grow">
                        <Button
                            variant={activeView === 'analytics' ? 'secondary' : 'ghost'}
                            className={`justify-start gap-4 h-12 rounded-xl border-none font-bold text-lg transition-all ${activeView === 'analytics' ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                            onClick={() => { setActiveView('analytics'); setSidebarOpen(false); }}
                        >
                            <FaChartPie className={activeView === 'analytics' ? 'text-primary' : 'text-slate-400'} /> Analytics
                        </Button>

                        <Button
                            variant={activeView === 'manage' ? 'secondary' : 'ghost'}
                            className={`justify-start gap-4 h-12 rounded-xl border-none font-bold text-lg transition-all ${activeView === 'manage' ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                            onClick={() => { setActiveView('manage'); setSidebarOpen(false); }}
                        >
                            <FaGraduationCap className={activeView === 'manage' ? 'text-indigo-400' : 'text-slate-400'} /> Manage Topics
                        </Button>

                        <Button
                            variant={activeView === 'reusable' ? 'secondary' : 'ghost'}
                            className={`justify-start gap-4 h-12 rounded-xl border-none font-bold text-lg transition-all ${activeView === 'reusable' ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                            onClick={() => { setActiveView('reusable'); setSidebarOpen(false); }}
                        >
                            <FaBook className={activeView === 'reusable' ? 'text-emerald-400' : 'text-slate-400'} /> Question Bank
                        </Button>

                        <Button
                            variant={activeView === 'badges' ? 'secondary' : 'ghost'}
                            className={`justify-start gap-4 h-12 rounded-xl border-none font-bold text-lg transition-all ${activeView === 'badges' ? 'bg-amber-500/10 text-amber-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                            onClick={() => { setActiveView('badges'); setSidebarOpen(false); }}
                        >
                            <FaAward className={activeView === 'badges' ? 'text-amber-400' : 'text-slate-400'} /> Badge Rewards
                        </Button>

                        <Button
                            variant={activeView === 'materials' ? 'secondary' : 'ghost'}
                            className={`justify-start gap-4 h-12 rounded-xl border-none font-bold text-lg transition-all ${activeView === 'materials' ? 'bg-rose-500/10 text-rose-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                            onClick={() => { setActiveView('materials'); setSidebarOpen(false); }}
                        >
                            <FaUpload className={activeView === 'materials' ? 'text-rose-400' : 'text-slate-400'} /> Uploaded Files
                        </Button>

                    </nav>

                    {/* Logout at bottom */}
                    <div className="mt-auto pt-6 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 h-12 text-slate-400 hover:text-white hover:bg-white/5 border-none"
                            onClick={async () => {
                                try {
                                    await api.post('/auth/logout');
                                } catch (err) {
                                    console.error('Logout error:', err);
                                }
                                localStorage.clear();
                                window.location.href = '/';
                            }}
                        >
                            <FaSignOutAlt /> Logout
                        </Button>
                    </div>
                </aside>

                {/* MAIN */}
                <main className="px-8 lg:px-16 py-8 lg:pt-20 lg:pb-12 overflow-y-auto max-h-screen w-full">
                    <div className="max-w-[1400px] mx-auto">

                        {/* TOP BAR */}
                        <div className="flex justify-between items-center mb-12">
                            {/* Current View Heading in Top Bar */}
                            <div>
                                {/* Headings removed from top bar to avoid duplication with page content headers */}
                            </div>

                            <div className="flex items-center gap-4">
                                <ThemeToggle />
                                <div className="h-6 w-[1px] bg-white/10 mx-2" />
                                {activeView === 'manage' && (
                                    <Button onClick={() => setShowModal(true)} className="rounded-xl px-6 h-11 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                                        <FaPlus className="mr-2" /> Create Topic
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* ANALYTICS VIEW */}
                        {activeView === 'analytics' && analytics && (
                            <section className="flex flex-col gap-10 md:gap-16">

                                {/* Analytics Heading */}
                                {/* Analytics Heading */}
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
                                        Analytics
                                    </span>
                                </h2>

                                {/* Active Topics Card */}
                                <Card className="p-10 rounded-[2.5rem] border-none shadow-2xl relative overflow-hidden group" style={{ background: 'linear-gradient(135deg, var(--card-bg), rgba(99, 102, 241, 0.1))' }}>
                                    <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-opacity transform rotate-12 translate-x-4 -translate-y-4">
                                        <FaBars size={180} />
                                    </div>
                                    <div className="flex items-center justify-between relative z-10">
                                        <div className="flex flex-col gap-2">
                                            <span className="text-lg font-bold uppercase tracking-widest text-[#6366f1] opacity-90">Active Topics</span>
                                            <span className="text-sm font-medium text-slate-400">Currently live quizzes</span>
                                        </div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 drop-shadow-sm">
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
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleOpenCertify(stat.topicId, stat.topicName)}
                                                            className="px-3 py-2 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-500 text-xs font-bold transition-all border border-green-500/20"
                                                        >
                                                            Certify
                                                        </button>
                                                        <button
                                                            onClick={() => handleViewParticipants(stat.topicId, stat.topicName)}
                                                            className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-sm shadow-lg group-hover:scale-110 transition-transform cursor-pointer hover:bg-primary/80"
                                                        >
                                                            <FaArrowRight />
                                                        </button>
                                                    </div>
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
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {topics.map(topic => {
                                        const isActive = topic.status === 'active';

                                        return (
                                            <Card
                                                key={topic._id}
                                                className="p-7 rounded-[2.5rem] border-none shadow-lg hover:shadow-primary/10 transition-all group flex flex-col gap-5"
                                                style={{ background: 'var(--card-bg)' }}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <h3 className="font-bold text-2xl tracking-tight">{topic.name}</h3>
                                                    <span
                                                        className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full"
                                                        style={{
                                                            background: isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                            color: isActive ? '#10b981' : '#ef4444'
                                                        }}
                                                    >
                                                        {isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>

                                                <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">
                                                    {topic.description || "No description provided for this quiz topic."}
                                                </p>

                                                <div className="flex gap-4 items-center mb-2">
                                                    {topic.timeLimit > 0 && (
                                                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 bg-white/5 px-2.5 py-1 rounded-lg">
                                                            ⏱️ {topic.timeLimit}s
                                                        </div>
                                                    )}
                                                    {topic.negativeMarking > 0 && (
                                                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 bg-white/5 px-2.5 py-1 rounded-lg">
                                                            ❌ -{topic.negativeMarking}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-3 mt-auto w-full">
                                                    <Link href={`/users/topic/${topic._id}`} className="flex-grow min-w-0">
                                                        <Button className="w-full justify-between h-12 px-6 rounded-2xl bg-[#6366f1] hover:bg-[#4f46e5] text-white font-bold transition-all shadow-lg shadow-indigo-500/20">
                                                            Manage <FaArrowRight />
                                                        </Button>
                                                    </Link>

                                                    <Button
                                                        variant="ghost"
                                                        className="h-12 px-4 rounded-2xl bg-white/5 hover:bg-white/10 border-none flex items-center justify-center shrink-0 gap-2"
                                                        onClick={() => copyTopic(topic._id)}
                                                        title="Duplicate Topic"
                                                    >
                                                        <FaCopy className="text-slate-400 group-hover:text-white transition-colors" />
                                                        <span className="text-xs font-bold text-slate-400">Copy</span>
                                                    </Button>

                                                    <Button
                                                        variant="ghost"
                                                        className="h-12 px-4 rounded-2xl bg-white/5 hover:bg-white/10 border-none flex items-center justify-center shrink-0 gap-2"
                                                        onClick={() => deleteTopic(topic._id)}
                                                        title="Delete Topic"
                                                    >
                                                        <FaTrash className="text-red-500 group-hover:text-red-400 transition-colors" />
                                                        <span className="text-xs font-bold text-red-500">Del</span>
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

                        {/* STUDY MATERIALS VIEW */}
                        {activeView === 'materials' && (
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
                                        background: 'linear-gradient(135deg, #f43f5e, #fb7185)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.75rem',
                                        boxShadow: '0 8px 30px rgba(244, 63, 94, 0.4)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)'
                                    }}>
                                        📁
                                    </span>
                                    <span style={{
                                        backgroundImage: 'linear-gradient(to right, #f43f5e, #fb7185)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                    }}>
                                        Uploaded Study Materials
                                    </span>
                                </h2>

                                {materials.length === 0 ? (
                                    <Card className="p-20 text-center bg-slate-950/40 border-dashed border-2 border-white/5 rounded-[40px]">
                                        <div className="w-24 h-24 bg-slate-900 rounded-[2rem] flex items-center justify-center mx-auto mb-10 text-5xl">📂</div>
                                        <h3 className="text-3xl font-black mb-4">No materials uploaded yet</h3>
                                        <p className="text-slate-500 mb-8 max-w-md mx-auto">Upload materials through individual topic settings to help your students.</p>
                                        <Button onClick={() => setActiveView('manage')} className="px-10 py-4 rounded-2xl bg-primary">Go to Manage Topics</Button>
                                    </Card>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                        {topics.filter(t => materials.some(m => (m.topicId?._id || m.topicId) === t._id)).map((topic) => (
                                            <Card
                                                key={topic._id}
                                                className="p-10 group hover:-translate-y-3 transition-all duration-500 border-white/5 bg-slate-950/40 hover:bg-slate-900/60 rounded-[2.5rem] flex flex-col h-full shadow-2xl overflow-hidden relative"
                                            >
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/20 transition-all duration-700" />
                                                <div className="flex justify-between items-start mb-8 relative z-10">
                                                    <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center text-3xl text-rose-500 border border-rose-500/20 group-hover:rotate-12 transition-all">
                                                        <FaBookOpen />
                                                    </div>
                                                    <span className="bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-rose-500/10">
                                                        {materials.filter(m => (m.topicId?._id || m.topicId) === topic._id).length} Items
                                                    </span>
                                                </div>
                                                <h3 className="text-3xl font-black mb-4 group-hover:text-rose-400 transition-colors relative z-10">{topic.name}</h3>
                                                <p className="text-slate-500 text-lg mb-10 line-clamp-2 leading-relaxed flex-1 relative z-10">{topic.description || "Manage the study resources for this specific topic."}</p>
                                                <Button
                                                    onClick={() => handleViewMaterials(topic._id, topic.name)}
                                                    className="w-full py-5 rounded-2xl bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white font-black uppercase tracking-widest text-xs transition-all border border-rose-500/20 relative z-10"
                                                >
                                                    View & Manage
                                                </Button>
                                            </Card>
                                        ))}
                                    </div>
                                )}

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
                            className="w-full max-w-4xl p-0 rounded-3xl overflow-hidden flex flex-col max-h-[85vh] shadow-2xl"
                            style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-900/40">
                                <div>
                                    <h3 className="text-2xl font-black tracking-tight">{selectedTopicName}</h3>
                                    <p className="text-slate-500 font-medium">Participants Review</p>
                                </div>
                                <button
                                    onClick={() => setShowParticipantsModal(false)}
                                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <div className="overflow-y-auto p-8 custom-scrollbar">
                                {loadingParticipants ? (
                                    <div className="text-center py-20 text-slate-500 flex flex-col items-center gap-4">
                                        <div className="w-8 h-8 border-2 border-slate-700 border-t-primary rounded-full animate-spin" />
                                        <p className="font-bold">Loading participants...</p>
                                    </div>
                                ) : participants.length === 0 ? (
                                    <div className="text-center py-20 text-slate-500 italic">No participants yet for this topic.</div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {participants.map((p, idx) => (
                                            <React.Fragment key={idx}>
                                                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-all">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg shadow-inner">
                                                            {p.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-white">{p.name}</span>
                                                            <span className="text-xs text-slate-500 font-mono italic">{p.email || p.phone}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex flex-col items-end">
                                                            <span className="text-2xl font-black text-primary group-hover:scale-110 transition-transform">{p.score}</span>
                                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Points</span>
                                                        </div>
                                                        {p.userId && (
                                                            <button
                                                                onClick={() => setSendingMessageTo(sendingMessageTo === p.userId ? null : p.userId)}
                                                                className="w-10 h-10 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-all ml-2"
                                                                title="Send Message"
                                                            >
                                                                <FaEnvelope />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                {p.userId && sendingMessageTo === p.userId && (
                                                    <div
                                                        className="md:col-span-2 p-6 rounded-2xl bg-primary/5 border border-primary/20 animate-in slide-in-from-top-4 duration-300"
                                                        onClick={e => e.stopPropagation()}
                                                    >
                                                        <TextArea
                                                            className="!p-8 !px-10 !rounded-[2rem] bg-black/30 border-2 border-white/5 !min-h-[160px] hover:border-white/10"
                                                            placeholder={`Write a message to ${p.name}...`}
                                                            value={messageText}
                                                            onChange={e => setMessageText(e.target.value)}
                                                        />
                                                        <div className="flex justify-end gap-3 mt-4">
                                                            <Button
                                                                variant="ghost"
                                                                className="h-10 px-6 rounded-xl text-slate-400 hover:text-white"
                                                                onClick={(e) => { e.stopPropagation(); setSendingMessageTo(null); }}
                                                            >
                                                                Cancel
                                                            </Button>
                                                            <Button
                                                                className="h-10 px-8 rounded-xl bg-primary"
                                                                onClick={(e) => { e.stopPropagation(); handleSendMessage(p.userId); }}
                                                                disabled={isSendingMessage || !messageText.trim()}
                                                            >
                                                                {isSendingMessage ? 'Sending...' : 'Send Message'}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div >
                )
            }

            {/* CERTIFY MODAL */}
            {
                showCertifyModal && (
                    <div
                        className="fixed inset-0 z-[100] backdrop-blur-md flex items-start md:items-center justify-center px-4 pt-20 md:pt-0"
                        style={{ background: 'rgba(0, 0, 0, 0.7)' }}
                        onClick={() => setShowCertifyModal(false)}
                    >
                        <Card
                            noGlass
                            className="w-full max-w-4xl p-0 rounded-[2.5rem] overflow-hidden flex flex-col max-h-[85vh] shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-200"
                            style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="p-10 pb-6 border-b border-white/5 bg-gradient-to-r from-green-500/10 to-transparent">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center text-3xl shadow-lg border border-green-500/30">
                                            📜
                                        </div>
                                        <div>
                                            <h3 className="text-3xl font-black tracking-tight text-white leading-tight">
                                                Certify Students
                                            </h3>
                                            <p className="text-slate-400 font-medium">{selectedTopicName}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowCertifyModal(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                                        <FaTimes size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-grow overflow-hidden flex flex-col">
                                <div className="p-10 py-6 bg-white/5 border-b border-white/5">
                                    <p className="text-lg text-slate-300 font-medium">
                                        {participants.filter(p => !p.isCertified && p.correctAnswersCount > 0).length > 0
                                            ? `Are you sure you want to generate certificates for these students? (Only those with at least 1 correct answer)`
                                            : `All students who attempted this quiz and qualified have already been certified.`}
                                    </p>
                                </div>

                                <div className="overflow-y-auto p-10 flex flex-col gap-6 custom-scrollbar">
                                    {loadingParticipants ? (
                                        <div className="text-center py-24 text-slate-500 flex flex-col items-center gap-6">
                                            <div className="w-12 h-12 border-4 border-slate-700 border-t-green-500 rounded-full animate-spin" />
                                            <p className="text-xl font-bold tracking-tight">Fetching participant data...</p>
                                        </div>
                                    ) : participants.filter(p => !p.isCertified).length === 0 ? (
                                        <div className="text-center py-24 text-slate-500 flex flex-col items-center gap-6 opacity-60">
                                            <div className="w-20 h-20 rounded-[2rem] bg-slate-800 flex items-center justify-center text-5xl shadow-inner">✅</div>
                                            <div className="flex flex-col gap-2">
                                                <p className="text-2xl font-black text-white">All Caught Up!</p>
                                                <p className="text-slate-400">All students who attempted the quiz have been certified.</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {participants.filter(p => !p.isCertified).map((p, idx) => {
                                                const isQualified = p.correctAnswersCount > 0;
                                                return (
                                                    <div
                                                        key={idx}
                                                        className={`p-6 rounded-2xl border transition-all flex items-center justify-between ${isQualified ? 'bg-green-500/5 border-green-500/20' : 'bg-slate-500/5 border-white/5 opacity-60'}`}
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg bg-gradient-to-br ${isQualified ? 'from-green-400 to-emerald-600' : 'from-slate-500 to-slate-700'}`}>
                                                                {p.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-lg text-white">{p.name}</span>
                                                                <span className="text-xs text-slate-400 font-mono italic">{isQualified ? 'Qualified' : 'Not Qualified (0 correct)'}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col items-end">
                                                            <span className={`text-2xl font-black ${isQualified ? 'text-green-400' : 'text-slate-500'}`}>
                                                                {p.correctAnswersCount}
                                                            </span>
                                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Correct</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-10 pt-6 border-t border-white/5 bg-slate-900/50 flex gap-4">
                                <Button
                                    className="flex-1 h-14 text-lg bg-green-600 hover:bg-green-500 shadow-xl shadow-green-900/20 rounded-2xl disabled:opacity-50"
                                    onClick={handleGenerateCertificates}
                                    disabled={certifying || participants.filter(p => !p.isCertified && p.correctAnswersCount > 0).length === 0}
                                >
                                    {certifying ? 'Generating...' : 'Generate Certificates'}
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex-1 h-14 text-lg border-white/10 hover:bg-white/5 rounded-2xl"
                                    onClick={() => setShowCertifyModal(false)}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </Card>
                    </div>
                )
            }

            {/* ADMIN STUDY MATERIALS MODAL */}
            {
                showAdminMaterialsModal && (
                    <div className="fixed inset-0 z-[400] flex items-center justify-center p-6 bg-black/90 backdrop-blur-2xl animate-fade-in" onClick={() => setShowAdminMaterialsModal(false)}>
                        <Card className="max-w-4xl w-full p-0 bg-[#0f172a] border-white/10 shadow-3xl rounded-[3rem] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                            <div className="p-10 border-b border-white/5 bg-slate-900/40 flex justify-between items-center">
                                <div>
                                    <h3 className="text-3xl font-black text-white">{selectedTopicName}</h3>
                                    <p className="text-rose-400 font-bold text-sm mt-1 uppercase tracking-widest">Study Resource Management</p>
                                </div>
                                <button onClick={() => setShowAdminMaterialsModal(false)} className="p-3 bg-white/5 hover:bg-red-500/20 hover:text-red-500 rounded-2xl transition-all text-slate-400">
                                    <FaTimes size={20} />
                                </button>
                            </div>
                            <div className="p-10 max-h-[60vh] overflow-y-auto custom-scrollbar flex flex-col gap-6">
                                {selectedTopicMaterials.length === 0 ? (
                                    <p className="text-center py-20 text-slate-500 font-bold italic">No materials found for this topic.</p>
                                ) : (
                                    selectedTopicMaterials.map((m) => (
                                        <div key={m._id} className="p-6 rounded-3xl bg-white/5 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-white/10 transition-all group">
                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 text-3xl border border-rose-500/20">
                                                    {m.fileType?.startsWith('video/') ? <FaVideo /> : <FaFileAlt />}
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <h4 className="text-xl font-black text-white group-hover:text-rose-400 transition-colors uppercase tracking-tight">{m.name}</h4>
                                                    {m.description && <p className="text-slate-400 text-sm italic">"{m.description}"</p>}
                                                    <span className="text-[0.6rem] font-black uppercase tracking-widest text-slate-600 mt-2">
                                                        {m.fileType?.split('/')[1]?.toUpperCase() || 'FILE'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex gap-4 w-full md:w-auto">
                                                <a href={getFileUrl(m.fileUrl)} target="_blank" rel="noopener noreferrer" className="flex-1 md:flex-none">
                                                    <Button className="w-full md:px-10 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-black border-none flex items-center gap-3">
                                                        View Material
                                                    </Button>
                                                </a>
                                                <Button
                                                    onClick={() => deleteMaterial(m._id)}
                                                    className="w-full md:px-6 py-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 font-black border-none"
                                                >
                                                    <FaTrash />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="p-8 bg-slate-900/20 border-t border-white/5 flex justify-center">
                                <p className="text-slate-500 text-xs font-medium uppercase tracking-widest text-center">
                                    Admins can manage and delete materials. Students can download these for learning.
                                </p>
                            </div>
                        </Card>
                    </div>
                )
            }
        </div >
    );
}

