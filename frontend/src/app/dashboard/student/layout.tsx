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
    FaAward,
    FaBookOpen,
    FaBell,
    FaCompass,
    FaUserPlus,
    FaChevronDown,
    FaChevronUp,
    FaChevronLeft,
    FaChevronRight,
    FaStar,
    FaUser
} from 'react-icons/fa';

import Link from 'next/link';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // Daily Points Modal State
    const [showPointsModal, setShowPointsModal] = useState(false);
    const [pointsAwarded, setPointsAwarded] = useState(0);
    const [streakInfo, setStreakInfo] = useState('');

    // Level Up Modal State
    const [showLevelModal, setShowLevelModal] = useState(false);
    const [levelInfo, setLevelInfo] = useState<any>(null);

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

        return () => window.removeEventListener('messages-read', handleMessagesRead);
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
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
                <div style={{ width: '3rem', height: '3rem', border: '4px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%' }} className="animate-spin" />
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#ffffff', color: '#0f172a', overflowX: 'hidden' }}>
            {/* MOBILE HEADER */}
            <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white shadow-sm">
                <h1 style={{ color: '#f97316', fontWeight: 900, fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '-0.03em' }}>QR Quiz Platform</h1>
                <button onClick={() => setSidebarOpen(true)} className="p-2" style={{ color: '#0f172a' }}>
                    <FaBars />
                </button>
            </header>

            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/60 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div className={`lg:grid ${isSidebarCollapsed ? 'lg:grid-cols-[80px_1fr]' : 'lg:grid-cols-[300px_1fr]'} lg:gap-12 xl:gap-20 transition-all duration-300 flex flex-col min-h-screen`}>
                {/* SIDEBAR */}
                <aside
                    className={`
                        fixed lg:static top-0 left-0 z-50
                        h-screen w-[300px] ${isSidebarCollapsed ? 'lg:w-[80px]' : 'lg:w-[300px]'}
                        border-r
                        ${isSidebarCollapsed ? 'px-4' : 'px-8'} py-12 flex flex-col transition-all duration-300
                        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                        overflow-y-auto overflow-x-hidden
                    `}


                    style={{
                        background: '#f97316',
                        backdropFilter: 'blur(var(--blur))',
                        borderColor: 'rgba(255,255,255,0.1)'
                    }}
                >
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden absolute top-6 right-6">
                        <FaTimes />
                    </button>

                    {/* Branding Section - Stylized Greeting */}
                    <div className={`mb-14 mt-10 px-6 flex flex-col items-center text-center relative group ${isSidebarCollapsed ? 'hidden lg:block lg:opacity-0 lg:h-0 overflow-hidden' : ''} transition-all duration-300`}>
                        <div className="w-24 h-24 rounded-full bg-slate-800/50 border-2 border-orange-500/30 flex items-center justify-center mb-6 overflow-hidden shadow-2xl group-hover:border-orange-500 transition-all duration-500 relative" style={{marginTop:20}}>
                            <div className="absolute inset-0 bg-orange-500/5 blur-xl group-hover:bg-orange-500/10 transition-all duration-500" />
                            <FaUser className="text-4xl text-slate-400 group-hover:text-orange-500 transition-colors relative z-10" />
                        </div>
                        <h2 className="text-xl font-black tracking-tighter uppercase leading-tight px-4 w-full" style={{marginBottom:35}}>
                            <span className="text-white block mb-1" style={{marginTop:10}}>WELCOME,</span> 
                            <span className="text-white break-all" >{user?.username}</span>
                        </h2>


                    </div>

                    {isSidebarCollapsed && (
                        <div className="hidden lg:flex items-center justify-center mb-10 pt-6">
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                                <span className="text-white font-black">S</span>
                            </div>
                        </div>
                    )}

                    <div className="h-14 lg:h-16" />

                    <nav className="flex flex-col gap-5 flex-1 w-full">
                        <Link href="/dashboard/student/progress" onClick={() => setSidebarOpen(false)}>
                            <Button
                                variant="ghost"
                                style={{ 
                                    background: isActive('/dashboard/student/progress') ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                                    border: 'none'
                                }}
                                className={`${isSidebarCollapsed ? 'justify-center px-0' : 'justify-start px-4'} gap-4 h-12 rounded-xl text-lg font-bold transition-all w-full ${isActive('/dashboard/student/progress') ? 'text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                                title={isSidebarCollapsed ? "Manage Topics" : ""}
                            >
                                <FaHistory className={isActive('/dashboard/student/progress') ? 'text-white' : 'text-white/70 group-hover:text-white'} /> 
                                {!isSidebarCollapsed && <span className="text-white">Manage Topics</span>}
                            </Button>
                        </Link>


                        <Link href="/dashboard/student/explore" onClick={() => setSidebarOpen(false)}>
                            <Button
                                variant="ghost"
                                style={{ 
                                    background: isActive('/dashboard/student/explore') ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                                    border: 'none'
                                }}
                                className={`${isSidebarCollapsed ? 'justify-center px-0' : 'justify-start px-4'} gap-4 h-12 rounded-xl text-lg font-bold transition-all w-full ${isActive('/dashboard/student/explore') ? 'text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                                title={isSidebarCollapsed ? "Explore Quiz" : ""}
                            >
                                <FaCompass className={isActive('/dashboard/student/explore') ? 'text-white' : 'text-white/70 group-hover:text-white'} /> 
                                {!isSidebarCollapsed && <span className="text-white">Explore Quiz</span>}
                            </Button>
                        </Link>



                        <Link href="/dashboard/student/leaderboard" onClick={() => setSidebarOpen(false)}>
                            <Button
                                variant="ghost"
                                style={{ 
                                    background: isActive('/dashboard/student/leaderboard') ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                                    border: 'none'
                                }}
                                className={`${isSidebarCollapsed ? 'justify-center px-0' : 'justify-start px-4'} gap-4 h-12 rounded-xl text-lg font-bold transition-all w-full ${isActive('/dashboard/student/leaderboard') ? 'text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                                title={isSidebarCollapsed ? "Leaderboard" : ""}
                            >
                                <FaTrophy className={isActive('/dashboard/student/leaderboard') ? 'text-white' : 'text-white/70 group-hover:text-white'} /> 
                                {!isSidebarCollapsed && <span className="text-white">Leaderboard</span>}
                            </Button>
                        </Link>



                        <Link href="/dashboard/student/referral" onClick={() => setSidebarOpen(false)}>
                            <Button
                                variant="ghost"
                                style={{ 
                                    background: isActive('/dashboard/student/referral') ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                                    border: 'none'
                                }}
                                className={`${isSidebarCollapsed ? 'justify-center px-0' : 'justify-start px-4'} gap-4 h-12 rounded-xl text-lg font-bold transition-all w-full ${isActive('/dashboard/student/referral') ? 'text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                                title={isSidebarCollapsed ? "Referral" : ""}
                            >
                                <FaUserPlus className={isActive('/dashboard/student/referral') ? 'text-white' : 'text-white/70 group-hover:text-white'} /> 
                                {!isSidebarCollapsed && <span className="text-white">Referral</span>}
                            </Button>
                        </Link>



                        <Link href="/dashboard/student/badges" onClick={() => setSidebarOpen(false)}>
                            <Button
                                variant="ghost"
                                style={{ 
                                    background: (isActive('/dashboard/student/badges') || isActive('/dashboard/student/challenges')) ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                                    border: 'none'
                                }}
                                className={`${isSidebarCollapsed ? 'justify-center px-0' : 'justify-start px-4'} gap-4 h-12 rounded-xl text-lg font-bold transition-all w-full ${(isActive('/dashboard/student/badges') || isActive('/dashboard/student/challenges')) ? 'text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                                title={isSidebarCollapsed ? "Badge & Challenges" : ""}
                            >
                                <FaAward className={(isActive('/dashboard/student/badges') || isActive('/dashboard/student/challenges')) ? 'text-white' : 'text-white/70 group-hover:text-white'} /> 
                                {!isSidebarCollapsed && <span className="text-white">Badge & Challenges</span>}
                            </Button>
                        </Link>



                        <Link href="/dashboard/student/certificates" onClick={() => setSidebarOpen(false)}>
                            <Button
                                variant="ghost"
                                style={{ 
                                    background: isActive('/dashboard/student/certificates') ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                                    border: 'none'
                                }}
                                className={`${isSidebarCollapsed ? 'justify-center px-0' : 'justify-start px-4'} gap-4 h-12 rounded-xl text-lg font-bold transition-all w-full ${isActive('/dashboard/student/certificates') ? 'text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                                title={isSidebarCollapsed ? "Certificates" : ""}
                            >
                                <FaGraduationCap className={isActive('/dashboard/student/certificates') ? 'text-white' : 'text-white/70 group-hover:text-white'} /> 
                                {!isSidebarCollapsed && <span className="text-white">Certificates</span>}
                            </Button>
                        </Link>



                        <Link href="/dashboard/student/materials" onClick={() => setSidebarOpen(false)}>
                            <Button
                                variant="ghost"
                                style={{ 
                                    background: isActive('/dashboard/student/materials') ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                                    border: 'none'
                                }}
                                className={`${isSidebarCollapsed ? 'justify-center px-0' : 'justify-start px-4'} gap-4 h-12 rounded-xl text-lg font-bold transition-all w-full ${isActive('/dashboard/student/materials') ? 'text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                                title={isSidebarCollapsed ? "Study Materials" : ""}
                            >
                                <FaBookOpen className={isActive('/dashboard/student/materials') ? 'text-white' : 'text-white/70 group-hover:text-white'} /> 
                                {!isSidebarCollapsed && <span className="text-white">Study Materials</span>}
                            </Button>
                        </Link>



                        <Link href="/dashboard/student/notifications" onClick={() => setSidebarOpen(false)}>
                            <Button
                                variant="ghost"
                                style={{ 
                                    background: isActive('/dashboard/student/notifications') ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                                    border: 'none'
                                }}
                                className={`${isSidebarCollapsed ? 'justify-center px-0' : 'justify-start px-4'} gap-4 h-12 rounded-xl text-lg font-bold transition-all relative w-full ${isActive('/dashboard/student/notifications') ? 'text-white' : 'text-white group-hover:text-white'}`}
                                title={isSidebarCollapsed ? "Notifications" : ""}
                            >
                                <div className="relative">
                                    <FaBell className="text-white" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                                            {unreadCount}
                                        </span>
                                    )}
                                </div>
                                {!isSidebarCollapsed && <span className="text-white font-bold">Notifications</span>}
                            </Button>
                        </Link>


                    </nav>

                    <div className="mt-auto pt-8 border-t border-white/10 flex flex-col gap-2">

                        <Button
                            variant="ghost"
                            className={`w-full ${isSidebarCollapsed ? 'justify-center px-0' : 'justify-start px-4'} gap-3 h-12 text-white/70 hover:text-white hover:bg-white/10 border-none hidden lg:flex rounded-xl`}
                            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                            title={isSidebarCollapsed ? "Expand Menu" : "Collapse Menu"}
                        >
                            {isSidebarCollapsed ? <FaChevronRight /> : <><FaChevronLeft /> Collapse Menu</>}
                        </Button>

                        <Button
                            variant="ghost"
                            className={`w-full ${isSidebarCollapsed ? 'justify-center px-0' : 'justify-start px-4'} gap-3 h-12 text-white/70 hover:text-red-200 hover:bg-white/10 border-none rounded-xl`}
                            title={isSidebarCollapsed ? "Sign Out" : ""}
                            onClick={handleLogout}
                        >
                            <FaSignOutAlt /> {!isSidebarCollapsed && "Sign Out"}
                        </Button>
                    </div>
                </aside>

                {/* MAIN CONTENT */}
                <main className="flex-1 overflow-y-auto" style={{ display: 'flex', flexDirection: 'column' }}>

                    {/* DESKTOP HEADER BAR */}
                    <div className="hidden lg:flex items-center justify-between px-10 border-b border-slate-200 bg-white shadow-sm" style={{ height: '80px', flexShrink: 0 }}>
                        <span style={{ color: '#f97316', fontWeight: 900, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.15em' }}>QR Quiz Platform</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {/* Level Card */}
                            <LevelCardWhite points={user?.points || 0} />
                            {/* Streak */}
                            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                                <span style={{ fontSize: '1.3rem' }}>🔥</span>
                                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                                    <span style={{ fontSize: '0.55rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '3px' }}>Streak</span>
                                    <span style={{ fontSize: '1rem', fontWeight: 900, color: '#0f172a' }}>{user?.loginStreak || 0} <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>days</span></span>
                                </div>
                            </div>
                            {/* Total Points */}
                            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                                <FaTrophy style={{ color: '#f59e0b', fontSize: '1.2rem' }} />
                                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                                    <span style={{ fontSize: '0.55rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '3px' }}>Total Points</span>
                                    <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a' }}>{user?.points || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* MOBILE STATS BAR */}
                    <div className="lg:hidden flex items-center justify-center gap-3 px-4 py-3 border-b border-slate-200 bg-white" style={{ flexWrap: 'wrap' }}>
                        <MobileLevelBadge points={user?.points || 0} />
                        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                            <span style={{ fontSize: '1rem' }}>🔥</span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#0f172a' }}>{user?.loginStreak || 0} <span style={{ color: '#64748b', fontWeight: 600 }}>days</span></span>
                        </div>
                        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                            <FaTrophy style={{ color: '#f59e0b', fontSize: '0.9rem' }} />
                            <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#0f172a' }}>{user?.points || 0} <span style={{ color: '#64748b', fontWeight: 600 }}>pts</span></span>
                        </div>
                    </div>

                    <div className="max-w-[1400px] w-full mx-auto px-6 sm:px-10 lg:px-16" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
                        {children}
                    </div>
                </main>
            </div>

            {/* DAILY POINTS MODAL */}
            {showPointsModal && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl animate-fade-in">
                    <div className="max-w-md w-full bg-slate-950 border border-white/10 rounded-[3rem] p-12 text-center shadow-[0_0_100px_rgba(234,179,8,0.2)] relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                        <div className="relative z-10">
                            <div className="w-32 h-32 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-10 border border-yellow-500/30 animate-bounce shadow-[0_0_40px_rgba(234,179,8,0.3)]">
                                <FaTrophy className="text-6xl text-yellow-500" />
                            </div>

                            <h2 className="text-5xl font-black text-white mb-4 tracking-tighter">CONGRATULATIONS!</h2>
                            <p className="text-yellow-500 font-black text-xl uppercase tracking-[0.2em] mb-8">Awesome!</p>

                            <div className="bg-white/5 rounded-3xl p-8 mb-10 border border-white/5">
                                <p className="text-slate-400 font-bold mb-2 uppercase text-xs tracking-widest">You've Earned</p>
                                <h3 className="text-6xl font-black text-white">+{pointsAwarded} <span className="text-2xl text-yellow-500 font-black">PTS</span></h3>
                                {streakInfo && (
                                    <p className="mt-4 text-emerald-400 font-bold italic text-sm">{streakInfo}</p>
                                )}
                            </div>

                            <Button
                                onClick={() => setShowPointsModal(false)}
                                className="w-full py-6 rounded-[2rem] bg-yellow-500 hover:bg-yellow-400 text-black text-xl font-black uppercase tracking-widest shadow-2xl shadow-yellow-500/20 active:scale-95 transition-all"
                            >
                                GREAT!
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            {/* LEVEL UP MODAL */}
            {showLevelModal && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl animate-fade-in">
                    <div className="max-w-md w-full bg-slate-950 border border-white/10 rounded-[3rem] p-12 text-center shadow-[0_0_100px_rgba(59,130,246,0.2)] relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                        
                        <div className="relative z-10">
                            <div className="w-32 h-32 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-10 border border-blue-500/30 animate-bounce shadow-[0_0_40px_rgba(59,130,246,0.3)]">
                                <FaStar className="text-6xl text-blue-500" />
                            </div>

                            <h2 className="text-5xl font-black text-white mb-4 tracking-tighter">LEVEL UP!</h2>
                            <p className="text-blue-500 font-black text-xl uppercase tracking-[0.2em] mb-8">Legendary Progress!</p>

                            <div className="bg-white/5 rounded-3xl p-8 mb-10 border border-white/5">
                                <p className="text-slate-400 font-bold mb-2 uppercase text-xs tracking-widest">You've reached</p>
                                <h3 className="text-6xl font-black text-white">LEVEL {levelInfo?.new}</h3>
                                {levelInfo?.old && (
                                    <p className="mt-4 text-slate-500 font-bold italic text-sm">Advanced from Level {levelInfo.old}</p>
                                )}
                            </div>

                            <Button
                                onClick={() => setShowLevelModal(false)}
                                className="w-full py-6 rounded-[2rem] bg-blue-600 hover:bg-blue-500 text-white text-xl font-black uppercase tracking-widest shadow-2xl shadow-blue-500/20 active:scale-95 transition-all"
                            >
                                FANTASTIC!
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── White-themed Level Card for desktop header ──────────────────────────────
function LevelCardWhite({ points }: { points: number }) {
    const [isOpen, setIsOpen] = React.useState(false);

    const levels = Array.from({ length: 11 }, (_, i) => ({
        level: i + 1,
        minPoints: i * 50
    }));

    const currentLevel = Math.min(Math.floor(points / 50) + 1, 11);
    const nextLevel = currentLevel < 11 ? currentLevel + 1 : null;
    const pointsInCurrentLevel = points % 50;
    const progress = currentLevel === 11 ? 100 : (pointsInCurrentLevel / 50) * 100;

    return (
        <div style={{ position: 'relative' }}>
            {/* Trigger */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '1rem',
                    padding: '8px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                    cursor: 'pointer',
                    userSelect: 'none'
                }}
            >
                <div style={{ width: '28px', height: '28px', background: '#eff6ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FaStar style={{ color: '#3b82f6', fontSize: '0.85rem' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                    <span style={{ fontSize: '0.55rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '3px' }}>Level</span>
                    <span style={{ fontSize: '1rem', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {currentLevel}
                        {isOpen
                            ? <FaChevronUp style={{ fontSize: '0.6rem', color: '#64748b' }} />
                            : <FaChevronDown style={{ fontSize: '0.6rem', color: '#64748b' }} />
                        }
                    </span>
                </div>
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '280px',
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '1.25rem',
                    padding: '1.25rem',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
                    zIndex: 200
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.75rem' }}>
                        <div>
                            <div style={{ fontWeight: 900, fontSize: '1rem', color: '#0f172a' }}>Level {currentLevel}</div>
                            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                {currentLevel === 11 ? 'Max level reached!' : `${50 - pointsInCurrentLevel} pts to Level ${nextLevel}`}
                            </div>
                        </div>
                        <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#3b82f6' }}>{Math.round(progress)}%</span>
                    </div>
                    {/* Progress Bar */}
                    <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden', marginBottom: '1rem' }}>
                        <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #2563eb, #38bdf8)', borderRadius: '99px', transition: 'width 0.8s ease' }} />
                    </div>
                    {/* Levels list */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '200px', overflowY: 'auto' }}>
                        {levels.map((l) => (
                            <div key={l.level} style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '6px 10px',
                                borderRadius: '8px',
                                background: l.level === currentLevel ? '#eff6ff' : 'transparent',
                                border: l.level === currentLevel ? '1px solid #bfdbfe' : '1px solid transparent',
                                opacity: l.level > currentLevel ? 0.5 : 1
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: l.level <= currentLevel ? '#3b82f6' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {l.level <= currentLevel && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff' }} />}
                                    </div>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: l.level === currentLevel ? '#1d4ed8' : '#475569' }}>Level {l.level}</span>
                                </div>
                                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8' }}>{l.minPoints} PTS</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Interactive level badge for mobile stats bar ─────────────────────────────
function MobileLevelBadge({ points }: { points: number }) {
    const [isOpen, setIsOpen] = React.useState(false);

    const levels = Array.from({ length: 11 }, (_, i) => ({
        level: i + 1,
        minPoints: i * 50
    }));

    const currentLevel = Math.min(Math.floor(points / 50) + 1, 11);
    const nextLevel = currentLevel < 11 ? currentLevel + 1 : null;
    const pointsInCurrentLevel = points % 50;
    const progress = currentLevel === 11 ? 100 : (pointsInCurrentLevel / 50) * 100;

    return (
        <div style={{ position: 'relative' }}>
            {/* Trigger */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '0.75rem',
                    padding: '6px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    userSelect: 'none'
                }}
            >
                <FaStar style={{ color: '#3b82f6', fontSize: '0.75rem' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#1d4ed8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Lvl {currentLevel}
                    {isOpen 
                        ? <FaChevronUp style={{ fontSize: '0.5rem', color: '#3b82f6' }} /> 
                        : <FaChevronDown style={{ fontSize: '0.5rem', color: '#3b82f6' }} />
                    }
                </span>
            </div>

            {/* Dropdown / Modal Overlay for Mobile */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div 
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[998]"
                    />
                    
                    {/* Centered Modal-style Dropdown */}
                    <div style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 'calc(100vw - 40px)',
                        maxWidth: '320px',
                        background: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '2rem',
                        padding: '2rem',
                        boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
                        zIndex: 999,
                        maxHeight: '80vh',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                            <div className="text-left">
                                <div style={{ fontWeight: 900, fontSize: '1.25rem', color: '#0f172a', marginBottom: '4px' }}>Level {currentLevel}</div>
                                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                    {currentLevel === 11 ? 'Max level reached!' : `${50 - pointsInCurrentLevel} points to Lvl ${nextLevel}`}
                                </div>
                            </div>
                            <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#3b82f6' }}>{Math.round(progress)}%</span>
                        </div>

                        {/* Progress Bar */}
                        <div style={{ width: '100%', height: '12px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden', marginBottom: '2rem', flexShrink: 0 }}>
                            <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #2563eb, #38bdf8)', borderRadius: '99px' }} />
                        </div>

                        {/* Title for levels list */}
                        <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1rem', flexShrink: 0 }} className="text-left">
                            All Levels
                        </div>

                        {/* Levels list with scrolling */}
                        <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '8px', 
                            overflowY: 'auto', 
                            paddingRight: '4px',
                            flex: 1
                        }}>
                            {levels.map((l) => (
                                <div key={l.level} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '12px 16px',
                                    borderRadius: '16px',
                                    background: l.level === currentLevel ? '#eff6ff' : '#f8fafc',
                                    border: l.level === currentLevel ? '1px solid #bfdbfe' : '1px solid #f1f5f9',
                                    opacity: l.level > currentLevel ? 0.5 : 1
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ 
                                            width: '18px', 
                                            height: '18px', 
                                            borderRadius: '50%', 
                                            background: l.level <= currentLevel ? '#3b82f6' : '#e2e8f0', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            boxShadow: l.level <= currentLevel ? '0 0 10px rgba(59,130,246,0.3)' : 'none'
                                        }}>
                                            {l.level <= currentLevel && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff' }} />}
                                        </div>
                                        <span style={{ fontSize: '1rem', fontWeight: 800, color: l.level === currentLevel ? '#1d4ed8' : '#334155' }}>Lvl {l.level}</span>
                                    </div>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: l.level === currentLevel ? '#1d4ed8' : '#94a3b8' }}>{l.minPoints} pts</span>
                                </div>
                            ))}
                        </div>

                        {/* Close Button for Better UX */}
                        <button 
                            onClick={() => setIsOpen(false)}
                            style={{
                                marginTop: '1.5rem',
                                padding: '12px',
                                background: '#f1f5f9',
                                border: 'none',
                                borderRadius: '1rem',
                                fontWeight: 900,
                                fontSize: '0.75rem',
                                color: '#475569',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                width: '100%',
                                flexShrink: 0
                            }}
                        >
                            Close
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
