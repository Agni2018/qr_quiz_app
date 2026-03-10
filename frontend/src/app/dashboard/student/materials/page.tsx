'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { FaBookOpen, FaFileAlt, FaVideo, FaTimes } from 'react-icons/fa';

export default function MaterialsPage() {
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

    return (
        <div className="animate-fade-in mb-32">
            <div className="flex items-center gap-8 mb-32 group" style={{ margin: '10px 0 50px 0' }}>
                <div style={{
                    width: '5rem',
                    height: '5rem',
                    borderRadius: '1.5rem',
                    background: 'linear-gradient(135deg, #f43f5e, #fb7185)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.25rem',
                    boxShadow: '0 10px 40px rgba(244, 63, 94, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    transform: 'rotate(-3deg)'
                }} className="group-hover:rotate-0 transition-transform duration-500">
                    📚
                </div>
                <div className="flex flex-col">
                    <h2
                        className="text-7xl font-black tracking-tighter"
                        style={{
                            backgroundImage: 'linear-gradient(to right, #f43f5e, #fb7185)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}
                    >
                        Study Materials
                    </h2>
                    <div className="h-2 w-32 rounded-full mt-2 opacity-40 bg-gradient-to-r from-[#f43f5e] to-transparent" />
                </div>
            </div>

            {topicsWithMaterials.length === 0 ? (
                <Card className="p-32 text-center bg-slate-950/40 border-dashed border-2 border-white/5 rounded-[40px] mt-12">
                    <div className="w-24 h-24 bg-slate-900 rounded-[2rem] flex items-center justify-center mx-auto mb-10 text-5xl">📚</div>
                    <h3 className="text-4xl font-black mb-4">No materials available</h3>
                    <p className="text-slate-500 mb-12 text-xl max-w-md mx-auto leading-relaxed">Check back later for study resources uploaded by your instructors.</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 mt-12">
                    {topicsWithMaterials.map((topic) => (
                        <Card
                            key={topic._id}
                            className="group hover:-translate-y-3 transition-all duration-500 border-white/5 bg-slate-950/40 hover:bg-slate-900/60 rounded-[2.5rem] flex flex-col h-full shadow-2xl overflow-hidden relative"
                            style={{ padding: '2.5rem' }}
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/20 transition-all duration-700" />
                            <div className="flex flex-col gap-8 flex-1">
                                <div className="flex justify-between items-start relative z-10">
                                    <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center text-3xl text-rose-500 border border-rose-500/20 group-hover:rotate-12 transition-all">
                                        <FaBookOpen />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-8 relative z-10">
                                    <h3 className="text-xl font-black group-hover:text-rose-400 transition-colors uppercase tracking-tight">{topic.name}</h3>
                                    <p className="text-slate-500 text-lg line-clamp-2 leading-relaxed">{topic.description}</p>
                                </div>
                            </div>

                            <div className="h-10" />

                            <div className="pt-10 border-t border-white/5 mt-auto">
                                <Button
                                    onClick={() => handleViewMaterials(topic._id, topic.name)}
                                    className="w-full py-5 rounded-2xl bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white font-black uppercase tracking-widest text-xs transition-all border border-rose-500/20 relative z-10"
                                >
                                    View Materials
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* MATERIALS MODAL */}
            {showMaterialsModal && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl animate-fade-in" onClick={() => setShowMaterialsModal(false)} style={{ padding: 30 }}>
                    <Card className="max-w-4xl w-full p-0 bg-slate-950 border-white/10 shadow-3xl rounded-[3rem] overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-10 border-b border-white/5 bg-slate-900/40 flex justify-between items-center" style={{ marginBottom: 20, padding: 30 }}>
                            <div>
                                <h3 className="text-3xl font-black text-white">{viewingTopicName}</h3>
                                <p className="text-rose-400 font-bold text-sm mt-1 uppercase tracking-widest leading-relaxed">Study Resources</p>
                            </div>
                            <button onClick={() => setShowMaterialsModal(false)} className="p-4 bg-white/5 hover:bg-red-500/20 hover:text-red-500 rounded-2xl transition-all text-slate-400">
                                <FaTimes size={24} />
                            </button>
                        </div>
                        <div className="p-10 max-h-[60vh] overflow-y-auto custom-scrollbar flex flex-col gap-6" style={{ padding: 30 }}>
                            {selectedTopicMaterials.map((m) => (
                                <div key={m._id} className="rounded-[2rem] bg-white/5 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 p-8 hover:bg-white/10 transition-all group" style={{ padding: 30 }}>
                                    <div className="flex items-center gap-8 min-w-0">
                                        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 text-3xl border border-rose-500/20 shrink-0">
                                            {m.fileType?.startsWith('video/') ? <FaVideo /> : <FaFileAlt />}
                                        </div>
                                        <div className="flex flex-col gap-2 min-w-0">
                                            <h4 className="text-xl font-black text-white group-hover:text-rose-400 transition-colors uppercase tracking-tight break-all md:break-words">{m.name}</h4>
                                            {m.description && <p className="text-slate-400 text-sm italic leading-relaxed">"{m.description}"</p>}
                                        </div>
                                    </div>
                                    <a href={getFileUrl(m.fileUrl)} target="_blank" rel="noopener noreferrer" className="w-full md:w-auto">
                                        <Button className="w-full md:px-10 py-5 rounded-2xl bg-rose-500 text-white font-black border-none uppercase tracking-widest text-xs flex items-center gap-3">
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
