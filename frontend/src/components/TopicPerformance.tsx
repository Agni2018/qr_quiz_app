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
    FaChartLine,
    FaChevronRight,
    FaBuilding,
    FaFutbol,
    FaGlobe,
    FaHistory
} from 'react-icons/fa';
import AlertModal from '@/components/AlertModal';
import Pagination from './Pagination';
import { usePathname } from 'next/navigation';

export default function TopicPerformance() {
    const [topics, setTopics] = useState<any[]>([]);
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const pathname = usePathname();

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

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

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

    const getCategoryIcon = (categoryName: string) => {
        const name = (categoryName || '').toLowerCase();
        if (name.includes('football')) return <FaFutbol />;
        if (name.includes('history')) return <FaHistory />;
        if (name.includes('civics')) return <FaBuilding />;
        return <FaGlobe />;
    };

    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowWidth < 1024;

    if (loading) {
        return (
            <div style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '3rem', height: '3rem', border: '4px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%' }} className="animate-spin" />
            </div>
        );
    }

    const filteredStats = analytics?.topicStats?.filter((stat: any) =>
        stat.topicName.toLowerCase().includes(searchTerm.trim().toLowerCase())
    ) || [];

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredStats.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredStats.length / itemsPerPage) || 1;

    const paginate = (pageNumber: number) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    return (
        <div 
            className="flex flex-col"
            style={{ 
                gap: isMobile ? '2.5rem' : '4rem',
                paddingBottom: '4rem'
            }}
        >
            {/* SEARCH BAR (Absolute Top) */}
            <div 
                className="relative w-full"
                style={{ 
                    maxWidth: isMobile ? '100%' : '800px',
                    marginBottom: '1rem',
                    margin: '0 1rem 1rem 1rem'
                }}
            >
                <input 
                    type="text"
                    placeholder={isMobile ? "Search..." : "Search across all analytics..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-3xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-500/50 transition-all font-bold shadow-xl"
                    style={{ 
                        height: isMobile ? '60px' : '74px',
                        paddingLeft: isMobile ? '1.5rem' : '2rem',
                        paddingRight: '4rem',
                        fontSize: isMobile ? '16px' : '18px'
                    }}
                />
                <FaSearch 
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-[#4b5563]" 
                    style={{ fontSize: isMobile ? '18px' : '24px' }}
                />
            </div>

            {/* Header Section */}
            <div 
                className="flex flex-col lg:flex-row lg:items-end justify-between"
                style={{ gap: isMobile ? '1.5rem' : '3rem' }}
            >
                <div 
                    className="flex flex-col"
                    style={{ gap: '0.25rem' }}
                >
                    <span 
                        className="font-black text-orange-600 uppercase tracking-[0.4em] mb-1"
                        style={{ fontSize: isMobile ? '9px' : '11px' }}
                    >
                        Performance Intelligence
                    </span>
                    <h1 
                        className="font-black text-[#0a0f1e] tracking-tighter leading-none"
                        style={{ fontSize: isMobile ? '3rem' : 'clamp(3.5rem, 8vw, 6rem)',color:'orange' }}
                    >
                        Analytics
                    </h1>
                </div>

                {/* Active Topics Card (Obsidian Style) */}
                <div 
                    className="bg-white border border-slate-200 rounded-[2.5rem] p-10 flex flex-col items-start lg:items-end shadow-xl relative overflow-hidden group"
                    style={{ 
                        minWidth: '264px',
                        gap: '0.5rem',
                        padding: '30px'
                    }}
                >
                    <span className="text-[11px] font-black text-[#4b5563] uppercase tracking-[0.3em]">Total Active Topics</span>
                    <span 
                        className="text-7xl lg:text-8xl font-black text-orange-500 leading-none tracking-tighter"
                        style={{ textShadow: '0 0 30px rgba(249,115,22,0.1)' }}
                    >
                        {String(analytics.activeTopics || topics.length).padStart(2, '0')}
                    </span>
                    <div className={`${isMobile ? 'static mt-4' : 'absolute bottom-6 left-6'} text-orange-600 opacity-100 group-hover:scale-110 transition-all duration-500`}>
                        <FaChartLine size={isMobile ? 24 : 32} />
                    </div>
                </div>
            </div>

            {/* Pagination Feature (Just below the active topics card) */}
            <Pagination 
                currentPage={currentPage}
                totalItems={filteredStats.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                isMobile={isMobile}
                style={{ 
                    marginTop: '-2rem',
                    marginBottom: '1rem',
                    alignSelf: isMobile ? 'center' : 'flex-start'
                }}
            />

            {/* Topic Performance Heading */}
            <div 
                className="flex items-center"
                style={{ gap: '2.5rem' }}
            >
                <h3 className="text-3xl font-black text-[#0a0f1e] whitespace-nowrap tracking-tight uppercase tracking-widest" style={{color:'orange'}}>Topic Performance</h3>
                <div className="h-[1px] flex-1 bg-slate-200"></div>
            </div>

            {/* Cards Grid */}
            <div 
                className="grid grid-cols-1 lg:grid-cols-2"
                style={{ gap: '2.5rem' }}
            >
                {currentItems.map((stat: any) => (
                    <div
                        key={stat.topicId}
                        className="bg-white border border-slate-200 rounded-[2.5rem] transition-all hover:border-orange-500/30 group relative overflow-hidden flex flex-col"
                        style={{ 
                            padding: '30px',
                            gap: '2.5rem',
                            minHeight: '340px',
                            boxShadow: '0 4px 24px rgba(0,0,0,0.10), 0 1.5px 6px rgba(0,0,0,0.06)'
                        }}
                    >
                        <div 
                            className="flex items-start justify-between relative z-10"
                            style={{ marginBottom: '1rem' }}
                        >
                            <div 
                                className="flex items-center"
                                style={{ gap: '1.5rem' }}
                            >
                                <div 
                                    className="w-20 h-20 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-3xl text-orange-500 shadow-inner group-hover:scale-110 transition-transform duration-500"
                                >
                                    {getCategoryIcon(stat.categoryName || stat.topicName)}
                                </div>
                                <div 
                                    className="flex flex-col"
                                    style={{ gap: '0.25rem' }}
                                >
                                    <h4 
                                        className="text-3xl font-black text-black tracking-tight group-hover:text-orange-500 transition-colors"
                                        style={{ marginBottom: '0.1rem', color: '#000' }}
                                    >
                                        {stat.topicName}
                                    </h4>
                                    <span 
                                        className="text-sm font-semibold text-[#4b5563] tracking-wide"
                                    >
                                        {stat.categoryName || 'General knowledge'}
                                    </span>
                                </div>
                            </div>
                            <div className="text-right flex flex-col items-end">
                                <span className="text-[10px] font-black text-[#4b5563] uppercase tracking-widest" style={{ marginBottom: '0.5rem', color: '#333' }}>Participants</span>
                                <span className="text-4xl font-black text-black tracking-tighter" style={{ color: '#000' }}>{stat.participantCount.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Button Section */}
                        <div 
                            className="flex relative z-10 mt-auto"
                            style={{ gap: '1rem' }}
                        >
                            <button
                                onClick={() => handleOpenCertify(stat.topicId, stat.topicName)}
                                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-black text-sm uppercase tracking-[0.15em] rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-orange-500/20"
                                style={{ 
                                    padding: '1.5rem',
                                    height: '70px'
                                }}
                            >
                                Certify Results <FaCheckCircle size={16} />
                            </button>
                            <button
                                onClick={() => handleViewParticipants(stat.topicId, stat.topicName)}
                                className="bg-white hover:bg-slate-50 text-orange-500 border border-slate-200 rounded-2xl flex items-center justify-center transition-all active:scale-95 group/btn"
                                title="View Participants"
                                style={{ 
                                    width: '74px',
                                    height: '70px'
                                }}
                            >
                                <FaChevronRight size={24} className="group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                ))}

                {filteredStats.length === 0 && (
                    <div className="col-span-full py-20 text-center animate-pulse">
                        <div className="text-8xl mb-6 grayscale opacity-10">🔍</div>
                        <h3 className="text-2xl font-black text-[#4b5563] tracking-tight">No topics found matching "{searchTerm}"</h3>
                    </div>
                )}
            </div>

            {/* PARTICIPANTS MODAL */}
            {showParticipantsModal && (
                <div
                    className="fixed inset-0 z-[100] backdrop-blur-md flex items-start md:items-center justify-center px-4 pt-20 md:pt-0"
                    style={{ background: 'rgba(0, 0, 0, 0.8)' }}
                    onClick={() => setShowParticipantsModal(false)}
                >
                    <div
                        className="w-full max-w-4xl rounded-[3rem] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl border border-slate-200"
                        style={{ 
                            background: '#0b0e14',
                            padding: '0',
                            margin:"1rem 1rem 1rem 1rem",
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div 
                            className="flex justify-between items-center bg-[#111827]/30"
                            style={{ 
                                padding: isMobile ? '2rem 1.5rem' : '3.5rem 3.5rem 2.5rem 3.5rem',
                                borderBottom: '1px solid #1a1f2e'
                            }}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <h3 
                                    className="font-black tracking-tighter text-white"
                                    style={{ 
                                        fontSize: isMobile ? '1.75rem' : '2.5rem',
                                        marginBottom: '0.25rem' 
                                    }}
                                >
                                    {selectedTopicName}
                                </h3>
                                <p className="text-[#4b5563] font-black uppercase tracking-[0.25em]" style={{ fontSize: isMobile ? '9px' : '11px' }}>
                                    Reviewing Participant Performance
                                </p>
                            </div>
                            <button
                                onClick={() => setShowParticipantsModal(false)}
                                className="rounded-full bg-[#1a1f2e] flex items-center justify-center text-[#4b5563] hover:text-white transition-all shadow-xl active:scale-95"
                                style={{ 
                                    width: isMobile ? '40px' : '56px',
                                    height: isMobile ? '40px' : '56px',
                                    border: '1px solid #1a1f2e' 
                                }}
                            >
                                <FaTimes size={isMobile ? 18 : 24} />
                            </button>
                        </div>

                        <div 
                            className="overflow-y-auto custom-scrollbar"
                            style={{ padding: '30px' }}
                        >
                            {loadingParticipants ? (
                                <div 
                                    className="text-center flex flex-col items-center justify-center"
                                    style={{ padding: '6rem 0', gap: '2rem' }}
                                >
                                    <div className="w-14 h-14 border-4 border-[#1a1f2e] border-t-orange-500 rounded-full animate-spin" />
                                    <p className="font-black text-2xl text-white tracking-tight">Syncing participant records...</p>
                                </div>
                            ) : participants.length === 0 ? (
                                <div 
                                    className="text-center text-[#4b5563] font-black text-xl italic"
                                    style={{ padding: '5rem 0' }}
                                >
                                    No records discovered for this topic.
                                </div>
                            ) : (
                                <div 
                                    className="grid grid-cols-1 md:grid-cols-2"
                                    style={{ gap: '2rem' }}
                                >
                                    {participants.map((p, idx) => (
                                        <React.Fragment key={p.id || idx}>
                                            <div 
                                                className="rounded-[2.5rem] bg-white border border-slate-200 flex items-center justify-between group hover:border-orange-500/30 transition-all shadow-2xl relative overflow-hidden"
                                                style={{ padding: '30px', gap: '1rem' }}
                                            >
                                                <div 
                                                    className="flex items-center min-w-0 relative z-10"
                                                    style={{ gap: isMobile ? '1rem' : '1.5rem' }}
                                                >
                                                    <div 
                                                        className="rounded-2xl bg-orange-500 flex items-center justify-center text-white font-black shadow-lg shrink-0"
                                                        style={{ 
                                                            width: isMobile ? '40px' : '64px',
                                                            height: isMobile ? '40px' : '64px',
                                                            fontSize: isMobile ? '18px' : '24px'
                                                        }}
                                                    >
                                                        {p.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div 
                                                        className="flex flex-col min-w-0"
                                                        style={{ gap: '0.1rem' }}
                                                    >
                                                        <span style={{ fontSize: isMobile ? '16px' : '20px', color: '#000' }} className="font-black text-black tracking-tight truncate">{p.name}</span>
                                                        <span className="text-[#4b5563] font-black uppercase tracking-widest truncate" style={{ fontSize: isMobile ? '8px' : '10px', color: '#333' }}>{p.email || p.phone}</span>
                                                    </div>
                                                </div>
                                                <div 
                                                    className="flex items-center relative z-10"
                                                    style={{ gap: isMobile ? '0.75rem' : '1.25rem' }}
                                                >
                                                    <div 
                                                        className="flex flex-col items-end"
                                                        style={{ gap: '0' }}
                                                    >
                                                        <span className="font-black text-orange-500 tracking-tighter" style={{ fontSize: isMobile ? '24px' : '36px' }}>{p.score}</span>
                                                        <span className="text-[#4b5563] font-black uppercase tracking-widest" style={{ fontSize: isMobile ? '8px' : '10px' }}>Points</span>
                                                    </div>
                                                    {p.userId && (
                                                        messageSuccessTo === p.id ? (
                                                            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center shadow-lg">
                                                                <FaCheckCircle size={28} />
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => setSendingMessageTo(sendingMessageTo === p.id ? null : p.id)}
                                                                className="w-14 h-14 rounded-2xl bg-white border border-slate-200 hover:bg-orange-500/10 hover:text-orange-500 text-[#4b5563] flex items-center justify-center transition-all shadow-lg active:scale-95"
                                                                title="Send Private Message"
                                                            >
                                                                <FaEnvelope size={24} />
                                                            </button>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                            {p.userId && sendingMessageTo === p.id && (
                                                <div 
                                                    className="md:col-span-2 rounded-[2.5rem] bg-[#111827] border border-orange-500/20 animate-in slide-in-from-top-4 duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                                                    style={{ padding: '30px', marginTop: '1rem', marginBottom: '1rem' }}
                                                >
                                                    <TextArea
                                                        className="!p-8 bg-[#0a0b10] border-[#1a1f2e] !min-h-[160px] text-white rounded-[2rem] focus:border-orange-500/50 transition-all font-medium text-xl leading-relaxed"
                                                        placeholder={`Compose a message for ${p.name}...`}
                                                        value={messageText}
                                                        onChange={e => setMessageText(e.target.value)}
                                                    />
                                                    <div 
                                                        className="flex flex-col sm:flex-row justify-center items-center"
                                                        style={{ gap: '1.5rem', marginTop: '2.5rem' }}
                                                    >
                                                        <button
                                                            className="text-[#4b5563] hover:text-white font-black uppercase tracking-widest text-[12px] transition-colors order-2 sm:order-1"
                                                            onClick={() => setSendingMessageTo(null)}
                                                        >
                                                            Discard Draft
                                                        </button>
                                                        <button
                                                            className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-[#0a0b10] font-black uppercase tracking-widest text-[13px] rounded-xl shadow-xl shadow-orange-500/20 transition-all active:scale-95 order-1 sm:order-2"
                                                            style={{ padding: '1.25rem 3rem' }}
                                                            onClick={() => handleSendMessage(String(p.userId), String(p.id))}
                                                            disabled={isSendingMessage || !messageText.trim()}
                                                        >
                                                            {isSendingMessage ? 'Relaying...' : 'Dispatch Message'}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* CERTIFY MODAL */}
            {showCertifyModal && (
                <div
                    className="fixed inset-0 z-[100] backdrop-blur-md flex items-start md:items-center justify-center px-4 pt-20 md:pt-0"
                    style={{ background: 'rgba(0, 0, 0, 0.85)' }}
                    onClick={() => setShowCertifyModal(false)}
                >
                    <div
                        className="w-full max-w-4xl rounded-[3rem] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl border border-slate-200"
                        style={{ 
                            background: '#0b0e14',
                            margin:"1rem 1rem 1rem 1rem",
                            padding: '0'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div 
                            className="flex justify-between items-center bg-[#111827]/30"
                            style={{ 
                                padding: '30px',
                                borderBottom: '1px solid #1a1f2e'
                            }}
                        >
                            <div 
                                className="flex items-center"
                                style={{ gap: isMobile ? '1rem' : '2rem' }}
                            >
                                <div 
                                    className="rounded-[1.5rem] md:rounded-[2rem] bg-orange-500 flex items-center justify-center shadow-xl border border-orange-400/20"
                                    style={{ 
                                        width: isMobile ? '50px' : '96px',
                                        height: isMobile ? '50px' : '96px',
                                        fontSize: isMobile ? '24px' : '64px'
                                    }}
                                >
                                    📜
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                                    <h3 className="font-black tracking-tighter text-white leading-tight" style={{ fontSize: isMobile ? '1.5rem' : '3rem' }}>Certify Students</h3>
                                    <p className="text-orange-500 font-black uppercase tracking-[0.3em]" style={{ fontSize: isMobile ? '9px' : '11px' }}>{selectedTopicName}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowCertifyModal(false)} 
                                className="rounded-full bg-[#1a1f2e] flex items-center justify-center text-[#4b5563] hover:text-white transition-all shadow-md active:scale-95"
                                style={{ 
                                    width: isMobile ? '40px' : '56px',
                                    height: isMobile ? '40px' : '56px',
                                    border: '1px solid #1a1f2e' 
                                }}
                            >
                                <FaTimes size={isMobile ? 18 : 24} />
                            </button>
                        </div>

                        <div 
                            className="flex-grow overflow-y-auto custom-scrollbar"
                            style={{ padding: '30px' }}
                        >
                            <div 
                                className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm"
                                style={{ padding: '30px', marginBottom: '3.5rem' }}
                            >
                                <p className="text-2xl text-black font-black tracking-tight leading-relaxed" style={{ color: '#000' }}>
                                    {participants.filter(p => !p.isCertified && p.isQualified).length > 0
                                        ? `Authorize official certification for qualified participants discovered. (Benchmark: ${passingMarks || 1} Points)`
                                        : `Verification complete. All qualified participants have already been certified.`}
                                </p>
                            </div>

                            {loadingParticipants ? (
                                <div 
                                    className="text-center flex flex-col items-center justify-center"
                                    style={{ padding: '6rem 0', gap: '2.5rem' }}
                                >
                                    <div className="w-16 h-16 border-4 border-[#1a1f2e] border-t-orange-500 rounded-full animate-spin" />
                                    <p className="text-white font-black text-3xl tracking-tight">Processing benchmarks...</p>
                                </div>
                            ) : (
                                <div 
                                    className="grid grid-cols-1 md:grid-cols-2"
                                    style={{ gap: '2rem' }}
                                >
                                    {participants.filter(p => !p.isCertified).map((p, idx) => {
                                        const isQualified = p.isQualified;
                                        return (
                                            <div
                                                key={idx}
                                                className={`rounded-[2.5rem] border transition-all flex items-center justify-between shadow-md relative overflow-hidden ${isQualified ? 'bg-white border-orange-500/30' : 'bg-slate-50 border-slate-200 opacity-60'}`}
                                                style={{ padding: '30px', gap: '1.5rem' }}
                                            >
                                                <div 
                                                    className="flex items-center min-w-0 relative z-10"
                                                    style={{ gap: '1.5rem' }}
                                                >
                                                    <div 
                                                        className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg ${isQualified ? 'bg-orange-500' : 'bg-slate-200 text-[#4b5563]'}`}
                                                    >
                                                        {p.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div 
                                                        className="flex flex-col min-w-0"
                                                        style={{ gap: '0.2rem' }}
                                                    >
                                                        <span className="font-black text-black text-xl tracking-tight truncate" style={{ color: '#000' }}>{p.name}</span>
                                                        <span className={`text-[10px] font-black uppercase tracking-widest ${isQualified ? 'text-orange-500' : 'text-[#4b5563]'}`}>
                                                            {isQualified ? 'Qualified Status' : 'Below Benchmark'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div 
                                                    className="flex flex-col items-end shrink-0 relative z-10"
                                                    style={{ gap: '0.1rem' }}
                                                >
                                                    <span className={`text-3xl font-black tracking-tighter ${isQualified ? 'text-orange-500' : 'text-[#4b5563]'}`}>{p.score}</span>
                                                    <span className="text-[10px] font-black text-[#4b5563] uppercase tracking-widest">Points</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div 
                            className="border-t border-[#1a1f2e] bg-[#111827]/30 flex gap-4"
                            style={{ padding: '30px' }}
                        >
                            <button
                                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-[0.15em] rounded-2xl disabled:opacity-50 shadow-xl active:scale-95 transition-all"
                                style={{ 
                                    height: isMobile ? '60px' : '90px',
                                    fontSize: isMobile ? '13px' : '20px'
                                }}
                                onClick={handleGenerateCertificates}
                                disabled={certifying || participants.filter(p => !p.isCertified && p.isQualified).length === 0}
                            >
                                {certifying ? 'Relaying...' : 'Authorize'}
                            </button>
                            <button
                                className="flex-1 bg-[#1a1f2e] hover:bg-[#1a1f2e]/80 text-[#4b5563] hover:text-white font-black uppercase tracking-[0.15em] rounded-2xl active:scale-95 transition-all shadow-md"
                                style={{ 
                                    height: isMobile ? '60px' : '90px',
                                    fontSize: isMobile ? '13px' : '20px',
                                    border: '1px solid #1a1f2e' 
                                }}
                                onClick={() => setShowCertifyModal(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
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
