'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import TextArea from '@/components/TextArea';
import {
    FaPlus,
    FaArrowRight,
    FaTrash,
    FaCopy
} from 'react-icons/fa';
import AlertModal from '@/components/AlertModal';
import ConfirmModal from '@/components/ConfirmModal';

export default function TopicManagement() {
    const [topics, setTopics] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newTopic, setNewTopic] = useState({
        name: '',
        description: '',
        timeLimit: 0,
        negativeMarking: 0,
        timeBasedScoring: false,
        passingMarks: 0
    });

    const [alertModal, setAlertModal] = useState({ isOpen: false, message: '', type: 'info' as 'success' | 'error' | 'info' });
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, message: '', onConfirm: () => {} });

    const fetchData = async () => {
        try {
            const res = await api.get('/topics');
            setTopics(res.data);
        } catch (err) {
            console.error('Fetch topics error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        const handleOpenModal = () => setShowModal(true);
        window.addEventListener('open-create-topic-modal', handleOpenModal);
        return () => window.removeEventListener('open-create-topic-modal', handleOpenModal);
    }, []);

    const createTopic = async () => {
        if (!newTopic.name.trim()) return;
        try {
            await api.post('/topics', newTopic);
            setShowModal(false);
            setNewTopic({
                name: '',
                description: '',
                timeLimit: 0,
                negativeMarking: 0,
                timeBasedScoring: false,
                passingMarks: 0
            });
            fetchData();
        } catch (err) {
            console.error('Create topic error:', err);
            setAlertModal({ isOpen: true, message: 'Failed to create topic', type: 'error' });
        }
    };

    const deleteTopic = (id: string) => {
        setConfirmModal({
            isOpen: true,
            message: 'Are you sure you want to delete this topic?',
            onConfirm: async () => {
                try {
                    await api.delete(`/topics/${id}`);
                    fetchData();
                } catch (err) {
                    console.error('Delete topic error:', err);
                    setAlertModal({ isOpen: true, message: 'Failed to delete topic', type: 'error' });
                }
            }
        });
    };

    const copyTopic = (id: string) => {
        setConfirmModal({
            isOpen: true,
            message: 'Are you sure you want to duplicate this topic and all its questions?',
            onConfirm: async () => {
                try {
                    await api.post(`/topics/${id}/copy`);
                    fetchData();
                } catch (err: any) {
                    setAlertModal({ isOpen: true, message: err.response?.data?.message || 'Failed to copy topic', type: 'error' });
                }
            }
        });
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {topics.map(topic => {
                    const isActive = topic.status === 'active';

                    return (
                        <Card
                            key={topic._id}
                            className="rounded-[2.5rem] border-none shadow-lg hover:shadow-primary/10 transition-all group flex flex-col gap-6"
                            style={{ background: 'var(--card-bg)', padding: '2.5rem', margin: '0 1rem 1rem 1rem' }}
                        >
                            <div className="flex justify-between items-start pt-1">
                                <h3 className="font-bold text-2xl tracking-tight leading-tight">{topic.name}</h3>
                                <span
                                    className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shrink-0"
                                    style={{
                                        background: isActive ? 'rgba(var(--primary-rgb), 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                        color: isActive ? 'var(--primary)' : '#ef4444'
                                    }}
                                >
                                    {isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">
                                {topic.description || "No description provided for this quiz topic."}
                            </p>

                            <div className="flex gap-4 items-center mb-4">
                                {topic.timeLimit > 0 && (
                                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 bg-white/5 px-2.5 py-1.5 rounded-lg">
                                        ⏱️ {topic.timeLimit}s
                                    </div>
                                )}
                                {topic.negativeMarking > 0 && (
                                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 bg-white/5 px-2.5 py-1.5 rounded-lg">
                                        ❌ -{topic.negativeMarking}
                                    </div>
                                )}
                                {topic.passingMarks > 0 && (
                                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-green-500/80 bg-green-500/5 px-2.5 py-1.5 rounded-lg border border-green-500/10">
                                        ✅ {topic.passingMarks} Marks
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-4 mt-auto pt-6 w-full">
                                <Link href={`/users/topic/${topic._id}`} className="w-full">
                                    <Button className="w-full justify-between h-12 px-6 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black transition-all shadow-lg shadow-primary/20">
                                        Manage <FaArrowRight />
                                    </Button>
                                </Link>

                                <div className="flex items-center justify-between w-full">
                                    <Button
                                        variant="ghost"
                                        className="min-w-[48px] h-10 px-4 rounded-xl bg-white/5 hover:bg-white/10 border-none flex items-center justify-center gap-2 group/btn"
                                        onClick={(e) => { e.preventDefault(); copyTopic(topic._id); }}
                                        title="Duplicate Topic"
                                    >
                                        <FaCopy className="text-slate-400 group-hover/btn:text-white transition-colors" />
                                        <span className="text-xs font-bold text-slate-400 group-hover/btn:text-white transition-colors">Copy</span>
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        className="min-w-[48px] h-10 px-4 rounded-xl bg-white/5 hover:bg-white/10 border-none flex items-center justify-center gap-2 group/btn"
                                        onClick={(e) => { e.preventDefault(); deleteTopic(topic._id); }}
                                        title="Delete Topic"
                                    >
                                        <FaTrash className="text-red-500/70 group-hover/btn:text-red-400 transition-colors" />
                                        <span className="text-xs font-bold text-red-500/70 group-hover/btn:text-red-400 transition-colors">Del</span>
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* CREATE MODAL */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', padding: '1rem' }}>
                    <Card style={{ width: '100%', maxWidth: '500px', background: 'var(--card-bg)', padding: '2rem', borderRadius: '1.5rem' }}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold">New Topic</h3>
                            <button onClick={() => setShowModal(false)}><FaPlus className="rotate-45" /></button>
                        </div>
                        <div className="flex flex-col gap-4">
                            <label className="flex flex-col gap-2">
                                <span className="text-xs font-black uppercase text-slate-500 tracking-widest pl-1">Topic Name</span>
                                <Input
                                    value={newTopic.name}
                                    onChange={e => setNewTopic({ ...newTopic, name: e.target.value })}
                                    placeholder="Enter topic name..."
                                />
                            </label>
                            <label className="flex flex-col gap-2">
                                <span className="text-xs font-black uppercase text-slate-500 tracking-widest pl-1">Description</span>
                                <TextArea
                                    value={newTopic.description}
                                    onChange={e => setNewTopic({ ...newTopic, description: e.target.value })}
                                    placeholder="Brief description of the quiz subject"
                                />
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <label className="flex flex-col gap-2">
                                    <span className="text-xs font-black uppercase text-slate-500 tracking-widest pl-1">Time Limit (s)</span>
                                    <Input
                                        type="number"
                                        value={newTopic.timeLimit}
                                        onChange={e => setNewTopic({ ...newTopic, timeLimit: parseInt(e.target.value) || 0 })}
                                    />
                                </label>
                                <label className="flex flex-col gap-2">
                                    <span className="text-xs font-black uppercase text-slate-500 tracking-widest pl-1">Negative Marking</span>
                                    <Input
                                        type="number"
                                        value={newTopic.negativeMarking}
                                        onChange={e => setNewTopic({ ...newTopic, negativeMarking: parseFloat(e.target.value) || 0 })}
                                    />
                                </label>
                            </div>
                            <label className="flex flex-col gap-2">
                                <span className="text-xs font-black uppercase text-slate-500 tracking-widest pl-1">Passing Marks</span>
                                <Input
                                    type="number"
                                    value={newTopic.passingMarks}
                                    onChange={e => setNewTopic({ ...newTopic, passingMarks: parseFloat(e.target.value) || 0 })}
                                />
                            </label>
                            <label className="flex items-center gap-3 mt-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={newTopic.timeBasedScoring}
                                    onChange={e => setNewTopic({ ...newTopic, timeBasedScoring: e.target.checked })}
                                    className="w-5 h-5 rounded border-2 border-primary accent-primary"
                                />
                                <span className="text-sm font-bold text-slate-400 group-hover:text-white transition-colors">Enabled Time-based scoring?</span>
                            </label>
                            <div className="flex gap-4 mt-6">
                                <Button variant="ghost" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
                                <Button className="flex-1" onClick={createTopic} disabled={!newTopic.name.trim()}>Create Topic</Button>
                            </div>
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
