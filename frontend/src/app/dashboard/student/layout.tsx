'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter, usePathname } from 'next/navigation';
import Button from '@/components/Button';
import {
    FaGraduationCap,
    FaHistory,
    FaTrophy,
    FaSignOutAlt,
    FaBars,
    FaTimes,
    FaMedal,
    FaBookOpen,
    FaBell,
    FaCompass,
    FaUserPlus,
    FaChevronDown,
    FaChevronUp,
    FaChevronLeft,
    FaChevronRight,
    FaStar,
    FaUser,
    FaSearch
} from 'react-icons/fa';

import Link from 'next/link';
import { SearchProvider, useSearch } from '@/contexts/SearchContext';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
    return (
        <SearchProvider>
            <StudentDashboardContent>{children}</StudentDashboardContent>
        </SearchProvider>
    );
}

function StudentDashboardContent({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

    const { searchTerm, setSearchTerm } = useSearch();

    // Daily Points Modal State
    const [showPointsModal, setShowPointsModal] = useState(false);
    const [pointsAwarded, setPointsAwarded] = useState(0);
    const [streakInfo, setStreakInfo] = useState('');

    // Level Up Modal State
    const [showLevelModal, setShowLevelModal] = useState(false);
    const [levelInfo, setLevelInfo] = useState<any>(null);

    const router = useRouter();
    const pathname = usePathname();

    const SEARCH_BAR_PATHS = [
        '/dashboard/student/progress',
        '/dashboard/student/explore',
        '/dashboard/student/certificates',
        '/dashboard/student/materials'
    ];

    const showSearchBar = SEARCH_BAR_PATHS.some(path => 
        pathname === path || pathname === `${path}/`
    );

    const isActive = (path: string) => {
        if (path === '/dashboard/student/badges') {
            return pathname === '/dashboard/student/badges' || pathname === '/dashboard/student/challenges' || pathname.startsWith('/dashboard/student/badges');
        }
        return pathname === path || pathname.startsWith(path + '/');
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const [statusRes, unreadRes] = await Promise.all([
                    api.get('/auth/status'),
                    api.get('/messages/unread-count')
                ]);

                console.log('[Dashboard] User data:', statusRes.data.user);
                setUser(statusRes.data.user);
                setUnreadCount(unreadRes.data.count);

                // Check for level up
                if (statusRes.data.user.levelUp) {
                    console.log('[Dashboard] Level up detected:', statusRes.data.user.levelUp);
                    setLevelInfo(statusRes.data.user.levelUp);
                    setShowLevelModal(true);
                }
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

        // Check for referral points in messages
        const checkReferralPoints = async () => {
            try {
                const res = await api.get('/messages');
                const messages = res.data;
                const unreadPointsMsg = messages.find((m: any) => !m.isRead && m.text.includes('Congratulations!') && m.text.includes('earned') && m.text.includes('points'));
                
                if (unreadPointsMsg) {
                    const pointsMatch = unreadPointsMsg.text.match(/earned (\d+) points/);
                    if (pointsMatch) {
                        const points = parseInt(pointsMatch[1]);
                        setPointsAwarded(points);
                        setStreakInfo(unreadPointsMsg.text);
                        setShowPointsModal(true);
                        // Mark as read so it doesn't show again
                        await api.patch('/messages/read', { messageId: unreadPointsMsg._id });
                    }
                }
            } catch (err) {
                console.error('Error checking referral points:', err);
            }
        };
        checkReferralPoints();

        // Check for daily points award
        const dailyAwarded = sessionStorage.getItem('dailyPointsAwarded');
        if (dailyAwarded === 'true') {
            const points = parseInt(sessionStorage.getItem('pointsAwarded') || '0');
            const streak = sessionStorage.getItem('streakStatus') || '';

            setPointsAwarded(points);
            setStreakInfo(streak);
            setShowPointsModal(true);

            // Clear the flags so it doesn't show again on refresh
            sessionStorage.removeItem('dailyPointsAwarded');
            sessionStorage.removeItem('pointsAwarded');
            sessionStorage.removeItem('streakStatus');
        }

        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('messages-read', handleMessagesRead);
            window.removeEventListener('resize', handleResize);
        };
    }, [router]);

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (err) {
            console.error('Logout error:', err);
        }
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/';
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0b10' }}>
                <div style={{ width: '3rem', height: '3rem', border: '4px solid #1a1f2e', borderTopColor: '#10b981', borderRadius: '50%' }} className="animate-spin" />
            </div>
        );
    }

    const isMobile = windowWidth < 1024;
    const sidebarWidth = isSidebarCollapsed ? '100px' : '300px';

    const navItems = [
        { label: 'Manage Topics', icon: FaHistory, href: '/dashboard/student/progress' },
        { label: 'Explore Topics', icon: FaCompass, href: '/dashboard/student/explore' },
        { label: 'Leaderboard', icon: FaTrophy, href: '/dashboard/student/leaderboard' },
        { label: 'Referral', icon: FaUserPlus, href: '/dashboard/student/referral' },
        { label: 'Badge & Challenges', icon: FaMedal, href: '/dashboard/student/badges' },
        { label: 'Certificate', icon: FaGraduationCap, href: '/dashboard/student/certificates' },
        { label: 'Study Materials', icon: FaBookOpen, href: '/dashboard/student/materials' },
        { label: 'Notifications', icon: FaBell, href: '/dashboard/student/notifications', count: unreadCount },
    ];

    const getSearchPlaceholder = () => {
        if (pathname.includes('/progress')) return 'Search your topics...';
        if (pathname.includes('/explore')) return 'Explore new topics...';
        if (pathname.includes('/certificates')) return 'Search your certificates...';
        if (pathname.includes('/materials')) return 'Search study materials...';
        return 'Search...';
    };

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
                                    placeholder={getSearchPlaceholder()}
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
                        width: isMobile ? (sidebarOpen ? '300px' : '0px') : sidebarWidth,
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

                    {/* Branding section */}
                    <div style={{ 
                        paddingTop: '3rem', 
                        paddingBottom: '2.5rem', 
                        paddingLeft: (isSidebarCollapsed && !isMobile) ? '0' : '1rem',
                        paddingRight: (isSidebarCollapsed && !isMobile) ? '0' : '1rem',
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        gap: '0.25rem',
                        textAlign: 'center'
                    }}>
                        {/* Welcome Message / Profile section */}
                        <div style={{ 
                            width: '85px', 
                            height: '85px', 
                            borderRadius: '50%', 
                            backgroundColor: '#f8fafc', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            boxShadow: '0 12px 24px rgba(0,0,0,0.08)',
                            border: '4px solid #f97316',
                            padding: '4px',
                            marginBottom: '1.25rem',
                            position: 'relative'
                        }}>
                            <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyItems: 'center' }}>
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f97316' }}>
                                    <FaUser size={40} />
                                </div>
                            </div>
                        </div>
                        
                        {(!isSidebarCollapsed || isMobile) && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                                <h2 style={{ fontSize: '22px', fontWeight: 1000, color: '#0f172a', letterSpacing: '-0.03em', textTransform: 'lowercase', margin: 0, lineHeight: '1.1' }}>
                                    welcome, {user?.username || 'student'}
                                </h2>
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
                                            boxShadow: active ? '0 10px 15px -3px rgba(249, 115, 22, 0.3)' : 'none',
                                            position: 'relative'
                                        }}
                                        onClick={() => setSidebarOpen(false)}
                                    >
                                        <div style={{ width: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <item.icon size={20} style={{ opacity: 1 }} />
                                        </div>
                                        {(!isSidebarCollapsed || isMobile) && (
                                            <span style={{ fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                {item.label}
                                                {item.count ? item.count > 0 && (
                                                    <span style={{ 
                                                        marginLeft: '8px', 
                                                        backgroundColor: active ? '#ffffff' : '#ef4444', 
                                                        color: active ? '#f97316' : '#ffffff', 
                                                        fontSize: '10px', 
                                                        padding: '2px 6px', 
                                                        borderRadius: '10px' 
                                                    }}>
                                                        {item.count}
                                                    </span>
                                                ) : null}
                                            </span>
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
                                onClick={handleLogout}
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', minWidth: 'max-content' }}>
                                <span style={{ color: '#f97316', fontWeight: 950, fontSize: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>QR Quiz Platform</span>
                            </div>

                            {/* Global Search Bar */}
                            {showSearchBar && (
                                <div style={{ position: 'relative', width: '100%', maxWidth: '600px', margin: '0 4rem' }}>
                                    <input 
                                        type="text"
                                        placeholder={getSearchPlaceholder()}
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

                            {/* Stats */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 'max-content' }}>
                                <LevelCardWhite points={user?.points || 0} />
                                <div style={{ background: '#ffffff', border: '1px solid #f1f5f9', borderRadius: '1rem', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                    <span style={{ fontSize: '1.1rem' }}>🔥</span>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontSize: '9px', fontWeight: 800, color: '#f97316', textTransform: 'uppercase' }}>Streak</span>
                                        <span style={{ fontSize: '13px', fontWeight: 900, color: '#0f172a' }}>{user?.loginStreak || 0} days</span>
                                    </div>
                                </div>
                                <div style={{ background: '#ffffff', border: '1px solid #f1f5f9', borderRadius: '1rem', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                    <FaTrophy style={{ color: '#f59e0b', fontSize: '1.1rem' }} />
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontSize: '9px', fontWeight: 800, color: '#f97316', textTransform: 'uppercase' }}>Points</span>
                                        <span style={{ fontSize: '13px', fontWeight: 900, color: '#0f172a' }}>{user?.points || 0}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* MOBILE STATS BAR (only if search bar not showing or already compensated in paddingTop) */}
                    {isMobile && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '0.75rem', backgroundColor: '#ffffff', borderBottom: '1px solid #f1f5f9' }}>
                            <MobileLevelBadge points={user?.points || 0} />
                            <div style={{ backgroundColor: '#fff', padding: '4px 10px', borderRadius: '12px', border: '1px solid #f1f5f9', fontSize: '11px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span>🔥</span> {user?.loginStreak || 0}
                            </div>
                            <div style={{ backgroundColor: '#fff', padding: '4px 10px', borderRadius: '12px', border: '1px solid #f1f5f9', fontSize: '11px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <FaTrophy style={{ color: '#f59e0b', fontSize: '10px' }} /> {user?.points || 0}
                            </div>
                        </div>
                    )}

                    <div 
                        style={{ 
                            width: '100%',
                            maxWidth: '1600px',
                            margin: '0 auto',
                            paddingTop: isMobile ? '1.5rem' : '3.5rem',
                            paddingBottom: '5rem',
                            paddingLeft: isMobile ? '1.5rem' : '4rem',
                            paddingRight: isMobile ? '1.5rem' : '4rem',
                            flex: 1
                        }}
                    >
                        {children}
                    </div>
                </main>
            </div>

            {/* DAILY POINTS MODAL */}
            {showPointsModal && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}>
                    <div style={{ maxWidth: '400px', width: '100%', backgroundColor: '#ffffff', borderRadius: '2rem', padding: '2.5rem', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <div style={{ width: '80px', height: '80px', backgroundColor: '#fef3c7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                            <FaTrophy style={{ fontSize: '2.5rem', color: '#f59e0b' }} />
                        </div>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.5rem' }}>CONGRATULATIONS!</h2>
                        <p style={{ color: '#f59e0b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem' }}>Awesome!</p>
                        <div style={{ backgroundColor: '#f8fafc', borderRadius: '1.5rem', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid #f1f5f9' }}>
                            <p style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>You've Earned</p>
                            <h3 style={{ fontSize: '3rem', fontWeight: 950, color: '#0f172a' }}>+{pointsAwarded} <span style={{ fontSize: '1.25rem', color: '#f59e0b' }}>PTS</span></h3>
                            {streakInfo && <p style={{ marginTop: '0.5rem', fontSize: '11px', color: '#10b981', fontWeight: 700, fontStyle: 'italic' }}>{streakInfo}</p>}
                        </div>
                        <Button onClick={() => setShowPointsModal(false)} style={{ width: '100%', padding: '1.25rem', borderRadius: '1.25rem', backgroundColor: '#f59e0b', border: 'none', color: '#ffffff', fontSize: '1rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer' }}>
                            GREAT!
                        </Button>
                    </div>
                </div>
            )}

            {/* LEVEL UP MODAL */}
            {showLevelModal && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}>
                    <div style={{ maxWidth: '400px', width: '100%', backgroundColor: '#ffffff', borderRadius: '2rem', padding: '2.5rem', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(59,130,246,0.25)' }}>
                        <div style={{ width: '80px', height: '80px', backgroundColor: '#dbeafe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                            <FaStar style={{ fontSize: '2.5rem', color: '#3b82f6' }} />
                        </div>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.5rem' }}>LEVEL UP!</h2>
                        <p style={{ color: '#3b82f6', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem' }}>Legendary Progress!</p>
                        <div style={{ backgroundColor: '#f8fafc', borderRadius: '1.5rem', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid #f1f5f9' }}>
                            <p style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>You've reached</p>
                            <h3 style={{ fontSize: '3rem', fontWeight: 950, color: '#0f172a' }}>LEVEL {levelInfo?.new}</h3>
                            {levelInfo?.old && <p style={{ marginTop: '0.5rem', fontSize: '11px', color: '#94a3b8', fontWeight: 700, fontStyle: 'italic' }}>Advanced from Level {levelInfo.old}</p>}
                        </div>
                        <Button onClick={() => setShowLevelModal(false)} style={{ width: '100%', padding: '1.25rem', borderRadius: '1.25rem', backgroundColor: '#3b82f6', border: 'none', color: '#ffffff', fontSize: '1rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer' }}>
                            FANTASTIC!
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

function LevelCardWhite({ points }: { points: number }) {
    const [isOpen, setIsOpen] = useState(false);
    const levels = Array.from({ length: 11 }, (_, i) => ({ level: i + 1, minPoints: i * 50 }));
    const currentLevel = Math.min(Math.floor(points / 50) + 1, 11);
    const nextLevel = currentLevel < 11 ? currentLevel + 1 : null;
    const pointsInCurrentLevel = points % 50;
    const progress = currentLevel === 11 ? 100 : (pointsInCurrentLevel / 50) * 100;

    return (
        <div style={{ position: 'relative' }}>
            <div onClick={() => setIsOpen(!isOpen)} style={{ backgroundColor: '#ffffff', border: '1px solid #f1f5f9', borderRadius: '1rem', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
                <div style={{ width: '28px', height: '28px', backgroundColor: '#eff6ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FaStar style={{ color: '#3b82f6', fontSize: '0.85rem' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '9px', fontWeight: 800, color: '#f97316', textTransform: 'uppercase' }}>Level</span>
                    <span style={{ fontSize: '13px', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {currentLevel} {isOpen ? <FaChevronUp size={8} /> : <FaChevronDown size={8} />}
                    </span>
                </div>
            </div>
            {isOpen && (
                <div style={{ position: 'absolute', top: '110%', right: 0, width: '260px', backgroundColor: '#ffffff', borderRadius: '1.5rem', padding: '1.25rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', zIndex: 200, border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.75rem' }}>
                        <div>
                            <div style={{ fontWeight: 900, fontSize: '1rem', color: '#0f172a' }}>Level {currentLevel}</div>
                            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>{currentLevel === 11 ? 'Max reached' : `${50 - pointsInCurrentLevel} pts left`}</div>
                        </div>
                        <span style={{ fontSize: '1rem', fontWeight: 900, color: '#3b82f6' }}>{Math.round(progress)}%</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden', marginBottom: '1rem' }}>
                        <div style={{ height: '100%', width: `${progress}%`, backgroundColor: '#3b82f6', borderRadius: '4px' }} />
                    </div>
                    <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {levels.map(l => (
                            <div key={l.level} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '10px', backgroundColor: l.level === currentLevel ? '#eff6ff' : 'transparent', opacity: l.level > currentLevel ? 0.4 : 1 }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: l.level === currentLevel ? '#1d4ed8' : '#475569' }}>Level {l.level}</span>
                                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8' }}>{l.minPoints} PTS</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function MobileLevelBadge({ points }: { points: number }) {
    const [isOpen, setIsOpen] = useState(false);
    const currentLevel = Math.min(Math.floor(points / 50) + 1, 11);
    const nextLevel = currentLevel < 11 ? currentLevel + 1 : null;
    const pointsInCurrentLevel = points % 50;
    const progress = currentLevel === 11 ? 100 : (pointsInCurrentLevel / 50) * 100;

    return (
        <div style={{ position: 'relative' }}>
            <div onClick={() => setIsOpen(!isOpen)} style={{ backgroundColor: '#eff6ff', border: '1px solid #dbeafe', borderRadius: '10px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 800, color: '#1d4ed8', cursor: 'pointer' }}>
                <FaStar size={10} /> Lvl {currentLevel} {isOpen ? <FaChevronUp size={8} /> : <FaChevronDown size={8} />}
            </div>
            {isOpen && (
                <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '85%', maxWidth: '300px', backgroundColor: '#fff', borderRadius: '2rem', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', zIndex: 1000, border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div>
                            <div style={{ fontWeight: 900, fontSize: '1.25rem', color: '#0f172a' }}>Level {currentLevel}</div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>{Math.round(progress)}% Progress</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8' }}><FaTimes /></button>
                    </div>
                    <div style={{ width: '100%', height: '12px', backgroundColor: '#f1f5f9', borderRadius: '6px', overflow: 'hidden', marginBottom: '1.5rem' }}>
                        <div style={{ height: '100%', width: `${progress}%`, backgroundColor: '#3b82f6', borderRadius: '6px' }} />
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600, textAlign: 'center' }}>
                        {currentLevel === 11 ? "You have reached the peak!" : `${50 - pointsInCurrentLevel} more points to reach Level ${nextLevel}`}
                    </p>
                    <button onClick={() => setIsOpen(false)} style={{ width: '100%', marginTop: '1.5rem', padding: '0.75rem', borderRadius: '1rem', backgroundColor: '#f1f5f9', border: 'none', color: '#475569', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase' }}>Close</button>
                </div>
            )}
            {isOpen && <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999 }} onClick={() => setIsOpen(false)} />}
        </div>
    );
}
