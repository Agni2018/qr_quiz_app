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
    FaTimes
} from 'react-icons/fa';
import AlertModal from '@/components/AlertModal';
import ConfirmModal from '@/components/ConfirmModal';

export default function UploadedMaterials() {
    const [topics, setTopics] = useState<any[]>([]);
    const [materials, setMaterials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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

    return (
        <div className="flex flex-col gap-10 md:gap-16">
            {materials.length === 0 ? (
                <Card className="p-20 text-center bg-slate-950/40 border-dashed border-2 border-white/5 rounded-[40px]">
                    <div className="w-24 h-24 bg-slate-900 rounded-[2rem] flex items-center justify-center mx-auto mb-10 text-5xl">📂</div>
                    <h3 className="text-3xl font-black mb-4 text-white">No materials uploaded yet</h3>
                    <p className="text-slate-500 mb-8 max-w-md mx-auto">Upload materials through individual topic settings to help your students.</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {topics.filter(t => materials.some(m => (m.topicId?._id || m.topicId) === t._id)).map((topic) => (
                        <Card
                            key={topic._id}
                            className="group hover:-translate-y-3 transition-all duration-500 border-white/5 bg-slate-950/40 hover:bg-slate-900/60 rounded-[2.5rem] flex flex-col h-full shadow-2xl overflow-hidden relative"
                            style={{ padding: '2.5rem', margin: '0 1rem 1rem 1rem' }}
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/20 transition-all duration-700" />
                            <div className="flex flex-col gap-8 flex-1">
                                <div className="flex justify-between items-start relative z-10">
                                    <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center text-3xl text-rose-500 border border-rose-500/20 group-hover:rotate-12 transition-all">
                                        <FaBookOpen />
                                    </div>
                                    <span className="bg-rose-500/10 text-rose-400 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-rose-500/10">
                                        {materials.filter(m => (m.topicId?._id || m.topicId) === topic._id).length} Items
                                    </span>
                                </div>

                                <div className="flex flex-col gap-8 relative z-10">
                                    <h3 className="text-xl font-black group-hover:text-rose-400 transition-colors uppercase tracking-tight text-white">{topic.name}</h3>
                                    <p className="text-slate-500 text-lg line-clamp-2 leading-relaxed">{topic.description || "Manage the study resources for this specific topic."}</p>
                                </div>
                            </div>

                            {/* Consistent Spacer */}
                            <div className="h-10" />

                            <div className="pt-10 border-t border-white/5 mt-auto">
                                <Button
                                    onClick={() => handleViewMaterials(topic._id, topic.name)}
                                    className="w-full py-5 rounded-2xl bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white font-black uppercase tracking-widest text-xs transition-all border border-rose-500/20 relative z-10"
                                >
                                    View & Manage
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* ADMIN STUDY MATERIALS MODAL */}
            {showAdminMaterialsModal && (
                <div className="fixed inset-0 z-[400] flex items-center justify-center p-6 bg-black/90 backdrop-blur-2xl animate-fade-in" onClick={() => setShowAdminMaterialsModal(false)}>
                    <Card className="max-w-4xl w-full p-0 bg-[#0f172a] border-white/10 shadow-3xl rounded-[3rem] overflow-hidden max-md:!p-4 max-md:!m-0" onClick={(e) => e.stopPropagation()} style={{ padding: 30, margin: '0 2rem 1rem 1rem' }}>
                        <div className="p-10 border-b border-white/5 bg-slate-900/40 flex justify-between items-center max-md:!p-4" style={{ padding: 30, marginBottom: 20 }}>
                            <div>
                                <h3 className="text-3xl font-black text-white max-md:text-2xl">{selectedTopicName}</h3>
                                <p className="text-rose-400 font-bold text-sm mt-1 uppercase tracking-widest max-md:text-xs">Study Resource Management</p>
                            </div>
                            <button onClick={() => setShowAdminMaterialsModal(false)} className="p-3 bg-white/5 hover:bg-red-500/20 hover:text-red-500 rounded-2xl transition-all text-slate-400">
                                <FaTimes size={20} />
                            </button>
                        </div>
                        <div className="p-10 max-h-[60vh] overflow-y-auto custom-scrollbar flex flex-col gap-6 max-md:p-4 max-md:pr-2" style={{ marginBottom: 20 }}>
                            {selectedTopicMaterials.length === 0 ? (
                                <p className="text-center py-20 text-slate-500 font-bold italic">No materials found for this topic.</p>
                            ) : (
                                selectedTopicMaterials.map((m) => (
                                    <div key={m._id} className="rounded-[2rem] bg-white/5 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-white/10 transition-all group min-w-0 max-md:!p-5" style={{ padding: '50' }}>
                                        <div className="flex items-center gap-8 min-w-0 max-md:!p-0 max-md:gap-4" style={{ padding: 30 }}>
                                            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 text-3xl border border-rose-500/20 shrink-0 max-md:w-12 max-md:h-12 max-md:text-xl">
                                                {m.fileType?.startsWith('video/') ? <FaVideo /> : <FaFileAlt />}
                                            </div>
                                            <div className="flex flex-col gap-3 min-w-0 max-md:gap-1">
                                                <h4 className="text-xl font-black text-white group-hover:text-rose-400 transition-colors uppercase tracking-tight break-all md:break-words max-md:text-lg">{m.name}</h4>
                                                {m.description && <p className="text-slate-400 text-sm italic leading-relaxed max-md:text-xs">"{m.description}"</p>}
                                                <span className="text-[0.6rem] font-black uppercase tracking-widest text-[#64748b] mt-1 break-all">
                                                    {m.fileType?.split('/')[1]?.toUpperCase() || 'FILE'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto pt-4 md:pt-0 shrink-0">
                                            <a href={getFileUrl(m.fileUrl)} target="_blank" rel="noopener noreferrer" className="flex-1 md:flex-none w-full md:w-auto">
                                                <Button className="w-full md:px-10 py-5 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black border-none flex items-center justify-center gap-3 max-md:!m-0 max-md:!w-full" style={{margin:'20px 20px 20px 20px',width:200}}>
                                                    View Material
                                                </Button>
                                            </a>
                                            <Button
                                                onClick={() => deleteMaterial(m._id)}
                                                className="w-full md:px-6 py-5 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-500 font-black border-none flex items-center justify-center max-md:!m-0 max-md:!w-full"
                                                style={{margin:'20px 20px 20px 60px',width:100}}
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
