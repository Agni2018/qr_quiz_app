'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Card from '@/components/Card';
import Button from '@/components/Button';
import TextArea from '@/components/TextArea';
import {
    FaPlus,
    FaArrowRight,
    FaBars,
    FaTimes,
    FaAward,
    FaBookOpen,
    FaEnvelope,
    FaCheckCircle
} from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function AnalyticsPage() {
    const [topics, setTopics] = useState<any[]>([]);
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

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

    const router = useRouter();

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
            setParticipants(res.data.participants);
            setPassingMarks(res.data.passingMarks);
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
            fetchData();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to generate certificates');
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
            alert(err.response?.data?.message || 'Failed to send message');
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

    return (
        <section className="flex flex-col gap-10 md:gap-16">
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
                    backgroundImage: 'linear-gradient(to right, var(--primary), var(--secondary))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',

                }}>
                    Analytics
                </span>
            </h2>

            {/* Active Topics Card */}
            <Card className="p-10 rounded-[2.5rem] border-none shadow-2xl relative overflow-hidden group" style={{ background: 'linear-gradient(135deg, var(--card-bg), rgba(var(--primary-rgb), 0.15))', margin: '0 1rem 1rem 1rem' }}>
                <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-opacity transform rotate-12 translate-x-4 -translate-y-4">
                    <FaBars size={180} />
                </div>
                <div className="flex items-center justify-between relative z-10" >
                    <div className="flex flex-col gap-2">
                        <span className="text-lg font-bold uppercase tracking-widest text-primary opacity-90" style={{marginLeft:10}}>Active Topics</span>
                        <span className="text-sm font-medium text-slate-400" style={{marginLeft:10}}>Currently live quizzes</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 drop-shadow-sm" style={{marginRight:10}}>
                            {topics.length === 0 ? '0' : analytics.activeTopics}
                        </span>
                    </div>
                </div>
            </Card>

            {/* Topic Performance */}
            <div className="flex flex-col gap-14 mt-10" style={{margin:"0 1rem 1rem 1rem"}}>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 items-start">
                    {analytics.topicStats.map((stat: any) => (
                        <Card
                            key={stat.topicId}
                            className="group rounded-[2rem] border shadow-lg hover:shadow-primary/20 transition-all transform hover:-translate-y-2 relative overflow-hidden flex flex-col gap-8"
                            style={{ borderColor: 'var(--border-color)', background: 'var(--card-bg)', padding: '1.75rem', margin: '0 0 1rem 0' }}
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
                                <h4 style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }} className="truncate">
                                    {stat.topicName}
                                </h4>
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
                </div>
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
                                        <React.Fragment key={p.id || idx}>
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
                                                        messageSuccessTo === p.id ? (
                                                            <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center ml-2 relative" title="Message sent successfully">
                                                                <div className="absolute inset-0 bg-green-500/20 rounded-xl animate-ping opacity-75"></div>
                                                                <FaCheckCircle size={20} className="relative z-10" />
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => setSendingMessageTo(sendingMessageTo === p.id ? null : p.id)}
                                                                className="w-10 h-10 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-all ml-2"
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
                        style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)',padding:30}}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-10 pb-6 border-b border-white/5 bg-gradient-to-r from-green-500/10 to-transparent">
                            <div className="flex justify-between items-center mb-4" style={{padding:30}}>
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
                            <div className="p-10 py-6 bg-white/5 border-b border-white/5" style={{padding:30}}>
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
                                    <div className="text-center py-24 text-slate-500 flex flex-col items-center gap-6 opacity-60" style={{padding:30,marginBottom:20,marginTop:10}}>
                                        <div className="w-20 h-20 rounded-[2rem] bg-slate-800 flex items-center justify-center text-5xl shadow-inner">✅</div>
                                        <div className="flex flex-col gap-2" >
                                            <p className="text-2xl font-black text-white">All Caught Up!</p>
                                            <p className="text-slate-400">All students who attempted the quiz have been certified.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{padding:30,marginBottom:20,marginTop:10}}>
                                        {participants.filter(p => !p.isCertified).map((p, idx) => {
                                            const isQualified = p.isQualified;
                                            return (
                                                <div
                                                    key={idx}
                                                    className={`p-6 rounded-2xl border transition-all flex items-center justify-between ${isQualified ? 'bg-green-500/5 border-green-500/20' : 'bg-slate-500/5 border-white/5 opacity-60'}`}
                                                >
                                                    <div className="flex items-center gap-4" style={{padding:10}}>
                                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg bg-gradient-to-br ${isQualified ? 'from-green-400 to-emerald-600' : 'from-slate-500 to-slate-700'}`}>
                                                            {p.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="flex flex-col" style={{padding:10}}>
                                                            <span className="font-bold text-lg text-white">{p.name}</span>
                                                            <span className="text-xs text-slate-400 font-mono italic">{isQualified ? `Qualified (${p.score}/${passingMarks || 1})` : `Not Qualified (Req: ${passingMarks || 1})`}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end" style={{padding:10}}>
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
                        <div className="p-10 pt-6 border-t border-white/5 bg-slate-900/50 flex gap-4" style={{marginTop:50}}>
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
        </section>
    );
}
