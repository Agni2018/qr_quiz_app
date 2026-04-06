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
    FaFolderOpen,
    FaChevronRight,
    FaChevronLeft,
    FaSearch
} from 'react-icons/fa';
import AlertModal from '@/components/AlertModal';
import ConfirmModal from '@/components/ConfirmModal';
import Pagination from './Pagination';
import { useSearch } from '@/contexts/SearchContext';

const ITEMS_PER_PAGE = 8;

export default function UploadedMaterials() {
    const [topics, setTopics] = useState<any[]>([]);
    const [materials, setMaterials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const { searchTerm } = useSearch();

    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const handleResize = () => setWindowWidth(window.innerWidth);
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }
    }, []);

    const isMobile = windowWidth < 768;

    // Management Modal State
    const [showAdminMaterialsModal, setShowAdminMaterialsModal] = useState(false);
    const [selectedTopicId, setSelectedTopicId] = useState('');
    const [selectedTopicName, setSelectedTopicName] = useState('');
    const [selectedTopicMaterials, setSelectedTopicMaterials] = useState<any[]>([]);
    const [modalSearchTerm, setModalSearchTerm] = useState('');
    const [modalCurrentPage, setModalCurrentPage] = useState(1);
    const MODAL_ITEMS_PER_PAGE = 6;

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

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handleViewMaterials = (topicId: string, topicName: string) => {
        const topicMaterials = materials.filter(m => (m.topicId?._id || m.topicId) === topicId);
        setSelectedTopicId(topicId);
        setSelectedTopicName(topicName);
        setSelectedTopicMaterials(topicMaterials);
        setModalSearchTerm('');
        setModalCurrentPage(1);
        setShowAdminMaterialsModal(true);
    };

    const deleteMaterial = (id: string) => {
        setConfirmModal({
            isOpen: true,
            message: 'Are you sure you want to delete this material?',
            onConfirm: async () => {
                try {
                    await api.delete(`/study-materials/${id}`);
                    setSelectedTopicMaterials(prev => prev.filter(m => m._id !== id));
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
                <div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-500 rounded-full animate-spin" />
            </div>
        );
    }

    const filteredTopics = topics.filter(t => 
        (t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
         materials.some(m => (m.topicId?._id || m.topicId) === t._id && m.name.toLowerCase().includes(searchTerm.toLowerCase()))) &&
        materials.some(m => (m.topicId?._id || m.topicId) === t._id)
    );

    const totalItems = filteredTopics.length;
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentTopics = filteredTopics.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const filteredModalMaterials = selectedTopicMaterials.filter(m => 
        m.name.toLowerCase().includes(modalSearchTerm.trim().toLowerCase()) ||
        (m.fileType && m.fileType.toLowerCase().includes(modalSearchTerm.trim().toLowerCase()))
    );

    const modalIndexOfLastItem = modalCurrentPage * MODAL_ITEMS_PER_PAGE;
    const modalIndexOfFirstItem = modalIndexOfLastItem - MODAL_ITEMS_PER_PAGE;
    const paginatedModalMaterials = filteredModalMaterials.slice(modalIndexOfFirstItem, modalIndexOfLastItem);

    return (
        <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-1">
                
                <h3 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter" style={{color:'black'}}>Uploaded Files</h3>
                
            </div>

            {materials.length === 0 ? (
                <div className="py-24 text-center bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200 flex flex-col items-center justify-center">
                    <FaFolderOpen className="text-6xl mb-6 text-slate-200" />
                    <h3 className="text-xl font-black text-slate-400 uppercase tracking-tight">Repository is empty</h3>
                    <p className="text-slate-400 font-bold text-sm mt-2 max-w-xs">Upload materials through topic settings first.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {currentTopics.map((topic) => {
                            const topicMaterials = materials.filter(m => (m.topicId?._id || m.topicId) === topic._id);
                            const itemCount = topicMaterials.length;
                            return (
                                <div
                                    key={topic._id}
                                    className="bg-white rounded-[2.5rem] flex flex-col group relative overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100"
                                    style={{ padding: '20px', minHeight: '260px' }}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-2xl text-indigo-500 group-hover:scale-110 transition-transform" style={{ marginBottom: 6 }}>
                                            <FaFolderOpen />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-slate-50 text-slate-400 rounded-md" style={{ color: 'green' }}>
                                            Topic Folder
                                        </span>
                                    </div>

                                    <div className="flex flex-col gap-3 flex-1">
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight uppercase group-hover:text-indigo-500 transition-colors" style={{marginTop:10,color:'black'}}>
                                            {topic.name}
                                        </h3>
                                        <p className="text-sm font-bold text-slate-400 line-clamp-3 leading-relaxed" style={{color:'black'}}>
                                            {topic.description || 'Access and manage the educational study material resources uploaded for this specific quiz topic.'}
                                        </p>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-slate-50 flex flex-col gap-4" style={{marginTop: 6}}>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest" style={{ color: 'black' }}>Total Assets</span>
                                            <span className="text-lg font-black text-slate-900 tracking-tighter">
                                                {itemCount}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleViewMaterials(topic._id, topic.name)}
                                            className="w-full h-12 rounded-2xl bg-[#4f46e5] hover:bg-indigo-600 text-white font-black uppercase tracking-widest text-[11px] transition-all flex items-center justify-center gap-3 active:scale-95 shadow-lg shadow-indigo-500/10 cursor-pointer"
                                        >
                                            View Folder <FaChevronRight size={10} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}

                        {currentTopics.length === 0 && (
                            <div className="col-span-full py-20 text-center bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                                <h3 className="text-lg font-black text-slate-400 uppercase tracking-tight">No results matched your search</h3>
                            </div>
                        )}
                    </div>

                    {totalItems > 0 && (
                        <div className="flex justify-center mt-12 mb-8">
                            <Pagination 
                                currentPage={currentPage}
                                totalItems={totalItems}
                                itemsPerPage={ITEMS_PER_PAGE}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* MANAGEMENT MODAL */}
            {showAdminMaterialsModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setShowAdminMaterialsModal(false)}>
                    <Card className="max-w-4xl w-full p-0 bg-white shadow-2xl rounded-[3rem] overflow-hidden border border-slate-100 flex flex-col gap-0" onClick={(e) => e.stopPropagation()} style={{margin:'1rem 1rem 1rem 1rem'}}>
                        <div className="border-b border-slate-50 bg-white flex justify-between items-center" style={{ padding: '24px 32px' }}>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">Asset Management</span>
                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight" style={{color:'#4f46e5'}}>{selectedTopicName}</h3>
                            </div>
                            <button onClick={() => setShowAdminMaterialsModal(false)} className="w-12 h-12 bg-slate-100 hover:bg-slate-200 rounded-full transition-all text-slate-400 flex items-center justify-center shadow-sm cursor-pointer">
                                <FaTimes size={20} />
                            </button>
                        </div>

                        {/* Search Bar Area */}
                        <div style={{ padding: '24px 32px 0', backgroundColor: '#ffffff' }}>
                            <div className="relative group">
                                <input 
                                    type="text"
                                    placeholder="Execute search across materials..."
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
                                    <p className="text-slate-400 font-bold italic">No records discovered matching your search.</p>
                                </div>
                            ) : (
                                paginatedModalMaterials.map((m) => (
                                    <div key={m._id} className="rounded-3xl bg-white border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-indigo-500/20 group transition-all" style={{ padding: '24px' }}>
                                        <div className="flex items-center gap-6 min-w-0 flex-1">
                                            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                                                {m.fileType?.startsWith('video/') ? <FaVideo /> : <FaFileAlt />}
                                            </div>
                                            <div className="flex flex-col gap-1 min-w-0">
                                                <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight break-words" style={{color:'black'}}>{m.name}</h4>
                                                {m.description && <p className="text-slate-400 text-xs font-bold leading-relaxed line-clamp-1" style={{color:'black'}}>{m.description}</p>}
                                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300 mt-1" style={{color:'black'}}>
                                                    {m.fileType?.split('/')[1]?.toUpperCase() || 'FILE'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0" >
                                            <a href={getFileUrl(m.fileUrl)} target="_blank" rel="noopener noreferrer" className="h-12 px-6 rounded-xl bg-white border-2 border-indigo-500 hover:bg-indigo-50 text-indigo-600 font-bold uppercase tracking-widest text-[10px] flex items-center justify-center transition-all shadow-sm" style={{padding:12}}>
                                                Download
                                            </a>
                                            <button
                                                onClick={() => deleteMaterial(m._id)}
                                                className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all border border-red-100"
                                            >
                                                <FaTrash size={16} />
                                            </button>
                                        </div>
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

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmModal.onConfirm}
                message={confirmModal.message}
                isDanger={true}
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
