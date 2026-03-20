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
    FaStar,
    FaFolderPlus
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
    const [isBadgeChallengesOpen, setIsBadgeChallengesOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams(); // Keep it here if it's used elsewhere, but we'll see

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
            <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-10">

                {/* SIDEBAR */}
                <aside
                    className={`
                        fixed lg:static top-0 left-0 z-50
                        h-screen w-[280px]
                        border-r
                        px-8 py-12
                        transform transition-transform
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

                    {/* Branding Section - Premium Styled */}
                    <div className="mb-14 pt-6 relative group">
                        <div className="absolute -inset-10 bg-primary/20 blur-[120px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                        <div className="flex items-center gap-4 mb-10 relative z-10 px-4">
                            <div className="w-16 h-[5px] bg-gradient-to-r from-primary via-secondary to-transparent rounded-full shadow-[0_0_20px_rgba(var(--primary-rgb),0.6)]" />
                            <span className="text-[0.7rem] font-black uppercase tracking-[0.5em] text-primary drop-shadow-[0_0_10px_rgba(var(--primary-rgb),0.4)]">Admin Portal</span>
                        </div>

                        <div className="flex flex-col gap-0 relative z-10">
                            <h3 className="text-6xl font-light bg-gradient-to-r from-slate-400 via-primary/80 to-secondary bg-clip-text text-transparent tracking-tight leading-none" style={{ paddingLeft: '1.5rem', marginTop: '1rem' }}>Welcome,</h3>
                            <h2 className="text-8xl font-black bg-gradient-to-br from-white via-primary to-primary bg-clip-text text-transparent tracking-tighter leading-tight mt-1" style={{ paddingLeft: '1.5rem' }}>
                                {user?.username || 'admin'}
                            </h2>
                        </div>
                    </div>

                    <div className="h-14 lg:h-16" />

                    <nav className="flex flex-col gap-4 flex-grow">
                        <Link href="/users" onClick={() => setSidebarOpen(false)}>
                            <Button
                                variant={isActive('/users') ? 'secondary' : 'ghost'}
                                className={`w-full justify-start gap-4 h-12 rounded-xl border-none font-bold text-lg transition-all ${isActive('/users') ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                            >
                                <FaChartPie className={isActive('/users') ? 'text-primary' : 'text-[#94a3b8] group-hover:text-white'} /> <span className={isActive('/users') ? 'text-primary' : 'text-[#94a3b8] group-hover:text-white'}>Analytics</span>
                            </Button>
                        </Link>

                        <Link href="/users/manage-topics" onClick={() => setSidebarOpen(false)}>
                            <Button
                                variant={isActive('/users/manage-topics') ? 'secondary' : 'ghost'}
                                className={`w-full justify-start gap-4 h-12 rounded-xl border-none font-bold text-lg transition-all ${isActive('/users/manage-topics') ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                            >
                                <FaGraduationCap className={isActive('/users/manage-topics') ? 'text-primary' : 'text-[#94a3b8] group-hover:text-white'} /> <span className={isActive('/users/manage-topics') ? 'text-primary' : 'text-[#94a3b8] group-hover:text-white'}>Manage Topics</span>
                            </Button>
                        </Link>

                        <Link href="/users/question-bank" onClick={() => setSidebarOpen(false)}>
                            <Button
                                variant={isActive('/users/question-bank') ? 'secondary' : 'ghost'}
                                className={`w-full justify-start gap-4 h-12 rounded-xl border-none font-bold text-lg transition-all ${isActive('/users/question-bank') ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                            >
                                <FaBook className={isActive('/users/question-bank') ? 'text-primary' : 'text-[#94a3b8] group-hover:text-white'} /> <span className={isActive('/users/question-bank') ? 'text-primary' : 'text-[#94a3b8] group-hover:text-white'}>Question Bank</span>
                            </Button>
                        </Link>

                        {/* Badge & Challenges Dropdown */}
                        <div className="flex flex-col gap-2">
                            <Button
                                variant={(isActive('/users/badges') || isActive('/users/challenges')) ? 'secondary' : 'ghost'}
                                className={`w-full justify-between gap-4 h-12 rounded-xl border-none font-bold text-lg transition-all ${(isActive('/users/badges') || isActive('/users/challenges')) ? 'bg-amber-500/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                onClick={() => setIsBadgeChallengesOpen(!isBadgeChallengesOpen)}
                            >
                                <div className="flex items-center gap-4">
                                    <FaAward className={(isActive('/users/badges') || isActive('/users/challenges')) ? 'text-amber-400' : 'text-[#94a3b8] group-hover:text-white'} /> 
                                    <span className={(isActive('/users/badges') || isActive('/users/challenges')) ? 'text-white' : 'text-[#94a3b8] group-hover:text-white'}>Badge & Challenges</span>
                                </div>
                                {isBadgeChallengesOpen ? <FaChevronUp className="text-sm" /> : <FaChevronDown className="text-sm" />}
                            </Button>

                            {isBadgeChallengesOpen && (
                                <div className="flex flex-col gap-2 pl-6 animate-fade-in">
                                    <Link href="/users/badges" onClick={() => setSidebarOpen(false)}>
                                        <Button
                                            variant={isActive('/users/badges') ? 'secondary' : 'ghost'}
                                            className={`justify-start gap-4 h-10 rounded-xl text-sm font-bold transition-all w-full ${isActive('/users/badges') ? 'bg-amber-500/20 text-white' : 'text-slate-500 hover:text-white hover:bg-white/5 border-none'}`}
                                        >
                                            <FaAward className="text-xs text-amber-500" /> Badge Rewards
                                        </Button>
                                    </Link>
                                    <Link href="/users/challenges" onClick={() => setSidebarOpen(false)}>
                                        <Button
                                            variant={isActive('/users/challenges') ? 'secondary' : 'ghost'}
                                            className={`justify-start gap-4 h-10 rounded-xl text-sm font-bold transition-all w-full ${isActive('/users/challenges') ? 'bg-blue-500/20 text-white' : 'text-slate-500 hover:text-white hover:bg-white/5 border-none'}`}
                                        >
                                            <FaStar className="text-xs text-yellow-500" /> Weekly Challenges
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>

                        <Link href="/users/uploaded-files" onClick={() => setSidebarOpen(false)}>
                            <Button
                                variant={isActive('/users/uploaded-files') ? 'secondary' : 'ghost'}
                                className={`w-full justify-start gap-4 h-12 rounded-xl border-none font-bold text-lg transition-all ${isActive('/users/uploaded-files') ? 'bg-rose-500/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                            >
                                <FaUpload className={isActive('/users/uploaded-files') ? 'text-rose-400' : 'text-[#94a3b8] group-hover:text-white'} /> <span className={isActive('/users/uploaded-files') ? 'text-white' : 'text-[#94a3b8] group-hover:text-white'}>Uploaded Files</span>
                            </Button>
                        </Link>
                    </nav>

                    {/* Logout at bottom */}
                    <div className="mt-auto pt-6 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 h-12 text-[#94a3b8] hover:text-white hover:bg-white/5 border-none"
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
                            <FaSignOutAlt /> Logout
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
