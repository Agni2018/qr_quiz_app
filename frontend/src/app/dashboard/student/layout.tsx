'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter, usePathname } from 'next/navigation';
import Button from '@/components/Button';
import ThemeToggle from '@/components/ThemeToggle';
import {
    FaGraduationCap,
    FaHistory,
    FaTrophy,
    FaSignOutAlt,
    FaBars,
    FaTimes,
    FaAward,
    FaBookOpen,
    FaBell,
    FaCompass
} from 'react-icons/fa';
import Link from 'next/link';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const router = useRouter();
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const [statusRes, unreadRes] = await Promise.all([
                    api.get('/auth/status'),
                    api.get('/messages/unread-count')
                ]);

                setUser(statusRes.data.user);
                setUnreadCount(unreadRes.data.count);
            } catch (err) {
                console.error('Failed to fetch user status:', err);
                router.replace('/');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();

        // Listen for message read events from pages
        const handleMessagesRead = () => {
            setUnreadCount(0);
        };
        window.addEventListener('messages-read', handleMessagesRead);
        return () => window.removeEventListener('messages-read', handleMessagesRead);
    }, [router]);

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (err) {
            console.error('Logout error:', err);
        }
        localStorage.clear();
        window.location.href = '/';
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
                <div style={{ width: '3rem', height: '3rem', border: '4px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%' }} className="animate-spin" />
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)', color: 'var(--text-primary)', overflowX: 'hidden' }}>
            {/* MOBILE HEADER */}
            <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between p-4 border-b border-white/5 bg-slate-900/60 backdrop-blur-xl">
                <h1 className="text-xl font-black">Student Portal</h1>
                <button onClick={() => setSidebarOpen(true)} className="p-2">
                    <FaBars />
                </button>
            </header>

            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/60 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div className="lg:grid lg:grid-cols-[300px_1fr] lg:gap-12 xl:gap-20 flex flex-col min-h-screen">
                {/* SIDEBAR */}
                <aside
                    className={`
                        fixed lg:static top-0 left-0 z-50
                        h-screen w-[300px]
                        border-r
                        px-8 py-12 flex flex-col transition-transform duration-300
                        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    `}
                    style={{
                        background: 'var(--glass-bg)',
                        backdropFilter: 'blur(var(--blur))',
                        borderColor: 'var(--border-color)'
                    }}
                >
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden absolute top-6 right-6">
                        <FaTimes />
                    </button>

                    <div className="mb-14 pt-6 relative group">
                        <div className="absolute -inset-10 bg-primary/20 blur-[120px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                        <div className="flex items-center gap-4 mb-10 relative z-10 px-4">
                            <div className="w-16 h-[5px] bg-gradient-to-r from-primary via-secondary to-transparent rounded-full shadow-[0_0_20px_rgba(var(--primary-rgb),0.6)]" />
                            <span className="text-[0.7rem] font-black uppercase tracking-[0.5em] text-primary drop-shadow-[0_0_10px_rgba(var(--primary-rgb),0.4)]">Student Portal</span>
                        </div>
                        <div className="flex flex-col gap-0 relative z-10">
                            <h3 className="text-6xl font-light bg-gradient-to-r from-slate-400 via-primary/80 to-secondary bg-clip-text text-transparent tracking-tight leading-none" style={{ paddingLeft: '1.5rem', marginTop: '1rem' }}>Welcome,</h3>
                            <h2 className="text-8xl font-black bg-gradient-to-br from-white via-primary to-primary bg-clip-text text-transparent tracking-tighter leading-tight mt-1" style={{ paddingLeft: '1.5rem' }}>
                                {user?.username}
                            </h2>
                        </div>
                    </div>

                    <div className="h-14 lg:h-16" />

                    <nav className="flex flex-col gap-5 flex-1 w-full">
                        <Link href="/dashboard/student/progress" onClick={() => setSidebarOpen(false)}>
                            <Button
                                variant={isActive('/dashboard/student/progress') ? 'secondary' : 'ghost'}
                                className={`justify-start gap-4 h-12 rounded-xl text-lg font-bold transition-all w-full ${isActive('/dashboard/student/progress') ? 'bg-primary/10 text-primary border-none shadow-none' : 'text-slate-400 hover:text-white hover:bg-white/5 border-none'}`}
                            >
                                <FaHistory className={isActive('/dashboard/student/progress') ? 'text-white' : 'text-[#94a3b8] group-hover:text-white'} /> <span className={isActive('/dashboard/student/progress') ? 'text-white' : 'text-[#94a3b8] group-hover:text-white'}>Manage Topics</span>
                            </Button>
                        </Link>

                        <Link href="/dashboard/student/explore" onClick={() => setSidebarOpen(false)}>
                            <Button
                                variant={isActive('/dashboard/student/explore') ? 'secondary' : 'ghost'}
                                className={`justify-start gap-4 h-12 rounded-xl text-lg font-bold transition-all w-full ${isActive('/dashboard/student/explore') ? 'bg-primary/10 text-primary border-none shadow-none' : 'text-slate-400 hover:text-white hover:bg-white/5 border-none'}`}
                            >
                                <FaCompass className={isActive('/dashboard/student/explore') ? 'text-white' : 'text-[#94a3b8] group-hover:text-white'} /> <span className={isActive('/dashboard/student/explore') ? 'text-white' : 'text-[#94a3b8] group-hover:text-white'}>Explore Quiz</span>
                            </Button>
                        </Link>

                        <Link href="/dashboard/student/leaderboard" onClick={() => setSidebarOpen(false)}>
                            <Button
                                variant={isActive('/dashboard/student/leaderboard') ? 'secondary' : 'ghost'}
                                className={`justify-start gap-4 h-12 rounded-xl text-lg font-bold transition-all w-full ${isActive('/dashboard/student/leaderboard') ? 'bg-yellow-500/10 text-white border-none shadow-none' : 'text-slate-400 hover:text-white hover:bg-white/5 border-none'}`}
                            >
                                <FaTrophy className={isActive('/dashboard/student/leaderboard') ? 'text-white' : 'text-[#94a3b8] group-hover:text-white'} /> <span className={isActive('/dashboard/student/leaderboard') ? 'text-white' : 'text-[#94a3b8] group-hover:text-white'}>Leaderboard</span>
                            </Button>
                        </Link>

                        <Link href="/dashboard/student/badges" onClick={() => setSidebarOpen(false)}>
                            <Button
                                variant={isActive('/dashboard/student/badges') ? 'secondary' : 'ghost'}
                                className={`justify-start gap-4 h-12 rounded-xl text-lg font-bold transition-all w-full ${isActive('/dashboard/student/badges') ? 'bg-purple-500/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5 border-none'}`}
                            >
                                <FaAward className={isActive('/dashboard/student/badges') ? 'text-white' : 'text-[#94a3b8] group-hover:text-white'} /> <span className={isActive('/dashboard/student/badges') ? 'text-white' : 'text-[#94a3b8] group-hover:text-white'}>My Badges</span>
                            </Button>
                        </Link>

                        <Link href="/dashboard/student/certificates" onClick={() => setSidebarOpen(false)}>
                            <Button
                                variant={isActive('/dashboard/student/certificates') ? 'secondary' : 'ghost'}
                                className={`justify-start gap-4 h-12 rounded-xl text-lg font-bold transition-all w-full ${isActive('/dashboard/student/certificates') ? 'bg-indigo-500/10 text-white border-none shadow-none' : 'text-slate-400 hover:text-white hover:bg-white/5 border-none'}`}
                            >
                                <FaGraduationCap className={isActive('/dashboard/student/certificates') ? 'text-white' : 'text-[#94a3b8] group-hover:text-white'} /> <span className={isActive('/dashboard/student/certificates') ? 'text-white' : 'text-[#94a3b8] group-hover:text-white'}>Certificates</span>
                            </Button>
                        </Link>

                        <Link href="/dashboard/student/materials" onClick={() => setSidebarOpen(false)}>
                            <Button
                                variant={isActive('/dashboard/student/materials') ? 'secondary' : 'ghost'}
                                className={`justify-start gap-4 h-12 rounded-xl text-lg font-bold transition-all w-full ${isActive('/dashboard/student/materials') ? 'bg-rose-500/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5 border-none'}`}
                            >
                                <FaBookOpen className={isActive('/dashboard/student/materials') ? 'text-white' : 'text-[#94a3b8] group-hover:text-white'} /> <span className={isActive('/dashboard/student/materials') ? 'text-white' : 'text-[#94a3b8] group-hover:text-white'}>Study Materials</span>
                            </Button>
                        </Link>

                        <Link href="/dashboard/student/notifications" onClick={() => setSidebarOpen(false)}>
                            <Button
                                variant={isActive('/dashboard/student/notifications') ? 'secondary' : 'ghost'}
                                className={`justify-start gap-4 h-12 rounded-xl text-lg font-bold transition-all relative w-full ${isActive('/dashboard/student/notifications') ? 'bg-blue-500/10 text-white border-none shadow-none' : 'text-slate-400 hover:text-white hover:bg-white/5 border-none'}`}
                            >
                                <div className="relative">
                                    <FaBell className={isActive('/dashboard/student/notifications') ? 'text-white' : 'text-[#94a3b8] group-hover:text-white'} />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                                            {unreadCount}
                                        </span>
                                    )}
                                </div>
                                <span className={isActive('/dashboard/student/notifications') ? 'text-white' : 'text-[#94a3b8] group-hover:text-white'}>Notifications</span>
                            </Button>
                        </Link>
                    </nav>

                    <div className="mt-8 pt-8 border-t border-slate-200/10 dark:border-white/5 flex flex-col gap-4">
                        <Button
                            variant="ghost"
                            className="justify-start gap-3 h-12 text-[#94a3b8] hover:text-red-500 hover:bg-red-500/5 border-none rounded-xl"
                            onClick={handleLogout}
                        >
                            <FaSignOutAlt /> Sign Out
                        </Button>
                    </div>
                </aside>

                {/* MAIN CONTENT */}
                <main className="flex-1 py-8 lg:p-14 xl:py-24 overflow-y-auto">
                    <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-20" style={{ margin: '1rem 1rem 2rem 1rem' }}>
                        {/* TOP BAR */}
                        <div className="flex flex-wrap items-center justify-end gap-6 mb-16">
                            <ThemeToggle />
                            <div className="bg-slate-900/60 border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-3 backdrop-blur-xl shadow-lg">
                                <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500">🔥</div>
                                <div className="flex flex-col leading-none">
                                    <span className="text-[0.6rem] font-bold text-slate-500 uppercase">Streak</span>
                                    <span className="text-xl font-black">{user?.loginStreak || 0} days</span>
                                </div>
                            </div>
                            <div className="bg-slate-900/60 border border-white/10 px-8 py-4 rounded-[2rem] flex items-center gap-5 backdrop-blur-xl shadow-2xl group">
                                <FaTrophy className="text-yellow-500 text-3xl animate-pulse" />
                                <div className="flex flex-col leading-tight">
                                    <span className="text-[0.7rem] font-black text-slate-500 uppercase tracking-widest mb-1">Total Points</span>
                                    <span className="text-3xl font-black text-white">{user?.points || 0}</span>
                                </div>
                            </div>
                        </div>

                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
