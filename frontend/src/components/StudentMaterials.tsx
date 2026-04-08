'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { FaBookOpen, FaFileAlt, FaVideo, FaTimes, FaBook, FaSearch } from 'react-icons/fa';
import Pagination from '@/components/Pagination';
import { useSearch } from '@/contexts/SearchContext';

export default function StudentMaterials() {
    const [materials, setMaterials] = useState<any[]>([]);
    const [availableQuizzes, setAvailableQuizzes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { searchTerm: searchQuery } = useSearch();
    const [selectedTopicMaterials, setSelectedTopicMaterials] = useState<any[]>([]);
    const [viewingTopicName, setViewingTopicName] = useState('');
    const [showMaterialsModal, setShowMaterialsModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
    const [modalSearchTerm, setModalSearchTerm] = useState('');
    const [modalCurrentPage, setModalCurrentPage] = useState(1);
    const MODAL_ITEMS_PER_PAGE = 6;

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowWidth < 768;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [quizzesRes, materialsRes] = await Promise.all([
                    api.get('/topics'),
                    api.get('/study-materials')
                ]);
                setAvailableQuizzes(quizzesRes.data.filter((q: any) => q.status === 'active'));
                setMaterials(materialsRes.data || []);
            } catch (err) {
                console.error('Error fetching materials:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleViewMaterials = (topicId: string, topicName: string) => {
        const topicMaterials = materials.filter(m => (m.topicId?._id || m.topicId) === topicId);
        setSelectedTopicMaterials(topicMaterials);
        setViewingTopicName(topicName);
        setModalSearchTerm('');
        setModalCurrentPage(1);
        setShowMaterialsModal(true);
    };

    // Filtering
    const filteredTopics = availableQuizzes.filter(q =>
        (q.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
         q.description?.toLowerCase().includes(searchQuery.toLowerCase())) &&
        materials.some(m => (m.topicId?._id || m.topicId) === q._id)
    );

    const totalItems = filteredTopics.length;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentTopics = filteredTopics.slice(startIndex, startIndex + itemsPerPage);

    const getFileUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        return `${baseUrl}${url}`;
    };

    const filteredModalMaterials = selectedTopicMaterials.filter(m =>
        m.name.toLowerCase().includes(modalSearchTerm.trim().toLowerCase()) ||
        (m.fileType && m.fileType.toLowerCase().includes(modalSearchTerm.trim().toLowerCase()))
    );

    const modalIndexOfLastItem = modalCurrentPage * MODAL_ITEMS_PER_PAGE;
    const modalIndexOfFirstItem = modalIndexOfLastItem - MODAL_ITEMS_PER_PAGE;
    const paginatedModalMaterials = filteredModalMaterials.slice(modalIndexOfFirstItem, modalIndexOfLastItem);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    if (filteredTopics.length === 0 && searchQuery === '') {
        return (
            <Card className="p-16 text-center bg-slate-950/40 border-dashed border-2 border-white/5 rounded-[24px] mt-8">
                <div className="w-16 h-16 bg-slate-900 rounded-[1.25rem] flex items-center justify-center mx-auto mb-6 text-3xl">📚</div>
                <h3 className="text-2xl font-black mb-2">No materials available</h3>
                <p className="text-slate-500 mb-8 text-base max-w-md mx-auto leading-relaxed">Check back later for study resources uploaded by your instructors.</p>
            </Card>
        );
    }

    return (
        <div style={{ padding: '2rem 1.5rem 4rem 1.5rem', margin: '0 auto', maxWidth: '1600px' }}>
            {filteredTopics.length === 0 && (
                <div className="col-span-full py-20 text-center flex flex-col items-center gap-4" style={{ color: '#555' }}>
                    <p className="font-bold text-xl">No materials found matching "{searchQuery}"</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-10" style={{marginTop:0}}>
                {currentTopics.map((topic) => {
                    const itemCount = materials.filter(m => (m.topicId?._id || m.topicId) === topic._id).length;
                    return (
                        <Card
                            key={topic._id}
                            className="rounded-[1.25rem] flex flex-col gap-3 border border-slate-100 hover:border-slate-200 transition-all group relative overflow-hidden shadow-xl"
                            style={{ padding: '16px', margin: '0.15rem', background: '#fff' }}
                        >
                            {/* Card Header */}
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-md bg-indigo-500/10 text-indigo-500">
                                    Topic
                                </span>
                                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200/50">
                                    {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
                                </span>
                            </div>

                            {/* Content */}
                            <div className="flex flex-col flex-1 gap-4">
                                <h3 className="text-lg font-black group-hover:text-primary transition-colors uppercase tracking-tight text-black leading-tight line-clamp-1" style={{color:'black'
                        
                                }}>
                                    {topic.name}
                                </h3>
                                <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed font-medium min-h-[40px]" style={{color:'black'}}>
                                    {topic.description || "Browse the study materials and resources for this topic."}
                                </p>
                            </div>

                            {/* Footer Action */}
                            <div className="pt-3 border-t border-slate-100 mt-1 box-border">
                                <Button
                                    onClick={() => handleViewMaterials(topic._id, topic.name)}
                                    className="w-full py-3 rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-white font-black uppercase tracking-widest text-[10px] transition-all border border-primary/20 shadow-lg shadow-primary/5 group-hover:shadow-primary/10"
                                >
                                    View Materials
                                </Button>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Pagination Controls */}
            {filteredTopics.length > 0 && (
                <div className="px-4 mt-20 flex justify-center">
                    <Pagination 
                        currentPage={currentPage}
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        isMobile={isMobile}
                        style={{ 
                            maxWidth: isMobile ? '100%' : '400px',
                            marginTop:40
                        }}
                    />
                </div>
            )}

            {/* MATERIALS MODAL */}
            {showMaterialsModal && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-fade-in" onClick={() => setShowMaterialsModal(false)} style={{ padding: '2rem' }}>
                    <Card className="max-w-4xl w-full p-0 bg-white shadow-2xl rounded-[3rem] overflow-hidden border border-slate-100 flex flex-col gap-0" onClick={e => e.stopPropagation()} style={{ padding: '0', margin: '1rem' }}>
                        <div className="border-b border-slate-50 bg-white flex justify-between items-center" style={{ padding: '24px 32px' }}>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">Study Resources</span>
                                <h3 className="text-2xl font-black uppercase tracking-tight" style={{ color: '#4f46e5' }}>{viewingTopicName}</h3>
                            </div>
                            <button onClick={() => setShowMaterialsModal(false)} className="w-12 h-12 bg-slate-100 hover:bg-slate-200 rounded-full transition-all text-slate-400 flex items-center justify-center shadow-sm cursor-pointer">
                                <FaTimes size={20} />
                            </button>
                        </div>

                        {/* Search Bar Area */}
                        <div style={{ padding: '24px 32px 0', backgroundColor: '#ffffff' }}>
                            <div className="relative group">
                                <input 
                                    type="text"
                                    placeholder="Search study materials..."
                                    className="w-full h-14 pl-6 pr-14 rounded-2xl bg-slate-50 border-2 border-slate-100/50 focus:bg-white focus:border-indigo-500/30 focus:shadow-lg focus:shadow-indigo-500/5 transition-all text-sm font-bold text-slate-900 placeholder:text-slate-400 outline-none"
                                    value={modalSearchTerm}
                                    onChange={(e) => {
                                        setModalSearchTerm(e.target.value);
                                        setModalCurrentPage(1);
                                    }}
                                />
                                <FaSearch className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                            </div>
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar flex flex-col gap-4 bg-white" style={{ padding: '24px 32px' }}>
                            {filteredModalMaterials.length === 0 ? (
                                <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                    <p className="text-slate-400 font-bold italic" style={{ color: 'black' }}>No materials found matching your search.</p>
                                </div>
                            ) : (
                                paginatedModalMaterials.map((m) => (
                                    <div key={m._id} className="rounded-3xl bg-white border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-indigo-500/20 group transition-all" style={{ padding: '24px' }}>
                                        <div className="flex items-center gap-6 min-w-0 flex-1">
                                            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                                                {m.fileType?.startsWith('video/') ? <FaVideo /> : <FaFileAlt />}
                                            </div>
                                            <div className="flex flex-col gap-1 min-w-0">
                                                <h4 className="text-lg font-black uppercase tracking-tight break-words" style={{ color: 'black' }}>{m.name}</h4>
                                                {m.description && <p className="text-slate-400 text-xs font-bold leading-relaxed line-clamp-1" style={{ color: 'black' }}>{m.description}</p>}
                                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300 mt-1" style={{ color: 'black' }}>
                                                    {m.fileType?.split('/')[1]?.toUpperCase() || 'FILE'}
                                                </span>
                                            </div>
                                        </div>
                                        <a href={getFileUrl(m.fileUrl)} target="_blank" rel="noopener noreferrer" className="w-full md:w-auto">
                                            <Button className="w-full md:px-10 py-5 rounded-2xl bg-primary text-white font-black border-none uppercase tracking-widest text-xs flex items-center gap-3" style={{ margin: '0' }}>
                                                Open Resource
                                            </Button>
                                        </a>
                                    </div>
                                ))
                            )}

                            {/* Pagination */}
                            {filteredModalMaterials.length > MODAL_ITEMS_PER_PAGE && (
                                <div className="flex justify-center mt-6">
                                    <Pagination 
                                        currentPage={modalCurrentPage}
                                        totalItems={filteredModalMaterials.length}
                                        itemsPerPage={MODAL_ITEMS_PER_PAGE}
                                        onPageChange={setModalCurrentPage}
                                        isMobile={isMobile}
                                    />
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
