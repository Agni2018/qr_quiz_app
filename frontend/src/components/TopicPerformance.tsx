'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Card from '@/components/Card';
import Button from '@/components/Button';
import TextArea from '@/components/TextArea';
import {
    FaArrowRight,
    FaBars,
    FaTimes,
    FaCheckCircle,
    FaAward,
    FaEnvelope,
    FaSearch,
    FaChartLine
} from 'react-icons/fa';
import AlertModal from '@/components/AlertModal';

export default function TopicPerformance() {
    const [topics, setTopics] = useState<any[]>([]);
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modals State
    const [showParticipantsModal, setShowParticipantsModal] = useState(false);
    const [showCertifyModal, setShowCertifyModal] = useState(false);
    const [selectedTopicId, setSelectedTopicId] = useState('');
    const [selectedTopicName, setSelectedTopicName] = useState('');
    const [participants, setParticipants] = useState<any[]>([]);
    const [passingMarks, setPassingMarks] = useState(0);
    const [loadingParticipants, setLoadingParticipants] = useState(false);
    const [certifying, setCertifying] = useState(false);
    const [sendingMessageTo, setSendingMessageTo] = useState<string | null>(null);
    const [messageSuccessTo, setMessageSuccessTo] = useState<string | null>(null);
    const [messageText, setMessageText] = useState('');
    const [isSendingMessage, setIsSendingMessage] = useState(false);

    const [alertModal, setAlertModal] = useState({ isOpen: false, message: '', type: 'info' as 'success' | 'error' | 'info' });

    const fetchData = async () => {
        try {
            const [t, a] = await Promise.all([
                api.get('/topics'),
                api.get('/analytics/overview')
            ]);
            setTopics(t.data);
            setAnalytics(a.data);
        } catch (err) {
            console.error('Fetch analytics error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleViewParticipants = async (topicId: string, topicName: string) => {
        setSelectedTopicId(topicId);
        setSelectedTopicName(topicName);
        setShowParticipantsModal(true);
        setLoadingParticipants(true);
        setSendingMessageTo(null);
        setMessageText('');
        try {
            const res = await api.get(`/analytics/topic/${topicId}/participants`);
            setParticipants(res.data.participants);
            setPassingMarks(res.data.passingMarks);
        } catch (err) {
            console.error(err);
            setAlertModal({ isOpen: true, message: 'Failed to load participants', type: 'error' });
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
            setParticipants(res.data.participants);
            setPassingMarks(res.data.passingMarks);
        } catch (err) {
            console.error(err);
            setAlertModal({ isOpen: true, message: 'Failed to load participants', type: 'error' });
        } finally {
            setLoadingParticipants(false);
        }
    };

    const handleGenerateCertificates = async () => {
        setCertifying(true);
        try {
            await api.post(`/quiz/certify/${selectedTopicId}`);
            setAlertModal({ isOpen: true, message: 'Certificates generated successfully!', type: 'success' });
            setShowCertifyModal(false);
            fetchData();
        } catch (err: any) {
            setAlertModal({ isOpen: true, message: err.response?.data?.message || 'Failed to generate certificates', type: 'error' });
        } finally {
            setCertifying(false);
        }
    };

    const handleSendMessage = async (recipientId: string, pId: string) => {
        if (!messageText.trim()) return;
        setIsSendingMessage(true);
        try {
            await api.post('/messages', { recipientId, text: messageText });
            setSendingMessageTo(null);
            setMessageText('');
            setMessageSuccessTo(pId);
            setTimeout(() => {
                setMessageSuccessTo(null);
            }, 3000);
        } catch (err: any) {
            console.error('Failed to send message:', err);
            setAlertModal({ isOpen: true, message: err.response?.data?.message || 'Failed to send message', type: 'error' });
        } finally {
            setIsSendingMessage(false);
        }
    };

    if (loading || !analytics) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    const filteredStats = analytics?.topicStats?.filter((stat: any) =>
        stat.topicName.toLowerCase().includes(searchTerm.trim().toLowerCase())
    ) || [];

    return (
        <div className="flex flex-col gap-10">
            {/* Analytics Overall Title */}
            <h2 style={{
                fontSize: '3.5rem',
                fontWeight: 900,
                letterSpacing: '-0.04em',
                margin: '0 1.5rem 0.5rem 1.5rem',
                backgroundImage: 'linear-gradient(to right, var(--primary), var(--secondary))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: 1
            }}>
                Analytics
            </h2>

            {/* Header Section: Combined Topic Performance Header and Active Topics Card */}
            <div className="flex flex-col lg:flex-row justify-between items-start gap-10 lg:gap-16 w-full px-6 md:px-10">
                {/* Left: Topic Performance Header and Search */}
                <div className="flex flex-col gap-8 flex-1 w-full order-2 lg:order-1" >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8" style={{marginTop:50}}>
                        <div className="flex items-center gap-6" style={{marginLeft:'1rem'}}>
                            <div style={{
                                width: '4px',
                                height: '2.5rem',
                                backgroundColor: 'var(--primary)',
                                borderRadius: '2px',
                                boxShadow: '0 0 15px var(--primary)'
                            }} />
                            <div className="flex flex-col">
                                <h3 style={{
                                    fontSize: '1.25rem',
                                    fontWeight: 900,
                                    letterSpacing: '0.1em',
                                    color: '#ffffff',
                                    textTransform: 'uppercase',
                                    lineHeight: 1.2,
                                    marginLeft: '15px',
                                   
                                }}>
                                    Topic<br />Performance
                                </h3>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="relative w-full max-w-xs md:max-w-md group flex-1 md:ml-10" style={{ margin: '1rem 2.5rem 1rem 1.5rem' }}>
                            <input
                                type="text"
                                placeholder="Filter topics..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-[#0a101f]/80 border border-white/5 rounded-lg py-3 pr-16 text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/30 transition-all font-medium"
                                style={{ background: 'rgba(10, 16, 31, 0.8)', boxSizing: 'border-box', paddingLeft: '1.5rem',marginRight: '1rem'}}
                            />
                            <FaSearch className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" />
                        </div>
                    </div>
                    <div style={{
                        width: '100%',
                        height: '1px',
                        background: 'linear-gradient(to right, var(--border-color), transparent)',
                        opacity: 0.3
                    }} />
                </div>

                {/* Right: Active Topics Card (Obsidian Style) */}
                <div className="w-full lg:w-1/4 order-1 lg:order-2">
                    <div className="p-[1.5px] rounded-[2rem] bg-gradient-to-br from-primary/60 to-transparent shadow-2xl">
                        <Card className="p-10 rounded-[2rem] border-none relative overflow-hidden group h-full" style={{ background: '#0a101f', margin: '0 10px 10px 10px',padding:30 }}>
                            <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity transform rotate-12 translate-x-4 -translate-y-4">
                                <FaChartLine size={100} />
                            </div>
                            <div className="flex flex-col relative z-10 gap-6">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 opacity-80">Active Topics</span>
                                </div>
                                <div className="flex items-end gap-5">
                                    <span className="text-7xl font-black text-white leading-none">
                                        {topics.length === 0 ? '0' : analytics.activeTopics}
                                    </span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Topic Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 items-start px-4">
                {filteredStats.map((stat: any) => (
                        <Card
                            key={stat.topicId}
                            className="group rounded-[2rem] border shadow-lg hover:shadow-primary/20 transition-all transform hover:-translate-y-2 relative overflow-hidden flex flex-col gap-8"
                            style={{ borderColor: 'var(--border-color)', background: 'var(--card-bg)', padding: '1.75rem', margin: '0 20px 20px 10px' }}
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-3xl rounded-full translate-x-12 -translate-y-12" />

                            <div className="flex items-start justify-between relative z-10">
                                <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-3xl border border-emerald-500/20 shadow-inner group-hover:scale-110 transition-transform">
                                    📦
                                </div>
                                <div className="h-2 w-20 bg-white/5 rounded-full overflow-hidden mt-6">
                                    <div className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" style={{ width: '65%' }} />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1 relative z-10">
                                <div className="flex items-center justify-between gap-4">
                                    <h4 style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }} className="truncate flex-1">
                                        {stat.topicName}
                                    </h4>
                                    {stat.categoryName && (
                                        <span className="text-[10px] font-black uppercase text-primary/70 tracking-tighter whitespace-nowrap bg-primary/5 px-2 py-1 rounded-md shrink-0">
                                            📁 {stat.categoryName}
                                        </span>
                                    )}
                                </div>
                                <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontWeight: 600 }}>
                                    Topic Metrics
                                </p>
                            </div>

                            <div className="flex flex-col gap-8 mt-8 relative z-10">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary)', lineHeight: 1 }}>
                                            {stat.participantCount}
                                        </span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', fontWeight: 700, textTransform: 'uppercase' }}>Total Participants</span>
                                    </div>
                                    <button
                                        onClick={() => handleViewParticipants(stat.topicId, stat.topicName)}
                                        className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 hover:bg-primary hover:text-white transition-all shadow-inner border border-white/5"
                                    >
                                        <FaArrowRight />
                                    </button>
                                </div>

                                <button
                                    onClick={() => handleOpenCertify(stat.topicId, stat.topicName)}
                                    className="w-full py-4 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white font-black text-xs uppercase tracking-widest transition-all border border-emerald-500/20 shadow-xl shadow-emerald-500/5 flex items-center justify-center gap-3"
                                >
                                    <FaAward className="text-lg" /> Certify Results
                                </button>
                            </div>

                        </Card>
                    ))}
                    {filteredStats.length === 0 && (
                        <div className="col-span-full py-20 text-center">
                            <div className="text-6xl mb-6 grayscale opacity-20">🔍</div>
                            <h3 className="text-xl font-bold text-slate-500">No topics found matching "{searchTerm}"</h3>
                        </div>
                    )}
                </div>

            {/* PARTICIPANTS MODAL */}
            {showParticipantsModal && (
                <div
                    className="fixed inset-0 z-[100] backdrop-blur-md flex items-start md:items-center justify-center px-4 pt-20 md:pt-0"
                    style={{ background: 'rgba(0, 0, 0, 0.7)' }}
                    onClick={() => setShowParticipantsModal(false)}
                >
                    <Card
                        className="w-full max-w-4xl p-0 rounded-3xl overflow-hidden flex flex-col max-h-[85vh] shadow-2xl pb-10"
                        style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)', padding: 30, margin: "10px 10px 10px 10px" }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-900/40" style={{ padding: 30, marginBottom: 30 }}>
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
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4" >
                                    {participants.map((p, idx) => (
                                        <React.Fragment key={p.id || idx}>
                                            <div className="p-6 rounded-2xl bg-white/5 border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between group hover:bg-white/10 transition-all gap-4">
                                                <div className="flex items-center gap-4 min-w-0 w-full sm:w-auto">
                                                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg shadow-inner shrink-0" style={{ padding: 30 }}>
                                                        {p.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="flex flex-col min-w-0" >
                                                        <span className="font-bold text-white truncate">{p.name}</span>
                                                        <span className="text-xs text-slate-500 font-mono italic truncate">{p.email || p.phone}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                                                    <div className="flex flex-col items-end" >
                                                        <span className="text-2xl font-black text-primary group-hover:scale-110 transition-transform">{p.score}</span>
                                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Points</span>
                                                    </div>
                                                    {p.userId && (
                                                        messageSuccessTo === p.id ? (
                                                            <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center ml-2 relative shrink-0" title="Message sent successfully">
                                                                <div className="absolute inset-0 bg-green-500/20 rounded-xl animate-ping opacity-75"></div>
                                                                <FaCheckCircle size={20} className="relative z-10" />
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => setSendingMessageTo(sendingMessageTo === p.id ? null : p.id)}
                                                                className="w-10 h-10 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-all ml-2 shrink-0"
                                                                title="Send Message"
                                                            >
                                                                <FaEnvelope />
                                                            </button>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                            {p.userId && sendingMessageTo === p.id && (
                                                <div
                                                    className="md:col-span-2 p-6 rounded-2xl bg-primary/5 border border-primary/20 animate-in slide-in-from-top-4 duration-300"
                                                    onClick={e => e.stopPropagation()}
                                                >
                                                    <TextArea
                                                        className="!p-10 !px-12 !rounded-[2rem] bg-black/30 border-2 border-white/5 !min-h-[160px] hover:border-white/10"
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
                                                            onClick={(e) => { e.stopPropagation(); handleSendMessage(String(p.userId), String(p.id)); }}
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
                </div>
            )}

            {/* CERTIFY MODAL */}
            {showCertifyModal && (
                <div
                    className="fixed inset-0 z-[100] backdrop-blur-md flex items-start md:items-center justify-center px-4 pt-20 md:pt-0"
                    style={{ background: 'rgba(0, 0, 0, 0.7)' }}
                    onClick={() => setShowCertifyModal(false)}
                >
                    <Card
                        noGlass
                        className="w-full max-w-4xl p-0 rounded-[2.5rem] overflow-hidden flex flex-col max-h-[85vh] shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-200"
                        style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)', padding: 30, margin: "10px 10px 10px 10px" }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-10 pb-6 border-b border-white/5 bg-gradient-to-r from-green-500/10 to-transparent">
                            <div className="flex justify-between items-center mb-4" style={{ padding: 30 }}>
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
                        <div className="flex-grow overflow-hidden flex flex-col" >
                            <div className="p-10 py-6 bg-white/5 border-b border-white/5" style={{ padding: 30 }}>
                                <p className="text-lg text-slate-300 font-medium">
                                    {participants.filter(p => !p.isCertified && p.isQualified).length > 0
                                        ? `Are you sure you want to generate certificates for these students? (Min. Required: ${passingMarks || 1} ${passingMarks > 0 ? 'marks' : 'correct'})`
                                        : `All qualified students who attempted this quiz have already been certified.`}
                                </p>
                            </div>

                            <div className="overflow-y-auto p-10 flex flex-col gap-6 custom-scrollbar">
                                {loadingParticipants ? (
                                    <div className="text-center py-24 text-slate-500 flex flex-col items-center gap-6">
                                        <div className="w-12 h-12 border-4 border-slate-700 border-t-green-500 rounded-full animate-spin" />
                                        <p className="text-xl font-bold tracking-tight">Fetching participant data...</p>
                                    </div>
                                ) : participants.filter(p => !p.isCertified).length === 0 ? (
                                    <div className="text-center py-24 text-slate-500 flex flex-col items-center gap-6 opacity-60" style={{ padding: 30, marginBottom: 20, marginTop: 10 }}>
                                        <div className="w-20 h-20 rounded-[2rem] bg-slate-800 flex items-center justify-center text-5xl shadow-inner">✅</div>
                                        <div className="flex flex-col gap-2" >
                                            <p className="text-2xl font-black text-white">All Caught Up!</p>
                                            <p className="text-slate-400">All students who attempted the quiz have been certified.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ padding: 30, marginBottom: 20, marginTop: 10 }}>
                                        {participants.filter(p => !p.isCertified).map((p, idx) => {
                                            const isQualified = p.isQualified;
                                            return (
                                                <div
                                                    key={idx}
                                                    className={`p-6 rounded-2xl border transition-all flex items-center justify-between ${isQualified ? 'bg-green-500/5 border-green-500/20' : 'bg-slate-500/5 border-white/5 opacity-60'}`}
                                                >
                                                    <div className="flex items-center gap-4" style={{ padding: 10 }}>
                                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg bg-gradient-to-br ${isQualified ? 'from-green-400 to-emerald-600' : 'from-slate-500 to-slate-700'}`}>
                                                            {p.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="flex flex-col" style={{ padding: 10 }}>
                                                            <span className="font-bold text-lg text-white">{p.name}</span>
                                                            <span className="text-xs text-slate-400 font-mono italic">{isQualified ? `Qualified (${p.score}/${passingMarks || 1})` : `Not Qualified (Req: ${passingMarks || 1})`}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end" style={{ padding: 10 }}>
                                                        <span className={`text-2xl font-black ${isQualified ? 'text-green-400' : 'text-slate-500'}`}>
                                                            {p.score}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Marks</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-10 pt-6 border-t border-white/5 bg-slate-900/50 flex gap-4" style={{ marginTop: 50 }}>
                            <Button
                                className="flex-1 h-14 text-lg bg-green-600 hover:bg-green-500 shadow-xl shadow-green-900/20 rounded-2xl disabled:opacity-50"
                                onClick={handleGenerateCertificates}
                                disabled={certifying || participants.filter(p => !p.isCertified && p.isQualified).length === 0}
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
            )}

            <AlertModal
                isOpen={alertModal.isOpen}
                onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
                message={alertModal.message}
                type={alertModal.type}
            />
        </div>
    );
}
