'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Button from '@/components/Button';
import {
    FaSignOutAlt,
    FaBars,
    FaTimes,
    FaChartPie,
    FaGraduationCap,
    FaBook,
    FaMedal,
    FaAward,
    FaUpload,
    FaPlus,
    FaChevronDown,
    FaChevronUp,
    FaChevronLeft,
    FaChevronRight,
    FaUser,
    FaSearch,
    FaBell,
    FaQuestionCircle,
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
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [windowWidth, setWindowWidth] = useState(0);

    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        setWindowWidth(window.innerWidth);
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowWidth < 1024;
    const mainPaddingLeft = isMobile ? '1.5rem' : '8.5rem';
    const mainPaddingRight = isMobile ? '1.5rem' : '4rem';

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
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0b10' }}>
                <div style={{ width: '3rem', height: '3rem', border: '4px solid #1a1f2e', borderTopColor: '#10b981', borderRadius: '50%' }} className="animate-spin" />
            </div>
        );
    }

    const navItems = [
        { label: 'Analytics', icon: FaChartPie, href: '/users' },
        { label: 'Manage Topics', icon: FaGraduationCap, href: '/users/manage-topics' },
        { label: 'Question Bank', icon: FaBook, href: '/users/question-bank' },
        { label: 'Badges & Challenges', icon: (props: any) => <span {...props}>🏅</span>, href: '/users/badges' },
        { label: 'Uploaded Files', icon: FaUpload, href: '/users/uploaded-files' },
    ];

    const sidebarWidth = isSidebarCollapsed ? '100px' : '360px';
    const sidebarPadding = '4rem';

    return (
        <div style={{ minHeight: '100vh', background: '#ffffff', color: '#0f172a', overflowX: 'hidden', position: 'relative' }}>
            {/* MOBILE HEADER */}
            {isMobile && (
                <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 60, height: '70px', borderBottom: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(5,5,5,0.95)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f97316', letterSpacing: '-0.05em', textTransform: 'uppercase' }}>QR QUIZ PLATFORM</h1>
                    <button onClick={() => setSidebarOpen(true)} style={{ padding: '0.5rem', color: '#ffffff', background: 'none', border: 'none', cursor: 'pointer' }}>
                        <FaBars size={24} />
                    </button>
                </header>
            )}

            {/* Backdrop for mobile */}
            {sidebarOpen && isMobile && (
                <div
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 70, backdropFilter: 'blur(8px)' }}
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div style={{ display: 'flex', minHeight: '100vh' }}>
                {/* SIDEBAR */}
                <aside
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        height: '100vh',
                        zIndex: 80,
                        width: isMobile ? (sidebarOpen ? '300px' : '0px') : sidebarWidth,
                        backgroundColor: '#f97316',
                        borderRight: '1px solid rgba(255,255,255,0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        overflow: 'hidden',
                        transform: isMobile && !sidebarOpen ? 'translateX(-100%)' : 'translateX(0)'
                    }}
                >
                    {isMobile && (
                        <button
                            style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', color: '#ffffff', background: 'none', border: 'none', cursor: 'pointer', zIndex: 90 }}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <FaTimes size={24} />
                        </button>
                    )}

                    {/* Profile Section */}
                    <div style={{ 
                        paddingTop: '5rem', 
                        paddingBottom: '3rem', 
                        paddingLeft: (isSidebarCollapsed && !isMobile) ? '0' : sidebarPadding, 
                        paddingRight: (isSidebarCollapsed && !isMobile) ? '0' : sidebarPadding, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: (isSidebarCollapsed && !isMobile) ? 'center' : 'flex-start', 
                        gap: '1.5rem', 
                        marginBottom: '2rem' 
                    }}>
                        <div style={{ width: '70px', height: '70px', borderRadius: '50%', backgroundColor: '#1a1f2e', border: '2px solid rgba(249,115,22,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', position: 'relative', flexShrink: 0 }}>
                            <FaUser size={28} style={{ color: '#4b5563' }} />
                        </div>
                        
                        {(!isSidebarCollapsed || isMobile) && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                <span style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Authenticated as</span>
                                <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', textTransform: 'uppercase', lineHeight: 1 }}>
                                    {user?.username || 'ADMIN'}
                                </h2>
                            </div>
                        )}
                    </div>

                    {/* Navigation */}
                    <nav style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {navItems.map((item) => {
                                const active = isActive(item.href);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: (isSidebarCollapsed && !isMobile) ? 'center' : 'flex-start',
                                            gap: '1.25rem',
                                            paddingTop: '1.15rem',
                                            paddingBottom: '1.15rem',
                                            paddingLeft: (isSidebarCollapsed && !isMobile) ? '0' : sidebarPadding,
                                            paddingRight: (isSidebarCollapsed && !isMobile) ? '0' : sidebarPadding,
                                            transition: 'all 0.3s',
                                            textDecoration: 'none',
                                            borderLeft: active ? '4px solid #ffffff' : '4px solid transparent',
                                            backgroundColor: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                                            color: active ? '#ffffff' : 'rgba(255,255,255,0.7)',
                                            whiteSpace: 'nowrap'
                                        }}
                                        onClick={() => setSidebarOpen(false)}
                                    >
                                        <item.icon size={20} />
                                        {(!isSidebarCollapsed || isMobile) && (
                                            <span style={{ fontWeight: 900, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.15em' }}>{item.label}</span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* UTILITIES */}
                        <div style={{ 
                            marginTop: 'auto', 
                            paddingTop: '2rem',
                            paddingBottom: '2rem',
                            paddingLeft: (isSidebarCollapsed && !isMobile) ? '0' : sidebarPadding, 
                            paddingRight: (isSidebarCollapsed && !isMobile) ? '0' : sidebarPadding, 
                            borderTop: '1px solid rgba(255,255,255,0.1)', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '0.75rem' 
                        }}>
                            {!isMobile && (
                                <button
                                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                                    style={{ 
                                        background: 'none', 
                                        border: 'none', 
                                        padding: 0, 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: (isSidebarCollapsed && !isMobile) ? 'center' : 'flex-start',
                                        gap: '1.25rem', 
                                        color: 'rgba(255,255,255,0.7)', 
                                        cursor: 'pointer' 
                                    }}
                                >
                                    <FaBars size={18} style={isSidebarCollapsed ? {} : { transition: 'transform 0.5s', transform: 'rotate(90deg)' }} />
                                    {!isSidebarCollapsed && <span style={{ fontWeight: 900, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Collapse</span>}
                                </button>
                            )}
                            <button
                                onClick={async () => {
                                    try { await api.post('/auth/logout'); } catch {}
                                    localStorage.clear();
                                    window.location.href = '/';
                                }}
                                style={{ 
                                    background: 'none', 
                                    border: 'none', 
                                    padding: 0, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: (isSidebarCollapsed && !isMobile) ? 'center' : 'flex-start',
                                    gap: '1.25rem', 
                                    color: 'rgba(255,255,255,0.7)', 
                                    cursor: 'pointer' 
                                }}
                            >
                                <FaSignOutAlt size={18} />
                                {(!isSidebarCollapsed || isMobile) && <span style={{ fontWeight: 900, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Sign Out</span>}
                            </button>
                        </div>
                    </nav>
                </aside>

                {/* MAIN CONTENT AREA */}
                <main 
                    style={{ 
                        flex: 1,
                        marginLeft: isMobile ? '0' : sidebarWidth,
                        backgroundColor: '#ffffff',
                        minHeight: '100vh',
                        display: 'flex',
                        flexDirection: 'column',
                        overflowX: 'hidden',
                        transition: 'margin 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        paddingTop: isMobile ? '70px' : '0'
                    }}
                >
                    {/* Admin Actions Bar */}
                    {!isMobile && (
                        <div style={{ height: '90px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: '4rem', paddingRight: '4rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <span style={{ color: '#f97316', fontWeight: 900, fontSize: '16px', textTransform: 'uppercase', letterSpacing: '0.2em' }}>QR Quiz Platform</span>
                            </div>
                            <Suspense fallback={<div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />}>
                                <AdminTopBarButtons />
                            </Suspense>
                        </div>
                    )}

                    <div 
                        style={{ 
                            width: '100%',
                            maxWidth: '1600px',
                            paddingTop: isMobile ? '2.5rem' : '5rem',
                            paddingBottom: '5rem',
                            paddingLeft: mainPaddingLeft,
                            paddingRight: mainPaddingRight,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: isMobile ? '2.5rem' : '4rem'
                        }}
                    >
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
