'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import TextArea from '@/components/TextArea';
import { 
    FaPlus, FaTrash, FaCopy, FaArrowRight, FaFolder, 
    FaChevronLeft, FaSearch, FaTimes, FaQuestionCircle,
    FaFolderPlus, FaClock, FaMinusCircle, FaStar
} from 'react-icons/fa';
import { useRouter, useSearchParams } from 'next/navigation';
import AlertModal from '@/components/AlertModal';
import ConfirmModal from '@/components/ConfirmModal';

export default function TopicManagement() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const categoryIdFromUrl = searchParams.get('category');

    const [view, setView] = useState<'categories' | 'topics'>('categories');
    const [currentCategory, setCurrentCategory] = useState<any>(null);
    const [categories, setCategories] = useState<any[]>([]);
    const [topics, setTopics] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [showTopicModal, setShowTopicModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    
    const [newTopic, setNewTopic] = useState({
        name: '',
        description: '',
        timeLimit: 0,
        negativeMarking: 0,
        timeBasedScoring: false,
        passingMarks: 0,
        categoryId: ''
    });

    const [newCategory, setNewCategory] = useState({
        name: ''
    });

    const [searchQuery, setSearchQuery] = useState('');

    const [alertModal, setAlertModal] = useState({ isOpen: false, message: '', type: 'info' as 'success' | 'error' | 'info' });
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, message: '', onConfirm: () => {} });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [tagsRes, topicsRes] = await Promise.all([
                api.get('/categories'),
                api.get(categoryIdFromUrl ? `/topics?category=${categoryIdFromUrl}` : '/topics')
            ]);
            setCategories(tagsRes.data);
            setTopics(topicsRes.data);
            
            if (categoryIdFromUrl) {
                const cat = tagsRes.data.find((c: any) => c._id === categoryIdFromUrl);
                if (cat) {
                    setCurrentCategory(cat);
                    setView('topics');
                } else {
                    // Invalid category ID in URL, clear it
                    router.push('/users/manage-topics');
                }
            } else {
                setView('categories');
                setCurrentCategory(null);
            }
        } catch (err) {
            console.error('Fetch data error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        const handleOpenTopicModal = () => setShowTopicModal(true);
        const handleOpenCategoryModal = () => setShowCategoryModal(true);
        
        window.addEventListener('open-create-topic-modal', handleOpenTopicModal);
        window.addEventListener('open-create-category-modal', handleOpenCategoryModal);
        
        return () => {
            window.removeEventListener('open-create-topic-modal', handleOpenTopicModal);
            window.removeEventListener('open-create-category-modal', handleOpenCategoryModal);
        };
    }, [categoryIdFromUrl]);

    const createTopic = async () => {
        if (!newTopic.name.trim()) return;
        try {
            const payload = { ...newTopic };
            if (currentCategory) {
                payload.categoryId = currentCategory._id;
            }
            await api.post('/topics', payload);
            setShowTopicModal(false);
            setNewTopic({
                name: '',
                description: '',
                timeLimit: 0,
                negativeMarking: 0,
                timeBasedScoring: false,
                passingMarks: 0,
                categoryId: ''
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

    const createCategory = async () => {
        if (!newCategory.name.trim()) return;
        try {
            await api.post('/categories', newCategory);
            setShowCategoryModal(false);
            setNewCategory({ name: '' });
            fetchData();
        } catch (err) {
            console.error('Create category error:', err);
            setAlertModal({ isOpen: true, message: 'Failed to create category', type: 'error' });
        }
    };

    const deleteCategory = (id: string) => {
        setConfirmModal({
            isOpen: true,
            message: 'Are you sure you want to delete this category? (Topics within will remain but lose their category link)',
            onConfirm: async () => {
                try {
                    await api.delete(`/categories/${id}`);
                    fetchData();
                } catch (err) {
                    console.error('Delete category error:', err);
                    setAlertModal({ isOpen: true, message: 'Failed to delete category', type: 'error' });
                }
            }
        });
    };

    const copyCategory = (id: string) => {
        setConfirmModal({
            isOpen: true,
            message: 'Are you sure you want to duplicate this category and all its topics?',
            onConfirm: async () => {
                try {
                    await api.post(`/categories/${id}/copy`);
                    fetchData();
                } catch (err: any) {
                    setAlertModal({ isOpen: true, message: err.response?.data?.message || 'Failed to copy category', type: 'error' });
                }
            }
        });
    };

    const manageCategory = (category: any) => {
        router.push(`/users/manage-topics?category=${category._id}`);
    };

    const goBackToCategories = () => {
        router.push('/users/manage-topics');
    };

    if (loading && categories.length === 0 && topics.length === 0) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }
    return (
        <div className="flex flex-col gap-10 md:gap-16">

            {/* SEARCH BAR & HEADER */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-4 px-4">
                <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight uppercase shrink-0">
                    Manage Topics
                </h2>
                
                <div className="relative w-full max-w-xs md:max-w-md group flex-1 md:ml-10" style={{ margin: '1rem 2.5rem 1rem 1.5rem' }}>
                    <input
                        type="text"
                        placeholder="Filter topics..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#0a101f]/80 border border-white/5 rounded-lg py-3 pr-16 text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/30 transition-all font-medium"
                        style={{ background: 'rgba(10, 16, 31, 0.8)', boxSizing: 'border-box', paddingLeft: '1.5rem',marginRight: '1rem'}}
                    />
                    <FaSearch className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" />
                </div>
            </div>
            
            {view === 'topics' && currentCategory && (
                <div className="flex flex-wrap items-center justify-between gap-4 mb-2 bg-white/5 p-4 rounded-3xl border border-white/5" style={{marginLeft:10,marginRight:10}}>
                    <div className="flex items-center gap-4">
                        <Button 
                            variant="ghost" 
                            onClick={goBackToCategories}
                            className="px-4 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 font-bold flex items-center gap-2"
                        >
                            <FaChevronLeft /> Back
                        </Button>
                        <div className="h-6 w-[1px] bg-white/10 mx-2" />
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <span className="text-primary"><FaFolder /></span>
                            {currentCategory.name}
                        </h3>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* CATEGORIES SECTION (Only in categories view) */}
                {view === 'categories' && categories
                    .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map(category => (
                        <div
                            key={category._id}
                            className="bg-[#1a1f2e] rounded-2xl flex flex-col gap-5 border border-white/5 hover:border-white/10 transition-all group relative overflow-hidden shadow-xl"
                            style={{ margin: '0 0.5rem 1.5rem 0.5rem', padding: '1.5rem' }}
                        >
                            {/* Card Header */}
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md bg-primary/10 text-primary">
                                    Category
                                </span>
                            </div>

                            {/* Title & Description */}
                            <div className="flex flex-col gap-2">
                                <h3 className="font-bold text-xl text-white tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
                                    {category.name}
                                </h3>
                                <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 min-h-[40px]">
                                    Organized group of quiz topics for better management and navigation.
                                </p>
                            </div>

                            {/* Footer Actions */}
                            <div className="flex items-center justify-between mt-auto pt-8 border-t border-white/5">
                                <div className="flex gap-3" style={{ marginTop: '1.5rem' }}>
                                    <button 
                                        onClick={() => manageCategory(category)}
                                        className="rounded-lg font-black uppercase text-[11px] tracking-widest transition-all hover:opacity-90 active:scale-95 shadow-lg"
                                        style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '0.85rem 2rem' }}
                                    >
                                        Manage
                                    </button>
                                    <button 
                                        onClick={() => copyCategory(category._id)}
                                        className="rounded-lg font-black uppercase text-[11px] tracking-widest transition-all hover:bg-slate-900 active:scale-95 shadow-lg"
                                        style={{ backgroundColor: 'black', color: 'white', padding: '0.85rem 2rem' }}
                                    >
                                        Copy
                                    </button>
                                </div>
                                <button 
                                    onClick={() => deleteCategory(category._id)}
                                    className="p-2 text-slate-500 hover:text-red-500 transition-colors"
                                    title="Delete Category"
                                >
                                    <FaTrash size={14} />
                                </button>
                            </div>
                        </div>
                    ))}

                {/* TOPICS SECTION */}
                {topics.filter(topic => {
                    if (view === 'categories') {
                        // In main view, show topics with NO category OR stale category
                        if (!topic.categoryId) return true;
                        const catId = typeof topic.categoryId === 'object' ? topic.categoryId._id : topic.categoryId;
                        return !categories.find(c => c._id === catId);
                    }
                    // In topics view, topics are already filtered by backend query parameter
                    return true; 
                })
                .filter(topic => topic.name.toLowerCase().includes(searchQuery.toLowerCase()) || (topic.description && topic.description.toLowerCase().includes(searchQuery.toLowerCase())))
                .map(topic => {
                    const isActive = topic.status === 'active';
                    return (
                        <div
                            key={topic._id}
                            className="bg-[#1a1f2e] rounded-2xl flex flex-col gap-5 border border-white/5 hover:border-white/10 transition-all group relative overflow-hidden shadow-xl"
                            style={{ margin: '0 0.5rem 1.5rem 0.5rem', padding: '1.5rem' }}
                        >
                            {/* Card Header */}
                            <div className="flex justify-between items-center">
                                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md ${isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                    {isActive ? 'Active' : 'Inactive'}
                                </span>
                                {topic.categoryId && (
                                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md bg-white/5 text-slate-400">
                                        Category: {typeof topic.categoryId === 'object' ? topic.categoryId.name : 'Uncategorized'}
                                    </span>
                                )}
                            </div>

                            {/* Title & Description */}
                            <div className="flex flex-col gap-2">
                                <h3 className="font-bold text-xl text-white tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
                                    {topic.name}
                                </h3>
                                <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 min-h-[40px]">
                                    {topic.description || "Master questions about this topic and test your knowledge in this comprehensive quiz."}
                                </p>
                            </div>

                            {/* Stats */}
                            <div className="flex flex-wrap gap-3">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0d1117] rounded-lg border border-white/5 text-[11px] font-bold text-slate-300" style={{padding:5,fontSize:12}}>
                                    <FaClock className="text-primary/70" /> {topic.timeLimit}S
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0d1117] rounded-lg border border-white/5 text-[11px] font-bold text-slate-300" style={{padding:5,fontSize:12}}>
                                    <FaMinusCircle className="text-red-400/70" /> -{topic.negativeMarking}
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0d1117] rounded-lg border border-white/5 text-[11px] font-bold text-slate-300" style={{padding:5,fontSize:12}}>
                                    <FaStar className="text-yellow-400/70" /> {topic.passingMarks} MARKS
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="flex items-center justify-between mt-8 pt-8 border-t border-white/5">
                                <div className="flex gap-3" style={{ marginTop: '1.5rem' }}>
                                    <Link href={`/users/topic/${topic._id}`}>
                                        <button 
                                            className="rounded-lg font-black uppercase text-[11px] tracking-widest transition-all hover:opacity-90 active:scale-95 shadow-lg"
                                            style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '0.85rem 2rem' }}
                                        >
                                            Manage
                                        </button>
                                    </Link>
                                    <button 
                                        onClick={() => copyTopic(topic._id)}
                                        className="rounded-lg font-black uppercase text-[11px] tracking-widest transition-all hover:bg-slate-900 active:scale-95 shadow-lg"
                                        style={{ backgroundColor: 'black', color: 'white', padding: '0.85rem 2rem' }}
                                    >
                                        Copy
                                    </button>
                                </div>
                                <button 
                                    onClick={() => deleteTopic(topic._id)}
                                    className="p-2 text-slate-500 hover:text-red-500 transition-colors"
                                    title="Delete Topic"
                                >
                                    <FaTrash size={14} />
                                </button>
                            </div>
                        </div>
                    );
                })}

                {view === 'categories' && categories.length === 0 && topics.filter(t => {
                    if (!t.categoryId) return true;
                    const catId = typeof t.categoryId === 'object' ? t.categoryId._id : t.categoryId;
                    return !categories.find(c => c._id === catId);
                }).length === 0 && (
                    <div className="col-span-full py-20 text-center flex flex-col items-center gap-4 text-slate-500">
                        <FaFolder size={48} className="opacity-20" />
                        <p className="font-bold">No quizzes or categories yet.</p>
                    </div>
                )}

                {view === 'topics' && topics.length === 0 && (
                    <div className="col-span-full py-20 text-center flex flex-col items-center gap-4 text-slate-500">
                        <p className="font-bold">No topics in this category yet.</p>
                        <Button variant="ghost" className="text-primary hover:bg-primary/10" onClick={() => setShowTopicModal(true)}>
                            Create your first topic
                        </Button>
                    </div>
                )}
            </div>
 

            {/* CREATE TOPIC MODAL */}
            {showTopicModal && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', padding: '1rem' }}>
                    <Card style={{ width: '100%', maxWidth: '500px', background: 'var(--card-bg)', padding: '2rem', borderRadius: '1.5rem' }}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold">New Topic {currentCategory ? `in ${currentCategory.name}` : ''}</h3>
                            <button onClick={() => setShowTopicModal(false)}><FaPlus className="rotate-45" /></button>
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
                            
                            {!currentCategory && (
                                <label className="flex flex-col gap-2">
                                    <span className="text-xs font-black uppercase text-slate-500 tracking-widest pl-1">Category</span>
                                    <select 
                                        className="bg-[#0f172a] border border-white/20 rounded-xl px-4 py-3 text-white outline-none focus:border-primary transition-all font-bold appearance-none cursor-pointer"
                                        value={newTopic.categoryId}
                                        onChange={e => setNewTopic({ ...newTopic, categoryId: e.target.value })}
                                        style={{ background: '#0f172a', color: 'white' }}
                                    >
                                        <option value="" style={{ background: '#0f172a', color: 'white' }}>None</option>
                                        {categories.map(c => (
                                            <option key={c._id} value={c._id} style={{ background: '#0f172a', color: 'white' }}>{c.name}</option>
                                        ))}
                                    </select>
                                </label>
                            )}

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
                                <Button variant="ghost" className="flex-1" onClick={() => setShowTopicModal(false)}>Cancel</Button>
                                <Button className="flex-1" onClick={createTopic} disabled={!newTopic.name.trim()}>Create Topic</Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* CREATE CATEGORY MODAL */}
            {showCategoryModal && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', padding: '1rem' }}>
                    <Card 
                        className="w-full max-w-[420px] p-10 md:p-14 rounded-[1.5rem] flex flex-col gap-8 shadow-2xl" 
                        style={{ background: 'var(--card-bg)' ,padding:30}}
                    >
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-2xl font-bold tracking-tight">New Category</h3>
                            <button onClick={() => setShowCategoryModal(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-all text-slate-400">
                                <FaPlus className="rotate-45" />
                            </button>
                        </div>
                        <div className="flex flex-col gap-6">
                            <label className="flex flex-col gap-3">
                                <span className="text-[11px] font-black uppercase text-slate-500 tracking-[0.2em] pl-1">Category Name</span>
                                <Input
                                    className="h-14 !px-6 !rounded-2xl bg-white/5 border-2 border-white/5 focus:border-primary transition-all text-lg font-bold"
                                    value={newCategory.name}
                                    onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
                                    placeholder="Enter category name..."
                                />
                            </label>
                            <div className="flex gap-4 mt-4">
                                <Button variant="ghost" className="flex-1 rounded-2xl h-14 text-sm font-black uppercase tracking-widest text-slate-400" onClick={() => setShowCategoryModal(false)}>Cancel</Button>
                                <Button className="flex-1 rounded-2xl h-14 text-sm font-black uppercase tracking-widest shadow-lg shadow-primary/20" onClick={createCategory} disabled={!newCategory.name.trim()}>Create</Button>
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
