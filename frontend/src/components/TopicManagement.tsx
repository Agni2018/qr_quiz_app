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
    FaFolderPlus, FaClock, FaMinusCircle, FaStar, FaChevronDown, FaBolt
} from 'react-icons/fa';
import { useRouter, useSearchParams } from 'next/navigation';
import AlertModal from '@/components/AlertModal';
import ConfirmModal from '@/components/ConfirmModal';
import Pagination from './Pagination';
import { useSearch } from '@/contexts/SearchContext';

export default function TopicManagement() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const categoryIdFromUrl = searchParams.get('category');
    const { searchTerm } = useSearch();

    const [view, setView] = useState<'categories' | 'topics'>('categories');
    const [currentCategory, setCurrentCategory] = useState<any>(null);
    const [categories, setCategories] = useState<any[]>([]);
    const [topics, setTopics] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9; // Grid friendly

    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const handleResize = () => setWindowWidth(window.innerWidth);
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }
    }, []);

    const isMobile = windowWidth < 768;
    
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

    const [alertModal, setAlertModal] = useState({ isOpen: false, message: '', type: 'info' as 'success' | 'error' | 'info' });
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, message: '', title: 'Confirm Action', isDanger: false, onConfirm: () => {} });

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
        setCurrentPage(1); 

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
            setAlertModal({ isOpen: true, message: 'Topic created successfully', type: 'success' });
            fetchData();
        } catch (err) {
            console.error('Create topic error:', err);
            setAlertModal({ isOpen: true, message: 'Failed to create topic', type: 'error' });
        }
    };

    const deleteTopic = (id: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Topic',
            isDanger: true,
            message: 'Are you sure you want to delete this topic?',
            onConfirm: async () => {
                try {
                    await api.delete(`/topics/${id}`);
                    setAlertModal({ isOpen: true, message: 'Topic deleted successfully', type: 'success' });
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
            title: 'Duplicate Topic',
            isDanger: false,
            message: 'Are you sure you want to duplicate this topic and all its questions?',
            onConfirm: async () => {
                try {
                    await api.post(`/topics/${id}/copy`);
                    setAlertModal({ isOpen: true, message: 'Topic duplicated successfully', type: 'success' });
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
            setAlertModal({ isOpen: true, message: 'Category created successfully', type: 'success' });
            fetchData();
        } catch (err) {
            console.error('Create category error:', err);
            setAlertModal({ isOpen: true, message: 'Failed to create category', type: 'error' });
        }
    };

    const deleteCategory = (id: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Category',
            isDanger: true,
            message: 'Are you sure you want to delete this category? (Topics within will remain but lose their category link)',
            onConfirm: async () => {
                try {
                    await api.delete(`/categories/${id}`);
                    setAlertModal({ isOpen: true, message: 'Category deleted successfully', type: 'success' });
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
            title: 'Duplicate Category',
            isDanger: false,
            message: 'Are you sure you want to duplicate this category and all its topics?',
            onConfirm: async () => {
                try {
                    await api.post(`/categories/${id}/copy`);
                    setAlertModal({ isOpen: true, message: 'Category duplicated successfully', type: 'success' });
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

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, view]);

    if (loading && categories.length === 0 && topics.length === 0) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    const filteredCategories = categories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const displayedTopics = topics.filter(topic => {
        if (view === 'categories') {
            if (!topic.categoryId) return true;
            const catId = typeof topic.categoryId === 'object' ? topic.categoryId._id : topic.categoryId;
            return !categories.find(c => c._id === catId);
        }
        return true; 
    }).filter(topic => 
        topic.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (topic.description && topic.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const totalItems = view === 'categories' 
        ? filteredCategories.length + displayedTopics.length 
        : displayedTopics.length;
    
    const combinedItems = view === 'categories' 
        ? [...filteredCategories, ...displayedTopics] 
        : displayedTopics;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = combinedItems.slice(startIndex, startIndex + itemsPerPage);


    return (
        <div className="flex flex-col gap-10">

            {/* HEADER */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="flex flex-col">
                    <h1 className="text-3xl md:text-5xl font-black text-[#f97316] tracking-tighter uppercase shrink-0" style={{color:'darkorange'}}>
                        Manage Topics
                    </h1>
                </div>
            </div>

            {/* CREATE BUTTONS ROW - mobile only */}
            <div className="flex flex-col sm:flex-row gap-3 md:hidden">
                {view === 'categories' && (
                    <Button
                        onClick={() => setShowCategoryModal(true)}
                        className="flex items-center justify-center gap-2 h-12 px-6 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-widest text-xs shadow-lg transition-all w-full sm:w-auto"
                        style={{ background: '#f97316', color: 'white' }}
                    >
                        <FaPlus size={12} /> Create Category
                    </Button>
                )}
                <Button
                    onClick={() => setShowTopicModal(true)}
                    className="flex items-center justify-center gap-2 h-12 px-6 rounded-2xl bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest text-xs shadow-lg transition-all w-full sm:w-auto"
                >
                    <FaPlus size={12} /> Create Topic
                </Button>
            </div>
            
            {view === 'topics' && currentCategory && (
                <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="flex items-center gap-4 relative z-10">
                        <Button 
                            variant="primary" 
                            onClick={goBackToCategories}
                            className="px-6 h-12 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black flex items-center gap-2 shadow-xl shadow-orange-500/10 border-none transition-all active:scale-95"
                            style={{ background: '#f97316', color: 'white' }}
                        >
                            <FaChevronLeft /> Back
                        </Button>
                        <div className="h-6 w-[1px] bg-slate-100 mx-2" />
                        <h3 className="text-2xl font-black flex items-center gap-3 text-slate-900 tracking-tight relative"  style={{color:'orange'}}>
                            <span className="text-orange-500" style={{color:'orange'}}><FaFolder /></span>
                            {currentCategory.name}
                        </h3>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* CATEGORIES & UN-CATEGORIZED TOPICS SECTION */}
                {currentItems.map(item => {
                    const isCategory = categories.some(c => c._id === item._id);
                    
                    if (isCategory) {
                        return (
                            <div
                                key={item._id}
                                className="bg-white rounded-[2rem] flex flex-col gap-6 border border-slate-100 hover:border-slate-200 transition-all group relative overflow-hidden shadow-sm hover:shadow-xl"
                                style={{ padding: '30px', marginTop: '10px', marginBottom: '10px' }}
                            >
                                {/* Card Header */}
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md bg-orange-500/10 text-orange-500">
                                        Category
                                    </span>
                                </div>

                                {/* Title & Description */}
                                <div className="flex flex-col gap-2">
                                    <h3 className="font-bold text-2xl text-[#0f172a] tracking-tight line-clamp-1 group-hover:text-orange-500 transition-colors uppercase" style={{color:'black'}}>
                                        {item.name}
                                    </h3>
                                    <p className="text-sm font-bold text-slate-600 leading-relaxed line-clamp-2 min-h-[40px]" style={{color:'black'}}>
                                        Organized group of quiz topics for better management and navigation.
                                    </p>
                                </div>

                                {/* Footer Actions */}
                                <div className="mt-auto pt-6 border-t border-slate-50" style={{ marginTop: '30px' }}>
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center gap-3">
                                            <Button 
                                                variant="primary" 
                                                onClick={() => manageCategory(item)}
                                                className="h-10 px-6 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-tight text-[10px] transition-all"
                                                style={{ background: '#f97316' }}
                                            >
                                                Manage
                                            </Button>
                                            <Button 
                                                onClick={() => copyCategory(item._id)}
                                                className="h-10 px-6 rounded-xl bg-slate-900 hover:bg-black text-white font-black uppercase tracking-tight text-[10px] transition-all"
                                            >
                                                Copy
                                            </Button>
                                        </div>
                                        <button 
                                            onClick={() => deleteCategory(item._id)}
                                            className="p-2.5 text-slate-400 hover:text-red-500 rounded-xl transition-all"
                                        >
                                            <FaTrash size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    } else {
                        // RENDER TOPIC
                        const topic = item;
                        const statusActive = topic.status === 'active';
                        return (
                            <div
                                key={topic._id}
                                className="bg-white rounded-[2rem] flex flex-col gap-6 border border-slate-100 hover:border-slate-200 transition-all group relative overflow-hidden shadow-sm hover:shadow-xl"
                                style={{ padding: '30px', marginTop: '10px', marginBottom: '10px' }}
                            >
                                {/* Card Header */}
                                <div className="flex justify-between items-center">
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md ${statusActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                        {statusActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>

                                {/* Title & Description */}
                                <div className="flex flex-col gap-2">
                                    <h3 className="font-bold text-2xl text-[#0f172a] tracking-tight line-clamp-1 group-hover:text-orange-500 transition-colors uppercase" style={{color:'black'}}>
                                        {topic.name}
                                    </h3>
                                    <p className="text-sm font-bold text-slate-600 leading-relaxed line-clamp-2 min-h-[40px]" style={{color:'black'}}>
                                        {topic.description || "Master questions about this topic and test your knowledge."}
                                    </p>
                                </div>

                                {/* Stats Column */}
                                <div className="flex flex-wrap gap-4">
                                    <div className="flex items-center gap-2 text-[11px] font-black text-slate-900 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                        <FaClock className="text-orange-500" /> {topic.timeLimit}S
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px] font-black text-slate-900 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                        <FaStar className="text-orange-400" /> {topic.passingMarks} PTS
                                    </div>
                                    {topic.negativeMarking > 0 && (
                                        <div className="flex items-center gap-2 text-[11px] font-black text-red-500 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
                                            <FaMinusCircle /> -{topic.negativeMarking}
                                        </div>
                                    )}
                                    {topic.timeBasedScoring && (
                                        <div className="flex items-center gap-2 text-[11px] font-black text-orange-500 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100">
                                            <FaBolt /> TS ENABLED
                                        </div>
                                    )}
                                </div>

                                {/* Footer Actions */}
                                <div className="mt-auto pt-6 border-t border-slate-50" style={{ marginTop: '30px' }}>
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center gap-3">
                                            <Link href={`/users/topic/${topic._id}`}>
                                                <Button 
                                                    variant="primary" 
                                                    className="h-10 px-6 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-tight text-[10px] transition-all"
                                                    style={{ background: '#f97316' }}
                                                >
                                                    View
                                                </Button>
                                            </Link>
                                            <Button 
                                                onClick={() => copyTopic(topic._id)}
                                                className="h-10 px-6 rounded-xl bg-slate-900 hover:bg-black text-white font-black uppercase tracking-tight text-[10px] transition-all"
                                            >
                                                Copy
                                            </Button>
                                        </div>
                                        <button 
                                            onClick={() => deleteTopic(topic._id)}
                                            className="p-2.5 text-slate-400 hover:text-red-500 rounded-xl transition-all"
                                        >
                                            <FaTrash size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    }
                })}

                {combinedItems.length === 0 && (
                    <div className="col-span-full py-20 text-center flex flex-col items-center gap-4 text-slate-400 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                        <FaSearch size={48} className="opacity-20" />
                        <p className="font-bold">No results matching your filter.</p>
                    </div>
                )}
            </div>
  
            {/* Pagination controls */}
            <div className="mt-8 flex justify-center">
                <Pagination 
                    currentPage={currentPage}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    isMobile={isMobile}
                />
            </div>

            {/* CREATE TOPIC MODAL */}
            {showTopicModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <Card className="w-full max-w-[500px] bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col gap-6" style={{ padding: '30px',margin:'1rem 1rem 1rem 1rem' }}>
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">New Topic</h2>
                            <button onClick={() => setShowTopicModal(false)} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all"><FaTimes size={18} /></button>
                        </div>
                        <div className="flex flex-col gap-5">
                            <label className="flex flex-col gap-2">
                                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.2em] pl-1">Topic Name <span className="text-red-500">*</span></span>
                                <Input
                                    value={newTopic.name}
                                    onChange={e => setNewTopic({ ...newTopic, name: e.target.value })}
                                    placeholder="e.g. Modern Web Architecture"
                                />
                            </label>
                            
                            {!currentCategory && (
                                <label className="flex flex-col gap-2">
                                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.2em] pl-1">Category</span>
                                    <div className="relative">
                                        <select 
                                            className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500 transition-all font-bold appearance-none cursor-pointer"
                                            value={newTopic.categoryId}
                                            onChange={e => setNewTopic({ ...newTopic, categoryId: e.target.value })}
                                        >
                                            <option value="" className="bg-[#0f172a] text-white">None</option>
                                            {categories.map(c => (
                                                <option key={c._id} value={c._id} className="bg-[#0f172a] text-white">{c.name}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <FaChevronDown size={14} />
                                        </div>
                                    </div>
                                </label>
                            )}

                            <label className="flex flex-col gap-2">
                                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.2em] pl-1">Description</span>
                                <TextArea
                                    value={newTopic.description}
                                    onChange={e => setNewTopic({ ...newTopic, description: e.target.value })}
                                    placeholder="Describe the quiz scope..."
                                />
                            </label>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <label className="flex flex-col gap-2">
                                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.2em] pl-1">Time (s)</span>
                                    <Input
                                        type="number"
                                        value={newTopic.timeLimit}
                                        onChange={e => setNewTopic({ ...newTopic, timeLimit: parseInt(e.target.value) || 0 })}
                                    />
                                </label>
                                <label className="flex flex-col gap-2">
                                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.2em] pl-1">Passing Pts</span>
                                    <Input
                                        type="number"
                                        value={newTopic.passingMarks}
                                        onChange={e => setNewTopic({ ...newTopic, passingMarks: parseFloat(e.target.value) || 0 })}
                                    />
                                </label>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <label className="flex flex-col gap-2">
                                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.2em] pl-1">Negative Marking</span>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        value={newTopic.negativeMarking}
                                        onChange={e => setNewTopic({ ...newTopic, negativeMarking: parseFloat(e.target.value) || 0 })}
                                        placeholder="e.g. 0.25"
                                    />
                                </label>
                                <div className="flex flex-col gap-2">
                                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.2em] pl-1">Scoring Mode</span>
                                    <label className="flex items-center gap-4 bg-[#0f172a] border border-white/10 rounded-xl px-6 py-4 cursor-pointer hover:border-orange-500 transition-all shadow-sm" style={{padding:5}}>
                                        <input 
                                            type="checkbox" 
                                            className="w-5 h-5 accent-orange-500 rounded border-slate-300 cursor-pointer"
                                            checked={newTopic.timeBasedScoring}
                                            onChange={e => setNewTopic({ ...newTopic, timeBasedScoring: e.target.checked })}
                                        />
                                        <div className="flex flex-col" >
                                            <span className="text-[11px] font-black text-white uppercase tracking-tight">Enable Time Bonus</span>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Award extra points for speed</span>
                                        </div>
                                    </label>
                                </div>
                            </div>
                            
                            <div className="flex gap-4 mt-4">
                                <Button variant="ghost" className="flex-1 h-12 text-slate-400 uppercase font-black tracking-widest text-[11px]" onClick={() => setShowTopicModal(false)}>Cancel</Button>
                                <Button className="flex-1 h-12 bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20 uppercase font-black tracking-widest text-[11px]" onClick={createTopic} disabled={!newTopic.name.trim()}>Create Topic</Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* CREATE CATEGORY MODAL */}
            {showCategoryModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <Card className="w-full max-w-[420px] bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col gap-6" style={{ padding: '30px',margin:'1rem 1rem 1rem 1rem' }}>
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">New Category</h2>
                            <button onClick={() => setShowCategoryModal(false)} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all"><FaTimes size={18} /></button>
                        </div>
                        <div className="flex flex-col gap-6">
                            <label className="flex flex-col gap-3">
                                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.2em] pl-1">Category Name <span className="text-red-500">*</span></span>
                                <Input
                                    value={newCategory.name}
                                    onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
                                    placeholder="e.g. Computer Science"
                                />
                            </label>
                            <div className="flex gap-4 mt-2">
                                <Button variant="ghost" className="flex-1 h-12 text-slate-400 uppercase font-black tracking-widest text-[11px]" onClick={() => setShowCategoryModal(false)}>Cancel</Button>
                                <Button className="flex-1 h-12 bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20 uppercase font-black tracking-widest text-[11px]" onClick={createCategory} disabled={!newCategory.name.trim()}>Create Category</Button>
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
                title={confirmModal.title}
                isDanger={confirmModal.isDanger}
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
