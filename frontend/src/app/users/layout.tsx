'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Button from '@/components/Button';
import ThemeToggle from '@/components/ThemeToggle';
import {
    FaSignOutAlt,
    FaBars,
    FaTimes,
    FaChartPie,
    FaGraduationCap,
    FaBook,
    FaAward,
    FaUpload,
    FaPlus,
    FaChevronDown,
    FaChevronUp,
    FaChevronLeft,
    FaChevronRight,
    FaStar,
    FaFolderPlus,
    FaUser
} from 'react-icons/fa';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

export default function UsersLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [user, setUser] = useState<any>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
 // Keep it here if it's used elsewhere, but we'll see

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const statusRes = await api.get('/auth/status');
                if (statusRes.data.user && statusRes.data.user.role !== 'admin') {
                    router.replace('/dashboard/student');
                    return;
                }
                setUser(statusRes.data.user);
            } catch {
                router.replace('/');
            } finally {
                setAuthLoading(false);
            }
        };
        checkAuth();
    }, [router]);

    const isActive = (path: string) => {
        if (path === '/users') {
            return pathname === '/users' || pathname === '/users/analytics';
        }
        return pathname.startsWith(path);
    };

    if (authLoading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
                <div style={{ width: '3rem', height: '3rem', border: '4px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%' }} className="animate-spin" />
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)', color: 'var(--text-primary)' }}>
            {/* MOBILE HEADER */}
            <header style={{
                position: 'sticky',
                top: 0,
                zIndex: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.5rem',
                borderBottom: '1px solid var(--border-color)',
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(var(--blur))'
            }} className="mobile-only lg:hidden">
                <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Dashboard</h1>
                <button onClick={() => setSidebarOpen(true)} style={{ color: 'var(--text-primary)' }}>
                    <FaBars />
                </button>
            </header>

            {sidebarOpen && (
                <div
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.6)', zIndex: 40 }}
                    className="lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* GRID */}
            <div className={`lg:grid ${isSidebarCollapsed ? 'lg:grid-cols-[80px_1fr]' : 'lg:grid-cols-[280px_1fr]'} lg:gap-10 transition-all duration-300`}>

                {/* SIDEBAR */}
                <aside
                    className={`
                        fixed lg:static top-0 left-0 z-50
                        h-screen ${isSidebarCollapsed ? 'lg:w-[80px]' : 'lg:w-[280px]'}
                        border-r
                        ${isSidebarCollapsed ? 'px-4' : 'px-8'} py-12
                        transform transition-all duration-300
                        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                        lg:translate-x-0
                        flex flex-col
                    `}
                    style={{
                        background: 'var(--glass-bg)',
                        backdropFilter: 'blur(var(--blur))',
                        borderColor: 'var(--border-color)'
                    }}
                >
                    <button
                        className="absolute top-6 right-6 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                        style={{ color: 'var(--text-primary)' }}
                    >
                        <FaTimes />
                    </button>

                    {/* Branding Section - Stylized Greeting */}
                    <div className={`mb-14 mt-10 px-6 flex flex-col items-center text-center relative group ${isSidebarCollapsed ? 'hidden lg:block lg:opacity-0 lg:h-0 overflow-hidden' : ''} transition-all duration-300`}>
                        <div className="w-24 h-24 rounded-full bg-slate-800/50 border-2 border-orange-500/30 flex items-center justify-center mb-6 overflow-hidden shadow-2xl group-hover:border-orange-500 transition-all duration-500 relative" style={{marginTop:10}}>
                            <div className="absolute inset-0 bg-orange-500/5 blur-xl group-hover:bg-orange-500/10 transition-all duration-500" />
                            <FaUser className="text-4xl text-slate-400 group-hover:text-orange-500 transition-colors relative z-10" />
                        </div>
                        <h2 className="text-2xl font-black tracking-tighter uppercase leading-tight">
                            <span className="text-orange-500 block mb-1" style={{marginTop:10}}>WELCOME,</span> 
                            <span className="text-white break-words">{user?.username || 'ADMIN'}</span>
                        </h2>
                    </div>

                    {isSidebarCollapsed && (
                        <div className="hidden lg:flex items-center justify-center mb-10 pt-6">
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                                <span className="text-white font-black">A</span>
                            </div>
                        </div>
                    )}

                    <div className="h-14 lg:h-16" />

                    <nav className="flex flex-col gap-4 flex-grow">
                        <Link href="/users" onClick={() => setSidebarOpen(false)}>
                            <Button
                                variant={isActive('/users') ? 'primary' : 'ghost'}
                                className={`w-full ${isSidebarCollapsed ? 'justify-center px-0' : 'justify-start px-4'} gap-4 h-12 rounded-xl border-none font-bold text-lg transition-all ${isActive('/users') ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                title={isSidebarCollapsed ? "Analytics" : ""}
                            >
                                <FaChartPie className={isActive('/users') ? 'text-white' : 'text-[#94a3b8] group-hover:text-white'} /> 
                                {!isSidebarCollapsed && <span className="text-white">Analytics</span>}
                            </Button>
                        </Link>

                        <Link href="/users/manage-topics" onClick={() => setSidebarOpen(false)}>
                            <Button
                                variant={isActive('/users/manage-topics') ? 'primary' : 'ghost'}
                                className={`w-full ${isSidebarCollapsed ? 'justify-center px-0' : 'justify-start px-4'} gap-4 h-12 rounded-xl border-none font-bold text-lg transition-all ${isActive('/users/manage-topics') ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                title={isSidebarCollapsed ? "Manage Topics" : ""}
                            >
                                <FaGraduationCap className={isActive('/users/manage-topics') ? 'text-white' : 'text-[#94a3b8] group-hover:text-white'} /> 
                                {!isSidebarCollapsed && <span className="text-white">Manage Topics</span>}
                            </Button>
                        </Link>

                        <Link href="/users/question-bank" onClick={() => setSidebarOpen(false)}>
                            <Button
                                variant={isActive('/users/question-bank') ? 'primary' : 'ghost'}
                                className={`w-full ${isSidebarCollapsed ? 'justify-center px-0' : 'justify-start px-4'} gap-4 h-12 rounded-xl border-none font-bold text-lg transition-all ${isActive('/users/question-bank') ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                title={isSidebarCollapsed ? "Question Bank" : ""}
                            >
                                <FaBook className={isActive('/users/question-bank') ? 'text-white' : 'text-[#94a3b8] group-hover:text-white'} /> 
                                {!isSidebarCollapsed && <span className="text-white">Question Bank</span>}
                            </Button>
                        </Link>

                        <Link href="/users/badges" onClick={() => setSidebarOpen(false)}>
                            <Button
                                variant={(isActive('/users/badges') || isActive('/users/challenges')) ? 'primary' : 'ghost'}
                                className={`w-full ${isSidebarCollapsed ? 'justify-center px-0' : 'justify-start px-4'} gap-4 h-12 rounded-xl border-none font-bold text-lg transition-all ${(isActive('/users/badges') || isActive('/users/challenges')) ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                title={isSidebarCollapsed ? "Badge & Challenges" : ""}
                            >
                                <FaAward className={(isActive('/users/badges') || isActive('/users/challenges')) ? 'text-white' : 'text-[#94a3b8] group-hover:text-white'} /> 
                                {!isSidebarCollapsed && <span className="text-white">Badge & Challenges</span>}
                            </Button>
                        </Link>

                        <Link href="/users/uploaded-files" onClick={() => setSidebarOpen(false)}>
                            <Button
                                variant={isActive('/users/uploaded-files') ? 'secondary' : 'ghost'}
                                className={`w-full ${isSidebarCollapsed ? 'justify-center px-0' : 'justify-start px-4'} gap-4 h-12 rounded-xl border-none font-bold text-lg transition-all ${isActive('/users/uploaded-files') ? 'bg-rose-500/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                title={isSidebarCollapsed ? "Uploaded Files" : ""}
                            >
                                <FaUpload className={isActive('/users/uploaded-files') ? 'text-rose-400' : 'text-[#94a3b8] group-hover:text-white'} /> 
                                {!isSidebarCollapsed && <span className={isActive('/users/uploaded-files') ? 'text-white' : 'text-[#94a3b8] group-hover:text-white'}>Uploaded Files</span>}
                            </Button>
                        </Link>
                    </nav>

                    {/* Collapse & Logout at bottom */}
                    <div className="mt-auto pt-6 border-t flex flex-col gap-2" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                        <Button
                            variant="ghost"
                            className={`w-full ${isSidebarCollapsed ? 'justify-center px-0' : 'justify-start px-4'} gap-3 h-12 text-[#94a3b8] hover:text-white hover:bg-white/5 border-none hidden lg:flex`}
                            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                            title={isSidebarCollapsed ? "Expand Menu" : "Collapse Menu"}
                        >
                            {isSidebarCollapsed ? <FaChevronRight /> : <><FaChevronLeft /> Collapse Menu</>}
                        </Button>

                        <Button
                            variant="ghost"
                            className={`w-full ${isSidebarCollapsed ? 'justify-center px-0' : 'justify-start px-4'} gap-3 h-12 text-[#94a3b8] hover:text-white hover:bg-white/5 border-none`}
                            title={isSidebarCollapsed ? "Logout" : ""}
                            onClick={async () => {
                                try {
                                    await api.post('/auth/logout');
                                } catch (err) {
                                    console.error('Logout error:', err);
                                }
                                localStorage.clear();
                                window.location.href = '/';
                            }}
                        >
                            <FaSignOutAlt /> {!isSidebarCollapsed && "Logout"}
                        </Button>
                    </div>
                </aside>

                {/* MAIN */}
                <main className="py-8 lg:pt-20 lg:pb-12 overflow-y-auto max-h-screen w-full">
                    <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
                        {/* TOP BAR */}
                        <div className="flex justify-end items-center mb-12">
                            <div className="flex items-center gap-4" style={{ margin: '1rem 1rem 2rem 1rem' }}>
                                    <Suspense fallback={<div className="w-40 h-10 bg-white/5 animate-pulse rounded-xl" />}>
                                        <AdminTopBarButtons />
                                    </Suspense>
                                <ThemeToggle />
                                <div className="h-6 w-[1px] bg-white/10 mx-2" />
                            </div>
                        </div>

                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

function AdminTopBarButtons() {
    const searchParams = useSearchParams();
    const pathname = usePathname();

    if (pathname !== '/users/manage-topics') return null;

    return (
        <div className="flex items-center gap-2 md:gap-3">
            {!searchParams.has('category') && (
                <Button
                    onClick={() => {
                        window.dispatchEvent(new CustomEvent('open-create-category-modal'));
                    }}
                    variant="ghost"
                    title="Create Category"
                    className="rounded-xl px-3 md:px-6 h-10 md:h-11 bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-2 whitespace-nowrap text-slate-300 font-bold"
                >
                    <FaFolderPlus className="text-xs md:text-sm" />
                    <span className="hidden sm:inline text-[10px] md:text-xs">Create Category</span>
                    <span className="sm:hidden text-[10px]">Category</span>
                </Button>
            )}
            <Button
                onClick={() => {
                    // Emit custom event to trigger modal in manage-topics/page.tsx
                    window.dispatchEvent(new CustomEvent('open-create-topic-modal'));
                }}
                title="Create Topic"
                className="rounded-xl px-3 md:px-6 h-10 md:h-11 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 flex items-center gap-2 whitespace-nowrap"
            >
                <FaPlus /> <span className="hidden sm:inline">Create Topic</span>
            </Button>
        </div>
    );
}
