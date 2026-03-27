'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Card from '@/components/Card';
import Button from '@/components/Button';
import {
    FaTrash,
    FaFileAlt,
    FaBookOpen,
    FaVideo,
    FaTimes,
    FaBook
} from 'react-icons/fa';
import AlertModal from '@/components/AlertModal';
import ConfirmModal from '@/components/ConfirmModal';
import Pagination from './Pagination';

export default function UploadedMaterials() {
    const [topics, setTopics] = useState<any[]>([]);
    const [materials, setMaterials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowWidth < 768;

    // Management Modal State
    const [showAdminMaterialsModal, setShowAdminMaterialsModal] = useState(false);
    const [selectedTopicId, setSelectedTopicId] = useState('');
    const [selectedTopicName, setSelectedTopicName] = useState('');
    const [selectedTopicMaterials, setSelectedTopicMaterials] = useState<any[]>([]);

    const [alertModal, setAlertModal] = useState({ isOpen: false, message: '', type: 'info' as 'success' | 'error' | 'info' });
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, message: '', onConfirm: () => {} });

    const fetchData = async () => {
        try {
            const [topicsRes, materialsRes] = await Promise.all([
                api.get('/topics'),
                api.get('/study-materials')
            ]);
            setTopics(topicsRes.data);
            setMaterials(materialsRes.data);
        } catch (err) {
            console.error('Fetch materials error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleViewMaterials = (topicId: string, topicName: string) => {
        const topicMaterials = materials.filter(m => (m.topicId?._id || m.topicId) === topicId);
        setSelectedTopicId(topicId);
        setSelectedTopicName(topicName);
        setSelectedTopicMaterials(topicMaterials);
        setShowAdminMaterialsModal(true);
    };

    const deleteMaterial = (id: string) => {
        setConfirmModal({
            isOpen: true,
            message: 'Are you sure you want to delete this material?',
            onConfirm: async () => {
                try {
                    await api.delete(`/study-materials/${id}`);
                    // Update local state for the modal
                    setSelectedTopicMaterials(prev => prev.filter(m => m._id !== id));
                    // Update global state
                    setMaterials(prev => prev.filter(m => m._id !== id));
                    setAlertModal({ isOpen: true, message: 'Material deleted successfully', type: 'success' });
                } catch (err) {
                    console.error('Delete material error:', err);
                    setAlertModal({ isOpen: true, message: 'Failed to delete material', type: 'error' });
                }
            }
        });
    };

    const getFileUrl = (url: string) => {
        if (!url) return '#';
        if (url.startsWith('http')) return url;
        return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    const filteredTopics = topics.filter(t => materials.some(m => (m.topicId?._id || m.topicId) === t._id));
    const totalItems = filteredTopics.length;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentTopics = filteredTopics.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="flex flex-col gap-10 md:gap-16" style={{ padding: '2rem 1.5rem 4rem 1.5rem', margin: '0 auto', maxWidth: '1600px' }}>
            {materials.length === 0 ? (
                <Card className="p-20 text-center bg-slate-950/40 border-dashed border-2 border-white/5 rounded-[40px]">
                    <div className="w-24 h-24 bg-slate-900 rounded-[2rem] flex items-center justify-center mx-auto mb-10 text-5xl">📂</div>
                    <h3 className="text-3xl font-black mb-4 text-white">No materials uploaded yet</h3>
                    <p className="text-slate-500 mb-8 max-w-md mx-auto">Upload materials through individual topic settings to help your students.</p>
                </Card>
            ) : (
                <>
                    {/* Pagination Controls */}
                    <div className="px-4 mb-8">
                        <Pagination 
                            currentPage={currentPage}
                            totalItems={totalItems}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                            isMobile={isMobile}
                            style={{ 
                                maxWidth: isMobile ? '100%' : '400px'
                            }}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {currentTopics.map((topic) => (
                        <Card
                            key={topic._id}
                            className="group hover:-translate-y-3 transition-all duration-500 border-white/5 bg-[#0a0e1a]/80 backdrop-blur-xl hover:bg-[#0f172a] rounded-[2rem] flex flex-col h-full shadow-2xl overflow-hidden relative border"
                            style={{ padding: '30px' }}
                        >
                            {/* NEW DESIGN: Top Icon Area */}
                            <div className="h-40 bg-[#060910] flex items-center justify-center relative overflow-hidden">
                                <FaBook className="text-6xl text-primary/20 group-hover:scale-110 group-hover:text-primary/40 transition-all duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a] to-transparent opacity-60" />
                                
                                {/* Badge */}
                                <div className="absolute top-4 left-4 z-10">
                                    <span className="bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md border border-primary/20 backdrop-blur-md" style={{padding:5,fontSize:12,marginBottom:5}}>
                                        {materials.filter(m => (m.topicId?._id || m.topicId) === topic._id).length} Items
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col flex-1 p-8 gap-4 relative z-10" style={{marginTop:30}}>
                                <h3 className="text-xl font-black group-hover:text-primary transition-colors uppercase tracking-tight text-white leading-tight">
                                    {topic.name}
                                </h3>
                                <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed font-medium">
                                    {topic.description || "Access and manage the curated collections of knowledge for this topic."}
                                </p>

                                <div className="pt-6 border-t border-white/5 mt-auto" style={{marginTop:10}}>
                                    <Button
                                        onClick={() => handleViewMaterials(topic._id, topic.name)}
                                        className="w-full py-4 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-white font-black uppercase tracking-widest text-[10px] transition-all border border-primary/20 shadow-lg shadow-primary/5 group-hover:shadow-primary/10"
                                    >
                                        View & Manage
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
                </>
            )}

            {/* ADMIN STUDY MATERIALS MODAL */}
            {showAdminMaterialsModal && (
                <div className="fixed inset-0 z-[400] flex items-center justify-center p-6 bg-black/90 backdrop-blur-2xl animate-fade-in" onClick={() => setShowAdminMaterialsModal(false)}>
                    <Card className="max-w-4xl w-full p-0 bg-[#0f172a] border-white/10 shadow-3xl rounded-[3rem] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="border-b border-white/5 bg-slate-900/40 flex justify-between items-center" style={{ padding: '30px' }}>
                            <div>
                                <h3 className="text-3xl font-black text-white max-md:text-2xl">{selectedTopicName}</h3>
                                <p className="text-primary font-bold text-sm mt-1 uppercase tracking-widest max-md:text-xs">Study Resource Management</p>
                            </div>
                            <button onClick={() => setShowAdminMaterialsModal(false)} className="p-3 bg-white/5 hover:bg-red-500/20 hover:text-red-500 rounded-2xl transition-all text-slate-400">
                                <FaTimes size={20} />
                            </button>
                        </div>
                        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar flex flex-col gap-6" style={{ padding: '30px' }}>
                            {selectedTopicMaterials.length === 0 ? (
                                <p className="text-center py-20 text-slate-500 font-bold italic">No materials found for this topic.</p>
                            ) : (
                                selectedTopicMaterials.map((m) => (
                                    <div key={m._id} className="rounded-[2rem] bg-white/5 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-white/10 transition-all group min-w-0" style={{ padding: '2rem' }}>
                                        <div className="flex items-center gap-8 min-w-0 max-md:gap-4" style={{ padding: '0' }}>
                                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-3xl border border-primary/20 shrink-0 max-md:w-12 max-md:h-12 max-md:text-xl">
                                                {m.fileType?.startsWith('video/') ? <FaVideo /> : <FaFileAlt />}
                                            </div>
                                            <div className="flex flex-col gap-3 min-w-0 max-md:gap-1">
                                                <h4 className="text-xl font-black text-white group-hover:text-primary transition-colors uppercase tracking-tight break-all md:break-words max-md:text-lg">{m.name}</h4>
                                                {m.description && <p className="text-slate-400 text-sm italic leading-relaxed max-md:text-xs">"{m.description}"</p>}
                                                <span className="text-[0.6rem] font-black uppercase tracking-widest text-[#64748b] mt-1 break-all">
                                                    {m.fileType?.split('/')[1]?.toUpperCase() || 'FILE'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto pt-4 md:pt-0 shrink-0">
                                            <a href={getFileUrl(m.fileUrl)} target="_blank" rel="noopener noreferrer" className="flex-1 md:flex-none">
                                                <Button className="w-full md:px-10 py-5 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black border-none flex items-center justify-center gap-3" style={{ margin: '0' }}>
                                                    View Material
                                                </Button>
                                            </a>
                                            <Button
                                                onClick={() => deleteMaterial(m._id)}
                                                className="w-full md:px-6 py-5 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-500 font-black border-none flex items-center justify-center"
                                                style={{ margin: '0' }}
                                            >
                                                <FaTrash />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="p-8 bg-slate-900/20 border-t border-white/5 flex justify-center max-md:p-4">
                            <p className="text-slate-500 text-xs font-medium uppercase tracking-widest text-center">
                                Admins can manage and delete materials. Students can download these for learning.
                            </p>
                        </div>
                    </Card>
                </div>
            )}

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmModal.onConfirm}
                message={confirmModal.message}
            />
            <AlertModal
                isOpen={alertModal.isOpen}
                onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
                message={alertModal.message}
                type={alertModal.type}
            />
        </div>
    );
}
