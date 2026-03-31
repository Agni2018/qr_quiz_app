'use client';

import React, { useState, useEffect, Suspense } from 'react';
import api from '@/lib/api';
import Button from '@/components/Button';
import {
    FaSignOutAlt,
    FaBars,
    FaTimes,
    FaChartPie,
    FaGraduationCap,
    FaBook,
    FaUpload,
    FaPlus,
    FaUser,
    FaSearch,
    FaBell,
    FaQuestionCircle,
    FaFolderPlus,
    FaCog,
    FaHistory,
    FaMedal
} from 'react-icons/fa';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { SearchProvider, useSearch } from '@/contexts/SearchContext';

export default function UsersLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SearchProvider>
            <UsersDashboardContent>{children}</UsersDashboardContent>
        </SearchProvider>
    );
}

function UsersDashboardContent({
    children,
}: {
    children: React.ReactNode;
}) {
    const [user, setUser] = useState<any>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [windowWidth, setWindowWidth] = useState(0);
    const { searchTerm, setSearchTerm } = useSearch();

    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setWindowWidth(window.innerWidth);
            const handleResize = () => setWindowWidth(window.innerWidth);
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }
    }, []);

    const isMobile = windowWidth < 1024;
    const sidebarWidth = isSidebarCollapsed ? '100px' : '270px';

    const SEARCH_BAR_PATHS = [
        '/users',
        '/users/analytics',
        '/users/manage-topics',
        '/users/question-bank',
        '/users/badges',
        '/users/uploaded-files'
    ];

    const showSearchBar = SEARCH_BAR_PATHS.some(path => 
        pathname === path || pathname === `${path}/`
    );

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
        { label: 'Badges & Challenges', icon: FaMedal, href: '/users/badges' },
        { label: 'Uploaded Files', icon: FaUpload, href: '/users/uploaded-files' },
    ];

    return (
        <div style={{ minHeight: '100vh', background: '#ffffff', color: '#0f172a', overflowX: 'hidden', position: 'relative' }}>
            {/* MOBILE HEADER */}
            {isMobile && (
                <>
                    <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 60, height: '70px', borderBottom: '1px solid #f1f5f9', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
                        <h1 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#f97316', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>QR QUIZ</h1>
                        <button onClick={() => setSidebarOpen(true)} style={{ padding: '0.5rem', color: '#0f172a', background: 'none', border: 'none', cursor: 'pointer' }}>
                            <FaBars size={24} />
                        </button>
                    </header>
                    
                    {/* MOBILE SEARCH BAR */}
                    {showSearchBar && (
                        <div style={{ 
                            position: 'fixed', 
                            top: '70px', 
                            left: 0, 
                            right: 0, 
                            zIndex: 50, 
                            backgroundColor: '#ffffff', 
                            padding: '0.75rem 1.5rem',
                            borderBottom: '1px solid #f1f5f9'
                        }}>
                            <div style={{ position: 'relative', width: '100%' }}>
                                <input 
                                    type="text"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ 
                                        width: '100%',
                                        height: '44px',
                                        backgroundColor: '#f1f5f9',
                                        border: 'none',
                                        borderRadius: '22px',
                                        paddingLeft: '3rem',
                                        paddingRight: '1.25rem',
                                        fontSize: '14px',
                                        fontWeight: 500,
                                        color: '#334155',
                                        outline: 'none'
                                    }}
                                />
                                <FaSearch style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '16px' }} />
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Backdrop for mobile */}
            {sidebarOpen && isMobile && (
                <div
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 70, backdropFilter: 'blur(4px)' }}
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
                        width: isMobile ? (sidebarOpen ? '260px' : '0px') : sidebarWidth,
                        backgroundColor: '#ffffff',
                        borderRight: '1px solid #f1f5f9',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        overflow: 'hidden',
                        transform: isMobile && !sidebarOpen ? 'translateX(-100%)' : 'translateX(0)'
                    }}
                >
                    {isMobile && (
                        <button
                            style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', color: '#0f172a', background: 'none', border: 'none', cursor: 'pointer', zIndex: 90 }}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <FaTimes size={24} />
                        </button>
                    )}

                    {/* Admin Profile Section - Branding moved to Header */}
                    <div style={{ 
                        paddingTop: '3rem', 
                        paddingBottom: '2.5rem', 
                        paddingLeft: (isSidebarCollapsed && !isMobile) ? '0' : '2.5rem',
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: (isSidebarCollapsed && !isMobile) ? 'center' : 'flex-start',
                        gap: '0.25rem'
                    }}>
                        <div style={{ 
                            width: '72px', 
                            height: '72px', 
                            borderRadius: '50%', 
                            backgroundColor: '#f8fafc', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            boxShadow: '0 8px 16px rgba(0,0,0,0.06)',
                            border: '3px solid #f97316',
                            padding: '4px',
                            marginBottom: '0.75rem',
                            position: 'relative'
                        }}>
                            <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyItems: 'center' }}>
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f97316' }}>
                                    <FaUser size={32} />
                                </div>
                            </div>
                        </div>
                        
                        {(!isSidebarCollapsed || isMobile) && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', textTransform: 'lowercase', margin: 0 }}>
                                    {user?.username || 'admin'}
                                </h2>
                                <p style={{ fontSize: '10px', fontWeight: 800, color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                                    Authenticated as Admin
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Navigation */}
                    <nav style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', overflowX: 'hidden', padding: '1rem 0.75rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
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
                                            padding: '1rem 1.5rem',
                                            transition: 'all 0.3s ease',
                                            textDecoration: 'none',
                                            backgroundColor: active ? '#f97316' : 'transparent',
                                            color: active ? '#ffffff' : '#475569',
                                            whiteSpace: 'nowrap',
                                            borderRadius: '16px',
                                            boxShadow: active ? '0 10px 15px -3px rgba(249, 115, 22, 0.3)' : 'none'
                                        }}
                                        onClick={() => setSidebarOpen(false)}
                                    >
                                        <div style={{ width: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <item.icon size={20} style={{ opacity: 1 }} />
                                        </div>
                                        {(!isSidebarCollapsed || isMobile) && (
                                            <span style={{ fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* UTILITIES */}
                        <div style={{ 
                            marginTop: 'auto', 
                            paddingTop: '2rem',
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '0.5rem'
                        }}>
                             {!isMobile && (
                                <button
                                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                                    style={{ 
                                        background: 'none', 
                                        border: 'none', 
                                        padding: '1rem 1.5rem', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: (isSidebarCollapsed && !isMobile) ? 'center' : 'flex-start',
                                        gap: '1.25rem', 
                                        color: '#475569', 
                                        cursor: 'pointer',
                                        borderRadius: '16px',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <FaBars size={20} />
                                    {!isSidebarCollapsed && <span style={{ fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Collapse</span>}
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
                                    padding: '1rem 1.5rem', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: (isSidebarCollapsed && !isMobile) ? 'center' : 'flex-start',
                                    gap: '1.25rem', 
                                    color: '#475569', 
                                    cursor: 'pointer',
                                    borderRadius: '16px',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <FaSignOutAlt size={20} />
                                {(!isSidebarCollapsed || isMobile) && <span style={{ fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sign Out</span>}
                            </button>
                        </div>
                    </nav>
                </aside>

                {/* MAIN CONTENT AREA */}
                <main 
                    style={{ 
                        flex: 1,
                        marginLeft: isMobile ? '0' : sidebarWidth,
                        backgroundColor: '#f8fafc',
                        minHeight: '100vh',
                        display: 'flex',
                        flexDirection: 'column',
                        overflowX: 'hidden',
                        transition: 'margin 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        paddingTop: isMobile ? (showSearchBar ? '130px' : '70px') : '0'
                    }}
                >
                    {/* Header Bar */}
                    {!isMobile && (
                        <div style={{ height: '90px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: '4rem', paddingRight: '4rem', backgroundColor: '#ffffff' }}>
                            {/* App Heading */}
                            <div style={{ display: 'flex', alignItems: 'center', minWidth: '240px' }}>
                                <span style={{ color: '#f97316', fontWeight: 950, fontSize: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>QR Quiz Platform</span>
                            </div>

                            {/* Global Search Bar */}
                            {showSearchBar && (
                                <div style={{ position: 'relative', width: '100%', maxWidth: '600px', margin: '0 4rem' }}>
                                    <input 
                                        type="text"
                                        placeholder="Search across all elements..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{ 
                                            width: '100%',
                                            height: '50px',
                                            backgroundColor: '#f1f5f9',
                                            border: 'none',
                                            borderRadius: '25px',
                                            paddingLeft: '3.5rem',
                                            paddingRight: '1.5rem',
                                            fontSize: '15px',
                                            fontWeight: 500,
                                            color: '#334155',
                                            outline: 'none'
                                        }}
                                    />
                                    <FaSearch style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '18px' }} />
                                </div>
                            )}

                            {/* Admin Page Actions */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', minWidth: 'max-content' }}>
                                <Suspense fallback={<div style={{ width: '40px', height: '40px', background: 'rgba(0,0,0,0.05)', borderRadius: '50%' }} />}>
                                    <AdminTopBarButtons />
                                </Suspense>
                            </div>
                        </div>
                    )}

                    <div 
                        style={{ 
                            width: '100%',
                            maxWidth: '1600px',
                            paddingTop: isMobile ? '2rem' : '4rem',
                            paddingBottom: '5rem',
                            paddingLeft: isMobile ? '1.5rem' : '8.5rem',
                            paddingRight: isMobile ? '1.5rem' : '4rem',
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
                    className="rounded-xl px-3 md:px-6 h-10 md:h-11 bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center gap-2 whitespace-nowrap text-slate-700 font-bold"
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
                className="rounded-xl px-3 md:px-6 h-10 md:h-11 bg-[#f97316] hover:bg-[#ea580c] shadow-lg shadow-orange-500/10 flex items-center gap-2 whitespace-nowrap text-white"
            >
                <FaPlus /> <span className="hidden sm:inline">Create Topic</span>
            </Button>
        </div>
    );
}
