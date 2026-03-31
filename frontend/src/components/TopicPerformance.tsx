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
    FaUsers,
    FaBook,
    FaUser
} from 'react-icons/fa';
import AlertModal from '@/components/AlertModal';
import Pagination from './Pagination';
import { usePathname } from 'next/navigation';
import { useSearch } from '@/contexts/SearchContext';

export default function TopicPerformance() {
    const [topics, setTopics] = useState<any[]>([]);
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { searchTerm } = useSearch();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6; // Reduced for better card layout
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

    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const handleResize = () => setWindowWidth(window.innerWidth);
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }
    }, []);

    const isMobile = windowWidth < 1024;

    if (loading) {
        return (
            <div style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '3rem', height: '3rem', border: '4px solid #f1f5f9', borderTopColor: '#f97316', borderRadius: '50%' }} className="animate-spin" />
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

    return (
        <div 
            className="flex flex-col"
            style={{ 
                gap: isMobile ? '2rem' : '3.5rem',
                paddingBottom: '4rem'
            }}
        >
            {/* Page Title Section */}
            <div 
                className="flex flex-col lg:flex-row lg:items-end justify-between"
                style={{ gap: '2rem' }}
            >
                <div className="flex flex-col">
                    <h1 
                        className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-[#f97316] leading-none"
                        style={{color:'darkorange'}}
                    >
                        Analytics
                    </h1>
                </div>

                {/* Active Topics Summary Card */}
                <div 
                    className="bg-white rounded-3xl flex items-center justify-between relative overflow-hidden"
                    style={{ 
                        padding: '1.5rem 2rem',
                        minWidth: '320px',
                        height: '110px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.03)',
                        border: '1px solid #f1f5f9'
                    }}
                >
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400 mb-1">Active Intelligence</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black text-slate-900 leading-none">
                                {analytics?.activeTopics || topics.length}
                            </span>
                            <span className="text-[10px] font-bold uppercase text-slate-400">Total Active Topics</span>
                        </div>
                    </div>
                    <div style={{ 
                        width: '56px', 
                        height: '56px', 
                        borderRadius: '16px', 
                        backgroundColor: '#fff7ed', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        color: '#f97316',
                        border: '1px solid #ffedd5'
                    }}>
                        <FaChartLine size={24} />
                    </div>
                    {/* Decorative Gradient Line */}
                    <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '4px', backgroundColor: '#f97316' }}></div>
                </div>
            </div>

            {/* Topic Performance Grid Container */}
            <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold uppercase tracking-tight text-slate-800">Topic Performance</h3>
                </div>

                {/* Cards Grid */}
                <div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                    style={{ gap: '1.5rem' }}
                >
                    {currentItems.map((stat: any) => (
                        <div
                            key={stat.topicId}
                            className="bg-white rounded-[2rem] flex flex-col group relative overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100"
                            style={{ minHeight: '380px' }}
                        >
                            {/* Card Header Area (Dark with Book Icon) */}
                            <div className="relative h-60 w-full flex flex-col items-center justify-center p-8 overflow-hidden bg-[#0f172a]">
                                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                                
                                {/* Admin Status Badge in Card */}
                                <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
                                    <FaUser className="text-orange-500 text-[10px]" />
                                    <span className="text-[9px] font-black text-white uppercase tracking-[0.1em]">Admin authenticated</span>
                                </div>

                                <div className="relative z-10 w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-500 shadow-xl" style={{marginTop:10}}>
                                    <FaBook size={32} />
                                </div>
                                <h3 className="relative z-10 text-center font-bold text-2xl text-white uppercase tracking-tight leading-tight max-w-[240px]" style={{marginTop:25}}>
                                    {stat.topicName}
                                </h3>
                            </div>

                            <div className="flex-1 flex flex-col" style={{ padding: '30px' }}>
                                {/* Stats Section */}
                                <div className="flex flex-col gap-8 mb-12">
                                    <div className="flex flex-col gap-5">
                                        <div className="flex flex-col gap-2">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Participant Engagement</span>
                                            <span className="text-xl font-bold text-slate-900 tracking-tight">{stat.participantCount} Participants</span>
                                        </div>
                                        {/* Progress Line */}
                                        <div className="h-[6px] w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                            <div 
                                                className="h-full bg-orange-500 transition-all duration-1000 ease-out" 
                                                style={{ width: `${Math.min(100, (stat.participantCount / 50) * 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="mt-auto flex items-center gap-3" style={{ marginTop: '30px' }}>
                                    <button
                                        onClick={() => handleOpenCertify(stat.topicId, stat.topicName)}
                                        className="flex-1 h-14 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-widest text-[11px] transition-all active:scale-95 cursor-pointer flex items-center justify-center shadow-lg shadow-orange-500/10"
                                    >
                                        Certify
                                    </button>
                                    <button
                                        onClick={() => handleViewParticipants(stat.topicId, stat.topicName)}
                                        className="flex-1 h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-black uppercase tracking-widest text-[11px] transition-all active:scale-95 cursor-pointer flex items-center justify-center border border-slate-200"
                                    >
                                        Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {filteredStats.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                            <h3 className="text-xl font-bold text-slate-400">No data found matching "{searchTerm}"</h3>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {filteredStats.length > itemsPerPage && (
                    <div className="flex justify-center mt-8">
                        <Pagination 
                            currentPage={currentPage}
                            totalItems={filteredStats.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                            isMobile={isMobile}
                        />
                    </div>
                )}
            </div>

            {/* PARTICIPANTS MODAL */}
            {showParticipantsModal && (
                <div
                    className="fixed inset-0 z-[100] backdrop-blur-md flex items-start md:items-center justify-center px-4 pt-20 md:pt-0"
                    style={{ background: 'rgba(15, 23, 42, 0.8)' }}
                    onClick={() => setShowParticipantsModal(false)}
                >
                    <div
                        className="w-full max-w-4xl mx-auto rounded-[2.5rem] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl bg-white border border-slate-200 animate-in fade-in zoom-in duration-300"
                        style={{ width: isMobile ? 'calc(100% - 1rem)' : '100%' }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                            <div 
                                className="flex justify-between items-center border-b border-slate-100 bg-white"
                                style={{ padding: isMobile ? '20px' : '30px' }}
                            >
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest leading-none">Performance Review</span>
                                <h2 className="font-bold text-2xl md:text-4xl text-[#0f172a] tracking-tight uppercase leading-none" style={{color:'black'}}>{selectedTopicName}</h2>
                            </div>
                            <button
                                onClick={() => setShowParticipantsModal(false)}
                                className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all cursor-pointer"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>

                        <div 
                            className="flex-grow overflow-y-auto custom-scrollbar"
                            style={{ padding: isMobile ? '15px' : '30px' }}
                        >
                            {loadingParticipants ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <div className="w-10 h-10 border-3 border-slate-100 border-t-orange-500 rounded-full animate-spin" />
                                    <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Fetching records</p>
                                </div>
                            ) : participants.length === 0 ? (
                                <div className="text-center py-10">
                                    <p className="text-slate-400 font-bold italic">No records discovered for this topic.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {participants.map((p, idx) => (
                                        <React.Fragment key={p.id || idx}>
                                            <div 
                                                className="rounded-[2.5rem] border border-slate-100 flex items-center justify-between group hover:border-orange-500/10 hover:bg-slate-50 transition-all duration-300 shadow-sm overflow-hidden"
                                                style={{ padding: isMobile ? '15px 20px' : '30px', backgroundColor: '#ffffff' }}
                                            >
                                                <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
                                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-orange-500 flex-shrink-0 flex items-center justify-center text-white font-black text-lg md:text-xl shadow-lg shadow-orange-500/20">
                                                        {p.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-slate-900 tracking-tight truncate text-sm md:text-base">{p.name}</span>
                                                            {messageSuccessTo === String(p.id) && (
                                                                <FaCheckCircle className="text-orange-500 animate-blink-three flex-shrink-0" size={14} />
                                                            )}
                                                        </div>
                                                        <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 truncate">{p.email || p.phone}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 md:gap-4 flex-shrink-0 ml-2">
                                                    <div className="flex flex-col items-end">
                                                        <span className="font-black text-slate-900 text-lg md:text-2xl tracking-tighter leading-none">{p.score}</span>
                                                        <span className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Points</span>
                                                    </div>
                                                    {p.userId && (
                                                        <button
                                                            onClick={() => setSendingMessageTo(sendingMessageTo === p.id ? null : p.id)}
                                                            className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-orange-500 hover:border-orange-500/20 transition-all cursor-pointer flex-shrink-0"
                                                        >
                                                            <FaEnvelope size={isMobile ? 14 : 18} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            {p.userId && sendingMessageTo === p.id && (
                                                <div className="col-span-full mt-2 animate-in slide-in-from-top-2 duration-300">
                                                    <div className="bg-slate-50 rounded-2xl border border-orange-500/10 p-6 flex flex-col gap-4">
                                                         <TextArea
                                                            className="w-full !p-6 !bg-white !text-slate-900 border border-slate-200 !min-h-[120px] rounded-2xl focus:border-orange-500 transition-all font-bold text-sm shadow-inner"
                                                            style={{ backgroundColor: '#ffffff', color: '#0f172a', padding: '24px' }}
                                                            placeholder={`Direct message to ${p.name}...`}
                                                            value={messageText}
                                                            onChange={e => setMessageText(e.target.value)}
                                                        />
                                                        <div className="flex items-center justify-end gap-3">
                                                            <button className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors" onClick={() => setSendingMessageTo(null)}>Cancel</button>
                                                            <button 
                                                                style={{padding:5,marginRight:5,marginBottom:5}}
                                                                className="h-10 px-6 rounded-lg bg-orange-500 text-white text-[11px] font-bold uppercase tracking-widest disabled:opacity-50 transition-all hover:bg-orange-600 shadow-md shadow-orange-500/10"
                                                                onClick={() => handleSendMessage(String(p.userId), String(p.id))}
                                                                disabled={isSendingMessage || !messageText.trim()}
                                                            >
                                                                {isSendingMessage ? 'Sending...' : 'Send Message'}
                                                            </button>
                                                        </div>
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
                    style={{ background: 'rgba(15, 23, 42, 0.8)' }}
                    onClick={() => setShowCertifyModal(false)}
                >
                    <div
                        className="w-full max-w-2xl mx-auto rounded-[2.5rem] bg-white overflow-hidden flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-300"
                        style={{ width: isMobile ? 'calc(100% - 1rem)' : '100%' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="border-b border-slate-50 flex items-center justify-between" style={{ padding: isMobile ? '20px' : '30px' }}>
                            <div className="flex items-center gap-4 md:gap-6">
                                <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-[1.5rem] bg-[#0f172a] flex items-center justify-center text-white shadow-2xl">
                                    <FaAward size={isMobile ? 22 : 28} />
                                </div>
                                <div className="flex flex-col gap-0.5 md:gap-1">
                                    <span className="text-[9px] md:text-[10px] font-black text-orange-500 uppercase tracking-widest leading-none">Credential Authority</span>
                                    <h2 className="font-bold text-[#0f172a] text-xl md:text-3xl tracking-tight uppercase leading-none" style={{color:'black'}}>Certify Students</h2>
                                </div>
                            </div>
                            <button onClick={() => setShowCertifyModal(false)} className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 cursor-pointer transition-all">
                                <FaTimes size={isMobile ? 16 : 20} />
                            </button>
                        </div>

                        <div className="overflow-y-auto max-h-[60vh] custom-scrollbar" style={{ padding: isMobile ? '20px' : '30px' }}>
                            <div className="bg-slate-50 rounded-2xl p-4 md:p-6 mb-6 md:mb-8 border border-slate-100" style={{marginBottom:10}}>
                                <p className="text-xs md:text-sm font-bold text-slate-900 leading-relaxed uppercase" style={{color:'black',padding:5}}>
                                    {participants.filter(p => !p.isCertified && p.isQualified).length > 0
                                        ? `You are about to authorize certifications for all qualified participants who haven't received them yet.`
                                        : `Everything's up to date. No new qualified participants discovered for this topic.`}
                                </p>
                            </div>

                            {loadingParticipants ? (
                                <div className="flex flex-col items-center justify-center py-10 gap-3">
                                    <div className="w-8 h-8 border-3 border-slate-100 border-t-orange-500 rounded-full animate-spin" />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Validating benchmarks</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {participants.filter(p => !p.isCertified && p.isQualified).map((p, idx) => (
                                        <div key={idx} className="flex items-center justify-between bg-white border border-slate-100 rounded-2xl hover:border-orange-500/20 transition-all group shadow-sm" style={{ padding: '30px', marginBottom: '12px' }}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm">
                                                    {p.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-bold text-slate-900 text-sm tracking-tight">{p.name}</span>
                                            </div>
                                            <span className="text-xs font-black text-orange-500 uppercase tracking-widest">{p.score} Points</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="border-t border-slate-100 flex gap-4 md:gap-6" style={{ padding: isMobile ? '20px' : '30px' }}>
                            <button
                                className="flex-1 h-14 md:h-16 rounded-2xl md:rounded-[2rem] bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-widest text-[10px] md:text-[12px] disabled:opacity-40 transition-all shadow-xl shadow-orange-500/20 active:scale-95"
                                onClick={handleGenerateCertificates}
                                disabled={certifying || participants.filter(p => !p.isCertified && p.isQualified).length === 0}
                            >
                                {certifying ? 'Transmitting...' : 'Authorize'}
                            </button>
                            <button
                                className="flex-1 h-14 md:h-16 rounded-2xl md:rounded-[2rem] bg-slate-100 hover:bg-slate-200 text-slate-900 font-black uppercase tracking-widest text-[10px] md:text-[12px] border border-slate-200 transition-all active:scale-95"
                                onClick={() => setShowCertifyModal(false)}
                            >
                                Dismiss
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
