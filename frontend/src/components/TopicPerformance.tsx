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
    FaCheck,
    FaCheckCircle,
    FaAward,
    FaEnvelope,
    FaSearch,
    FaChartLine,
    FaChevronRight,
    FaChevronDown,
    FaCaretDown,
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
    const [sendingEmailTo, setSendingEmailTo] = useState<string | null>(null);
    const [emailSuccessTo, setEmailSuccessTo] = useState<string | null>(null);
    const [emailSubject, setEmailSubject] = useState('');
    const [emailText, setEmailText] = useState('');
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    // Certify States
    const [selectedCertifyOption, setSelectedCertifyOption] = useState<'' | 'one' | 'few' | 'all'>('');
    const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>([]);

    const [alertModal, setAlertModal] = useState({ isOpen: false, message: '', type: 'info' as 'success' | 'error' | 'info' });

    // Pending Modal States
    const [showPendingModal, setShowPendingModal] = useState(false);
    const [pendingSearchTerm, setPendingSearchTerm] = useState('');
    const [pendingCurrentPage, setPendingCurrentPage] = useState(1);
    const pendingItemsPerPage = 10;

    // Participants Modal States
    const [participantsSearchTerm, setParticipantsSearchTerm] = useState('');
    const [participantsCurrentPage, setParticipantsCurrentPage] = useState(1);

    // Certify Modal States
    const [certifySearchTerm, setCertifySearchTerm] = useState('');
    const [certifyCurrentPage, setCertifyCurrentPage] = useState(1);

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
        setParticipantsSearchTerm('');
        setParticipantsCurrentPage(1);
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
        setCertifySearchTerm('');
        setCertifyCurrentPage(1);
        setShowCertifyModal(true);
        setLoadingParticipants(true);
        setSelectedCertifyOption('');
        setSelectedParticipantIds([]);
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
            await api.post(`/quiz/certify/${selectedTopicId}`, {
                participantIds: selectedParticipantIds
            });
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

    const handleSendEmail = async (email: string, participantId: string, topicName: string) => {
        if (!emailText.trim()) return;
        setIsSendingEmail(true);
        try {
            const formData = new FormData();
            formData.append('subject', emailSubject || `Update on ${topicName}`);
            formData.append('message', emailText);
            formData.append('_captcha', 'false'); // Disable captcha for AJAX
            formData.append('_template', 'table');

            const response = await fetch(`https://formsubmit.co/ajax/${email}`, {
                method: "POST",
                body: formData
            });

            if (response.ok) {
                setSendingEmailTo(null);
                setEmailText('');
                setEmailSubject('');
                setEmailSuccessTo(participantId);
                setTimeout(() => setEmailSuccessTo(null), 3000);
            } else {
                throw new Error('Failed to send email');
            }
        } catch (err: any) {
            console.error('Failed to send email:', err);
            setAlertModal({ isOpen: true, message: 'Failed to send email. Ensure the user exists and your connection is active.', type: 'error' });
        } finally {
            setIsSendingEmail(false);
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
                <div style={{ width: '3rem', height: '3rem', border: '4px solid #f1f5f9', borderTopColor: '#4f46e5', borderRadius: '50%' }} className="animate-spin" />
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

    // Participants Modal Logic
    const filteredParticipants = participants.filter(p => 
        p.name.toLowerCase().includes(participantsSearchTerm.trim().toLowerCase()) ||
        (p.email && p.email.toLowerCase().includes(participantsSearchTerm.trim().toLowerCase())) ||
        (p.phone && p.phone.toLowerCase().includes(participantsSearchTerm.trim().toLowerCase()))
    );
    const participantsIndexOfLast = participantsCurrentPage * 10;
    const participantsIndexOfFirst = participantsIndexOfLast - 10;
    const currentParticipants = filteredParticipants.slice(participantsIndexOfFirst, participantsIndexOfLast);

    // Certify Modal Logic
    const qualifiedParticipants = participants.filter(p => !p.isCertified && p.isQualified);
    const filteredCertifyParticipants = qualifiedParticipants.filter(p => 
        p.name.toLowerCase().includes(certifySearchTerm.trim().toLowerCase())
    );
    const certifyIndexOfLast = certifyCurrentPage * 10;
    const certifyIndexOfFirst = certifyIndexOfLast - 10;
    const currentCertifyParticipants = filteredCertifyParticipants.slice(certifyIndexOfFirst, certifyIndexOfLast);

    return (
        <div 
            className="flex flex-col"
            style={{ 
                gap: isMobile ? '1rem' : '1.25rem',
                paddingBottom: '4rem'
            }}
        >
            {/* Page Title Section */}
            <div 
                className="flex flex-col lg:flex-row lg:items-center justify-between"
                style={{ gap: '2rem' }}
            >
                <div className="flex flex-col">
                    <h1 
                        className="text-3xl md:text-4xl font-black tracking-tighter text-black leading-none"
                        style={{color:'black'}}
                    >
                        Analytics
                    </h1>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4 lg:gap-6">
                    {/* Active Intelligence Card - RESTORED */}
                    <div 
                        className="bg-white rounded-3xl flex items-center justify-between relative overflow-hidden"
                        style={{ 
                            padding: '1.5rem 2rem',
                            minWidth: isMobile ? '100%' : '320px',
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
                            backgroundColor: '#eef2ff', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            color: '#4f46e5',
                            border: '1px solid #e0e7ff'
                        }}>
                            <FaChartLine size={24} />
                        </div>
                        {/* Decorative Gradient Line */}
                        <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '4px', backgroundColor: '#4f46e5' }}></div>
                    </div>

                    {/* Pending Button - NEW */}
                    <button 
                        onClick={() => {
                            fetchData();
                            setShowPendingModal(true);
                        }}
                        className="bg-indigo-500 rounded-3xl flex items-center justify-center gap-4 relative overflow-hidden transition-all hover:bg-indigo-600 hover:scale-[1.02] active:scale-95 cursor-pointer shadow-xl shadow-indigo-500/20"
                        style={{ 
                            padding: '1.5rem 2.5rem',
                            minWidth: isMobile ? '100%' : '240px',
                            height: '110px'
                        }}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                            <span className="text-[10px] font-black text-indigo-100 uppercase tracking-widest leading-none mb-2">Certification</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black text-white leading-none">
                                    {analytics?.topicStats?.reduce((acc: number, curr: any) => acc + (curr.pendingCount || 0), 0) || 0}
                                </span>
                                <span className="text-[12px] font-bold uppercase text-indigo-100 tracking-widest">Pending</span>
                            </div>
                        </div>
                        <div style={{ 
                            width: '50px', 
                            height: '50px', 
                            borderRadius: '16px', 
                            backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            color: 'white',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)'
                        }}>
                            <FaAward size={22} />
                        </div>
                    </button>
                </div>



            </div>

            {/* Topic Performance Grid Container */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold uppercase tracking-tight text-slate-800" >Topic Performance</h3>
                </div>

                {/* Cards Grid */}
                <div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                    style={{ gap: '2.5rem' }}
                >
                    {currentItems.map((stat: any) => (
                        <div
                            key={stat.topicId}
                            className="bg-white rounded-[2.5rem] flex flex-col group relative overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_40px_80px_rgba(79,70,229,0.06)] transition-all duration-500 border border-slate-100 w-full"
                            style={{ 
                                minHeight: '280px',
                                maxWidth: '350px' 
                            }}
                        >
                            {/* Card Header Area (Redesigned) */}
                            <div className="flex justify-between items-start" style={{ padding: '24px 24px 8px 24px' }}>
                                <div className="flex flex-col gap-1.5">
                                     <div className="flex items-center gap-2">
                                         <div className="w-1.5 h-1.5 rounded-full bg-[#4f46e5]"></div>
                                         <span className="text-[10px] font-bold text-[#4f46e5] uppercase tracking-widest opacity-80">Admin authenticated</span>
                                     </div>
                                     <h3 className="text-xl font-black uppercase tracking-tight leading-none transition-transform duration-500 origin-left" style={{ color: 'black' }}>
                                         {stat.topicName}
                                     </h3>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-[#eef2ff] border border-[#e0e7ff] flex items-center justify-center text-[#4f46e5] shadow-sm transform group-hover:scale-110 transition-all duration-500">
                                    <FaBook size={16} />
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col" style={{ padding: '24px' }}>
                                {/* Stats Section */}
                                <div className="flex flex-col gap-4 mb-6">
                                    <div className="flex flex-col gap-2.5">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Participant Engagement</span>
                                            <span className="text-lg font-black text-slate-900 tracking-tight">{stat.participantCount} Participants</span>
                                        </div>
                                        {/* Progress Line */}
                                        <div className="h-[4px] w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-[#4f46e5] transition-all duration-1000 ease-out" 
                                                style={{ width: `${Math.min(100, (stat.participantCount / 50) * 100)}%` }}
                                            >
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="mt-auto flex items-center gap-3" style={{ marginTop: '20px' }}>
                                    <button
                                        onClick={() => handleOpenCertify(stat.topicId, stat.topicName)}
                                        className="flex-1 h-11 rounded-xl bg-[#4f46e5] hover:bg-[#4338ca] text-white font-black uppercase tracking-[0.1em] text-[10px] transition-all active:scale-95 cursor-pointer flex items-center justify-center shadow-md shadow-indigo-500/10"
                                    >
                                        Certify
                                    </button>
                                    <button
                                        onClick={() => handleViewParticipants(stat.topicId, stat.topicName)}
                                        className="flex-1 h-11 rounded-xl bg-[#f8fafc] hover:bg-slate-100 text-slate-600 font-black uppercase tracking-[0.1em] text-[10px] transition-all active:scale-95 cursor-pointer flex items-center justify-center border border-slate-200"
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
                                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest leading-none">Performance Review</span>
                                <h2 className="font-bold text-2xl md:text-3xl text-[#0f172a] tracking-tight capitalize leading-none" style={{color:'black'}}>{selectedTopicName}</h2>
                            </div>
                            <button
                                onClick={() => setShowParticipantsModal(false)}
                                className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all cursor-pointer"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>

                        {/* Search Bar - Participants Modal */}
                        <div style={{ padding: '24px 30px 0', backgroundColor: '#ffffff' }}>
                            <div className="relative group">
                                <input 
                                    type="text"
                                    placeholder="Filter records by name, email or phone..."
                                    className="w-full h-14 pl-6 pr-14 rounded-2xl bg-slate-50 border-2 border-slate-100/50 focus:bg-white focus:border-indigo-500/30 focus:shadow-lg focus:shadow-indigo-500/5 transition-all text-sm font-bold text-slate-900 placeholder:text-slate-400 outline-none"
                                    value={participantsSearchTerm}
                                    onChange={(e) => {
                                        setParticipantsSearchTerm(e.target.value);
                                        setParticipantsCurrentPage(1);
                                    }}
                                />
                                <FaSearch className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                            </div>
                        </div>

                        <div 
                            className="flex-grow overflow-y-auto custom-scrollbar"
                            style={{ padding: isMobile ? '15px' : '30px' }}
                        >
                            {loadingParticipants ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <div className="w-10 h-10 border-3 border-slate-100 border-t-indigo-500 rounded-full animate-spin" />
                                    <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Fetching records</p>
                                </div>
                            ) : filteredParticipants.length === 0 ? (
                                <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                    <p className="text-slate-400 font-bold italic">No participants found matching your search.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {currentParticipants.map((p, idx) => (
                                        <React.Fragment key={p.id || idx}>
                                            <div 
                                                className="rounded-[2.5rem] border border-slate-100 flex items-center justify-between group hover:border-indigo-500/10 hover:bg-slate-50 transition-all duration-300 shadow-sm overflow-hidden"
                                                style={{ padding: isMobile ? '15px 20px' : '30px', backgroundColor: '#ffffff' }}
                                            >
                                                <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
                                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-indigo-500 flex-shrink-0 flex items-center justify-center text-white font-black text-lg md:text-xl shadow-lg shadow-indigo-500/20">
                                                        {p.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-slate-900 tracking-tight truncate text-sm md:text-base">{p.name}</span>
                                                            {(messageSuccessTo === String(p.id) || emailSuccessTo === String(p.id)) && (
                                                                <div className="flex items-center -gap-0.5 animate-in fade-in zoom-in duration-300">
                                                                    <FaCheck className="text-indigo-500 animate-blink-three" size={10} style={{ animationDelay: '0s' }} />
                                                                    <FaCheck className="text-indigo-500 animate-blink-three" size={10} style={{ animationDelay: '0.1s' }} />
                                                                    <FaCheck className="text-indigo-500 animate-blink-three" size={10} style={{ animationDelay: '0.2s' }} />
                                                                </div>
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
                                                        <div className="relative flex items-center gap-1">
                                                            <button
                                                                onClick={() => {
                                                                    setSendingMessageTo(sendingMessageTo === p.id ? null : p.id);
                                                                    setSendingEmailTo(null);
                                                                    setActiveDropdown(null);
                                                                }}
                                                                className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-500 hover:border-indigo-500/20 transition-all cursor-pointer flex-shrink-0"
                                                                title="Send Message"
                                                            >
                                                                <FaEnvelope size={isMobile ? 14 : 18} />
                                                            </button>
                                                            
                                                            <div className="relative">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setActiveDropdown(activeDropdown === p.id ? null : p.id);
                                                                    }}
                                                                    className="w-6 h-9 md:h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-500 transition-all cursor-pointer"
                                                                >
                                                                    <FaCaretDown size={12} />
                                                                </button>
                                                                
                                                                {activeDropdown === p.id && (
                                                                    <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-2xl shadow-xl border border-slate-100 z-[110] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                                                        <button 
                                                                            className="w-full px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-600 hover:bg-indigo-50 hover:text-indigo-500 transition-colors flex items-center gap-3"
                                                                            onClick={() => {
                                                                                setSendingEmailTo(sendingEmailTo === p.id ? null : p.id);
                                                                                setSendingMessageTo(null);
                                                                                setActiveDropdown(null);
                                                                                setEmailSubject(`Feedback on ${selectedTopicName}`);
                                                                            }}
                                                                        >
                                                                            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                                                            Send Email
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {p.userId && sendingMessageTo === p.id && (
                                                <div className="col-span-full mt-2 animate-in slide-in-from-top-2 duration-300">
                                                    <div className="bg-slate-50 rounded-2xl border border-indigo-500/10 p-6 flex flex-col gap-4">
                                                         <TextArea
                                                            className="w-full !p-6 !bg-white !text-slate-900 border border-slate-200 !min-h-[120px] rounded-2xl focus:border-indigo-500 transition-all font-bold text-sm shadow-inner"
                                                            style={{ backgroundColor: '#ffffff', color: '#0f172a', padding: '24px', border: '1px solid #e2e8f0' }}
                                                            placeholder={`Direct message to ${p.name}...`}
                                                            value={messageText}
                                                            onChange={e => setMessageText(e.target.value)}
                                                        />
                                                        <div className="flex items-center justify-end gap-3">
                                                            <button className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors cursor-pointer" onClick={() => setSendingMessageTo(null)}>Cancel</button>
                                                            <button 
                                                                style={{padding:5,marginRight:5,marginBottom:5}}
                                                                className="h-10 px-6 rounded-lg bg-indigo-500 text-white text-[11px] font-bold uppercase tracking-widest disabled:opacity-50 transition-all hover:bg-indigo-600 shadow-md shadow-indigo-500/10 cursor-pointer"
                                                                onClick={() => handleSendMessage(String(p.userId), String(p.id))}
                                                                disabled={isSendingMessage || !messageText.trim()}
                                                            >
                                                                {isSendingMessage ? 'Sending...' : 'Send Message'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {p.email && sendingEmailTo === p.id && (
                                                <div className="col-span-full mt-2 animate-in slide-in-from-top-2 duration-300">
                                                    <div 
                                                        className="bg-indigo-50 rounded-[2rem] border border-indigo-100/50 flex flex-col gap-6 shadow-inner"
                                                        style={{ paddingInline: '40px', paddingBlock: '32px' }}
                                                    >
                                                        <div className="flex flex-col gap-2.5">
                                                            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest" style={{ paddingInline: '12px' }}>Email Subject</span>
                                                            <input
                                                                type="text"
                                                                className="w-full h-14 rounded-2xl bg-white border border-slate-200 focus:border-indigo-500 focus:shadow-md outline-none font-bold text-sm text-slate-900 transition-all placeholder:text-slate-300"
                                                                style={{ paddingInline: '40px' }}
                                                                placeholder="Enter subject..."
                                                                value={emailSubject}
                                                                onChange={e => setEmailSubject(e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="flex flex-col gap-2.5">
                                                            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest" style={{ paddingInline: '12px' }}>Message Body</span>
                                                            <TextArea
                                                                className="w-full !bg-white !text-slate-900 border border-slate-200 !min-h-[180px] rounded-2xl focus:border-indigo-500 transition-all font-bold text-sm shadow-inner"
                                                                style={{ backgroundColor: '#ffffff', color: '#0f172a', paddingInline: '40px', paddingBlock: '32px', border: '1px solid #e2e8f0' }}
                                                                placeholder={`Write your email to ${p.name}...`}
                                                                value={emailText}
                                                                onChange={e => setEmailText(e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="flex items-center justify-end gap-6 mt-4" style={{ paddingInline: '16px' }}>
                                                            <button 
                                                                className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors cursor-pointer" 
                                                                onClick={() => setSendingEmailTo(null)}
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button 
                                                                className="h-12 rounded-xl bg-indigo-500 text-white text-[11px] font-bold uppercase tracking-widest disabled:opacity-50 transition-all hover:bg-indigo-600 hover:scale-105 active:scale-95 shadow-xl shadow-indigo-500/30 cursor-pointer flex items-center justify-center gap-3"
                                                                style={{ paddingInline: '40px' }}
                                                                onClick={() => handleSendEmail(p.email, String(p.id), selectedTopicName)}
                                                                disabled={isSendingEmail || !emailText.trim()}
                                                            >
                                                                {isSendingEmail ? 'Transmitting...' : 'Send Email'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {filteredParticipants.length > 10 && (
                                    <div className="flex justify-center mt-8">
                                        <Pagination 
                                            currentPage={participantsCurrentPage}
                                            totalItems={filteredParticipants.length}
                                            itemsPerPage={10}
                                            onPageChange={setParticipantsCurrentPage}
                                            isMobile={isMobile}
                                        />
                                    </div>
                                )}
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
                        <div className="border-b border-slate-100 flex items-center justify-between" style={{ padding: isMobile ? '20px' : '30px' }}>
                            <div className="flex items-center gap-4 md:gap-6">
                                <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-[1.5rem] bg-[#0f172a] flex items-center justify-center text-white shadow-2xl">
                                    <FaAward size={isMobile ? 22 : 28} />
                                </div>
                                <div className="flex flex-col gap-0.5 md:gap-1">
                                    <span className="text-[9px] md:text-[10px] font-black text-indigo-500 uppercase tracking-widest leading-none">Credential Authority</span>
                                    <h2 className="font-bold text-[#0f172a] text-xl md:text-2xl tracking-tight capitalize leading-none" style={{color:'black'}}>Certify Students</h2>
                                </div>
                            </div>
                            <button onClick={() => setShowCertifyModal(false)} className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 cursor-pointer transition-all">
                                <FaTimes size={isMobile ? 16 : 20} />
                            </button>
                        </div>

                        <div className="overflow-y-auto max-h-[60vh] custom-scrollbar" style={{ padding: isMobile ? '20px' : '30px' }}>
                            <div className="bg-slate-50 rounded-2xl p-4 md:p-6 mb-6 md:mb-8 border border-slate-100" style={{marginBottom:10}}>
                                <p className="text-xs md:text-sm font-bold text-slate-900 leading-relaxed uppercase" style={{color:'black',padding:5}}>
                                    {qualifiedParticipants.length > 0
                                        ? `You are about to authorize certifications for all qualified participants who haven't received them yet.`
                                        : `Everything's up to date. No new qualified participants discovered for this topic.`}
                                </p>
                            </div>

                            {qualifiedParticipants.length > 0 && (
                                <div className="flex flex-col gap-6" style={{ marginBottom: '20px' }}>
                                    {/* Search Bar - Certify Modal */}
                                    <div className="relative group">
                                        <input 
                                            type="text"
                                            placeholder="Identify qualified students..."
                                            className="w-full h-14 pl-6 pr-14 rounded-2xl bg-slate-50 border-2 border-slate-100/50 focus:bg-white focus:border-indigo-500/30 focus:shadow-lg focus:shadow-indigo-500/5 transition-all text-sm font-bold text-slate-900 placeholder:text-slate-400 outline-none"
                                            value={certifySearchTerm}
                                            onChange={(e) => {
                                                setCertifySearchTerm(e.target.value);
                                                setCertifyCurrentPage(1);
                                            }}
                                        />
                                        <FaSearch className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                    </div>

                                    <div className="flex flex-wrap gap-2 md:gap-4 lg:gap-6" style={{ marginTop: '5px' }}>
                                        <button 
                                            className={`flex-1 min-w-[100px] h-14 rounded-2xl md:rounded-[2rem] text-[10px] md:text-[12px] font-black uppercase tracking-widest transition-all shadow-sm ${selectedCertifyOption === 'one' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 ring-2 ring-indigo-500 ring-offset-2' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                            onClick={() => {
                                                setSelectedCertifyOption('one');
                                                setSelectedParticipantIds([]);
                                            }}
                                            style={{ padding: '0 10px' }}
                                        >
                                            Select One
                                        </button>
                                        <button 
                                            className={`flex-1 min-w-[100px] h-14 rounded-2xl md:rounded-[2rem] text-[10px] md:text-[12px] font-black uppercase tracking-widest transition-all shadow-sm ${selectedCertifyOption === 'few' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 ring-2 ring-indigo-500 ring-offset-2' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                            onClick={() => {
                                                setSelectedCertifyOption('few');
                                                setSelectedParticipantIds([]);
                                            }}
                                            style={{ padding: '0 10px' }}
                                        >
                                            Select Few
                                        </button>
                                        <button 
                                            className={`flex-1 min-w-[100px] h-14 rounded-2xl md:rounded-[2rem] text-[10px] md:text-[12px] font-black uppercase tracking-widest transition-all shadow-sm ${selectedCertifyOption === 'all' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 ring-2 ring-indigo-500 ring-offset-2' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                            onClick={() => {
                                                setSelectedCertifyOption('all');
                                                setSelectedParticipantIds(
                                                    qualifiedParticipants.map(p => p.id)
                                                );
                                            }}
                                            style={{ padding: '0 10px' }}
                                        >
                                            Select All
                                        </button>
                                    </div>
                                </div>
                            )}

                            {loadingParticipants ? (
                                <div className="flex flex-col items-center justify-center py-10 gap-3">
                                    <div className="w-8 h-8 border-3 border-slate-100 border-t-indigo-500 rounded-full animate-spin" />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Validating benchmarks</p>
                                </div>
                            ) : filteredCertifyParticipants.length === 0 ? (
                                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                    <p className="text-slate-400 font-bold italic">No qualified students found matching your search.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {currentCertifyParticipants.map((p, idx) => (
                                        <div key={idx} className="flex items-center justify-between bg-white border border-slate-100 rounded-2xl hover:border-indigo-500/20 transition-all group shadow-sm" style={{ padding: '20px 30px', marginBottom: '12px' }}>
                                            <div className="flex items-center gap-3 md:gap-4">
                                                {(selectedCertifyOption === 'one' || selectedCertifyOption === 'few') && (
                                                    <input 
                                                        type="checkbox"
                                                        className="w-5 h-5 md:w-6 md:h-6 rounded border-slate-300 text-indigo-500 focus:ring-indigo-500 cursor-pointer accent-indigo-500 transition-all hover:scale-110"
                                                        style={{ marginRight: '10px' }}
                                                        checked={selectedParticipantIds.includes(p.id)}
                                                        onChange={(e) => {
                                                            if (selectedCertifyOption === 'one') {
                                                                if (e.target.checked) setSelectedParticipantIds([p.id]);
                                                                else setSelectedParticipantIds([]);
                                                            } else {
                                                                if (e.target.checked) setSelectedParticipantIds([...selectedParticipantIds, p.id]);
                                                                else setSelectedParticipantIds(selectedParticipantIds.filter(id => id !== p.id));
                                                            }
                                                        }}
                                                    />
                                                )}
                                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm md:text-md">
                                                    {p.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-bold text-slate-900 text-sm tracking-tight">{p.name}</span>
                                            </div>
                                            <span className="text-xs font-black text-indigo-500 uppercase tracking-widest">{p.score} Points</span>
                                        </div>
                                    ))}

                                    {/* Pagination for Certify Modal */}
                                    {filteredCertifyParticipants.length > 10 && (
                                        <div className="flex justify-center mt-6">
                                            <Pagination 
                                                currentPage={certifyCurrentPage}
                                                totalItems={filteredCertifyParticipants.length}
                                                itemsPerPage={10}
                                                onPageChange={setCertifyCurrentPage}
                                                isMobile={isMobile}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="border-t border-slate-100 flex gap-4 md:gap-6" style={{ padding: isMobile ? '20px' : '30px' }}>
                            <button
                                className="flex-1 h-14 md:h-16 rounded-2xl md:rounded-[2rem] bg-indigo-500 hover:bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] md:text-[12px] disabled:opacity-40 transition-all shadow-xl shadow-indigo-500/20 active:scale-95 disabled:cursor-not-allowed cursor-pointer"
                                onClick={handleGenerateCertificates}
                                disabled={certifying || qualifiedParticipants.length === 0 || !selectedCertifyOption || selectedParticipantIds.length === 0}
                            >
                                {certifying ? 'Transmitting...' : 'Authorize'}
                            </button>
                            <button
                                className="flex-1 h-14 md:h-16 rounded-2xl md:rounded-[2rem] bg-slate-100 hover:bg-slate-200 text-slate-900 font-black uppercase tracking-widest text-[10px] md:text-[12px] border border-slate-200 transition-all active:scale-95 cursor-pointer"
                                onClick={() => setShowCertifyModal(false)}
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* PENDING CERTIFICATIONS MODAL */}
            {showPendingModal && (
                <div
                    className="fixed inset-0 z-[100] backdrop-blur-md flex items-start md:items-center justify-center px-4 pt-20 md:pt-0"
                    style={{ background: 'rgba(15, 23, 42, 0.8)' }}
                    onClick={() => setShowPendingModal(false)}
                >
                    <div
                        className="w-full max-w-2xl mx-auto rounded-[2.5rem] bg-white overflow-hidden flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-300"
                        style={{ width: isMobile ? 'calc(100% - 1rem)' : '100%', maxHeight: '90vh' }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="border-b border-slate-50 flex items-center justify-between" style={{ padding: isMobile ? '20px' : '30px' }}>
                            <div className="flex items-center gap-4 md:gap-6">
                                <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-[1.5rem] bg-[#0f172a] flex items-center justify-center text-white shadow-2xl">
                                    <FaAward size={isMobile ? 22 : 28} />
                                </div>
                                <div className="flex flex-col gap-0.5 md:gap-1">
                                    <span className="text-[9px] md:text-[10px] font-black text-indigo-500 uppercase tracking-widest leading-none">Certification Status</span>
                                    <h2 className="font-bold text-[#0f172a] text-xl md:text-2xl tracking-tight capitalize leading-none" style={{color:'black'}}>Pending Reviews</h2>
                                </div>
                            </div>
                            <button onClick={() => setShowPendingModal(false)} className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 cursor-pointer transition-all">
                                <FaTimes size={isMobile ? 16 : 20} />
                            </button>
                        </div>

                        {/* Search Bar - Pending Reviews Modal */}
                        <div style={{ padding: '24px 30px 0', backgroundColor: '#ffffff' }}>
                            <div className="relative group">
                                <input 
                                    type="text"
                                    placeholder="Search through pending quiz reviews..."
                                    className="w-full h-14 pl-6 pr-14 rounded-2xl bg-slate-50 border-2 border-slate-100/50 focus:bg-white focus:border-indigo-500/30 focus:shadow-lg focus:shadow-indigo-500/5 transition-all text-sm font-bold text-slate-900 placeholder:text-slate-400 outline-none"
                                    value={pendingSearchTerm}
                                    onChange={(e) => {
                                        setPendingSearchTerm(e.target.value);
                                        setPendingCurrentPage(1);
                                    }}
                                />
                                <FaSearch className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                            </div>
                        </div>

                        {/* Modal Body / Quiz List */}
                        <div className="overflow-y-auto flex-grow custom-scrollbar" style={{ padding: isMobile ? '20px' : '30px' }}>
                            {(() => {
                                const filteredPending = analytics?.topicStats?.filter((stat: any) => 
                                    stat.topicName.toLowerCase().includes(pendingSearchTerm.toLowerCase())
                                ) || [];
                                
                                const indexOfLast = pendingCurrentPage * pendingItemsPerPage;
                                const indexOfFirst = indexOfLast - pendingItemsPerPage;
                                const currentPending = filteredPending.slice(indexOfFirst, indexOfLast);
                                const totalPendingPages = Math.ceil(filteredPending.length / pendingItemsPerPage) || 1;

                                if (filteredPending.length === 0) {
                                    return (
                                        <div className="py-20 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                            <p className="text-slate-400 font-bold italic">No matching quizzes discovered.</p>
                                        </div>
                                    );
                                }

                                return (
                                    <div className="flex flex-col gap-3">
                                        {currentPending.map((stat: any, idx: number) => (
                                            <div 
                                                key={stat.topicId || idx} 
                                                className="flex items-center justify-between bg-white border border-slate-100 rounded-2xl hover:border-indigo-500/20 transition-all group shadow-sm" 
                                                style={{ padding: isMobile ? '15px 20px' : '20px 30px' }}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-indigo-500 group-hover:bg-indigo-50 transition-all">
                                                        <FaBook size={18} />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-900 text-sm md:text-base tracking-tight">{stat.topicName}</span>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.categoryName || 'General Analytics'}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${stat.pendingCount > 0 ? 'bg-amber-100 text-amber-600 shadow-sm shadow-amber-500/10' : 'bg-slate-100 text-slate-400'}`}>
                                                        {stat.pendingCount} Pending
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Pagination for Modal */}
                                        {filteredPending.length > pendingItemsPerPage && (
                                            <div className="flex justify-center mt-6">
                                                <Pagination 
                                                    currentPage={pendingCurrentPage}
                                                    totalItems={filteredPending.length}
                                                    itemsPerPage={pendingItemsPerPage}
                                                    onPageChange={setPendingCurrentPage}
                                                    isMobile={isMobile}
                                                />
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Modal Footer */}
                        <div className="border-t border-slate-100 flex gap-4 md:gap-6" style={{ padding: isMobile ? '20px' : '30px' }}>
                            <button
                                className="w-full h-14 md:h-16 rounded-2xl md:rounded-[2rem] bg-[#0f172a] hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[10px] md:text-[12px] transition-all shadow-xl active:scale-95 cursor-pointer"
                                onClick={() => setShowPendingModal(false)}
                            >
                                Close Overview
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
