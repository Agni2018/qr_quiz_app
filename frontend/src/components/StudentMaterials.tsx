'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { FaBookOpen, FaFileAlt, FaVideo, FaTimes, FaBook } from 'react-icons/fa';

export default function StudentMaterials() {
    const [materials, setMaterials] = useState<any[]>([]);
    const [availableQuizzes, setAvailableQuizzes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTopicMaterials, setSelectedTopicMaterials] = useState<any[]>([]);
    const [viewingTopicName, setViewingTopicName] = useState('');
    const [showMaterialsModal, setShowMaterialsModal] = useState(false);

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
        setShowMaterialsModal(true);
    };

    const topicsWithMaterials = availableQuizzes.filter(q =>
        materials.some(m => (m.topicId?._id || m.topicId) === q._id)
    );

    const getFileUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        return `${baseUrl}${url}`;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    if (topicsWithMaterials.length === 0) {
        return (
            <Card className="p-32 text-center bg-slate-950/40 border-dashed border-2 border-white/5 rounded-[40px] mt-12">
                <div className="w-24 h-24 bg-slate-900 rounded-[2rem] flex items-center justify-center mx-auto mb-10 text-5xl">📚</div>
                <h3 className="text-4xl font-black mb-4">No materials available</h3>
                <p className="text-slate-500 mb-12 text-xl max-w-md mx-auto leading-relaxed">Check back later for study resources uploaded by your instructors.</p>
            </Card>
        );
    }

    return (
        <div style={{ padding: '2rem 1.5rem 4rem 1.5rem', margin: '0 auto', maxWidth: '1600px' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 mt-12">
                {topicsWithMaterials.map((topic) => (
                    <Card
                        key={topic._id}
                        className="group hover:-translate-y-3 transition-all duration-500 border-white/5 bg-[#0a0e1a]/80 backdrop-blur-xl hover:bg-[#0f172a] rounded-[2rem] flex flex-col h-full shadow-2xl overflow-hidden relative border"
                        style={{ padding: 20, margin: '0.75rem' }}
                    >
                        {/* TOP ICON AREA */}
                        <div className="h-40 bg-[#060910] flex items-center justify-center relative overflow-hidden">
                            <FaBook className="text-6xl text-primary/20 group-hover:scale-110 group-hover:text-primary/40 transition-all duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a] to-transparent opacity-60" />
                        </div>

                        <div className="flex flex-col flex-1 p-8 gap-4 relative z-10" style={{marginTop:20}}>
                            <h3 className="text-xl font-black group-hover:text-primary transition-colors uppercase tracking-tight text-white leading-tight">
                                {topic.name}
                            </h3>
                            <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed font-medium">
                                {topic.description || "Browse the study materials and resources for this topic."}
                            </p>

                            <div className="pt-6 border-t border-white/5 mt-auto">
                                <Button
                                    onClick={() => handleViewMaterials(topic._id, topic.name)}
                                    className="w-full py-4 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-white font-black uppercase tracking-widest text-[10px] transition-all border border-primary/20 shadow-lg shadow-primary/5 group-hover:shadow-primary/10"
                                >
                                    View Materials
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* MATERIALS MODAL */}
            {showMaterialsModal && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl animate-fade-in" onClick={() => setShowMaterialsModal(false)} style={{ padding: '2rem' }}>
                    <Card className="max-w-4xl w-full p-0 bg-slate-950 border-white/10 shadow-3xl rounded-[3rem] overflow-hidden" onClick={e => e.stopPropagation()} style={{ padding: '0', margin: '1rem' }}>
                        <div className="p-10 border-b border-white/5 bg-slate-900/40 flex justify-between items-center max-md:!p-6" style={{ padding: '2.5rem', marginBottom: '0' }}>
                            <div>
                                <h3 className="text-3xl font-black text-white">{viewingTopicName}</h3>
                                <p className="text-primary font-bold text-sm mt-1 uppercase tracking-widest leading-relaxed">Study Resources</p>
                            </div>
                            <button onClick={() => setShowMaterialsModal(false)} className="p-4 bg-white/5 hover:bg-red-500/20 hover:text-red-500 rounded-2xl transition-all text-slate-400">
                                <FaTimes size={24} />
                            </button>
                        </div>
                        <div className="p-10 max-h-[60vh] overflow-y-auto custom-scrollbar flex flex-col gap-6 max-md:p-6" style={{ padding: '2.5rem' }}>
                            {selectedTopicMaterials.map((m) => (
                                <div key={m._id} className="rounded-[2rem] bg-white/5 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-white/10 transition-all group" style={{ padding: '2rem' }}>
                                    <div className="flex items-center gap-8 min-w-0" style={{ padding: '0' }}>
                                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-3xl border border-primary/20 shrink-0">
                                            {m.fileType?.startsWith('video/') ? <FaVideo /> : <FaFileAlt />}
                                        </div>
                                        <div className="flex flex-col gap-2 min-w-0">
                                            <h4 className="text-xl font-black text-white group-hover:text-primary transition-colors uppercase tracking-tight break-all md:break-words">{m.name}</h4>
                                            {m.description && <p className="text-slate-400 text-sm italic leading-relaxed">"{m.description}"</p>}
                                        </div>
                                    </div>
                                    <a href={getFileUrl(m.fileUrl)} target="_blank" rel="noopener noreferrer" className="w-full md:w-auto">
                                        <Button className="w-full md:px-10 py-5 rounded-2xl bg-primary text-white font-black border-none uppercase tracking-widest text-xs flex items-center gap-3" style={{ margin: '0' }}>
                                            Open Resource
                                        </Button>
                                    </a>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
