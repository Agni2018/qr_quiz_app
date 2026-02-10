'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import Card from '@/components/Card';
import Button from '@/components/Button';
import ThemeToggle from '@/components/ThemeToggle';
import {
    FaGraduationCap,
    FaHistory,
    FaTrophy,
    FaSignOutAlt,
    FaBars,
    FaTimes,
    FaArrowRight,
    FaCheckCircle,
    FaPlus,
    FaAward,
    FaStar,
    FaBolt,
    FaUsers,
    FaDownload
} from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import CertificateTemplate from '@/components/CertificateTemplate';

export default function StudentDashboard() {
    const [attempts, setAttempts] = useState<any[]>([]);
    const [availableQuizzes, setAvailableQuizzes] = useState<any[]>([]);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeView, setActiveView] = useState<'progress' | 'available' | 'lb' | 'badges' | 'certificates'>('progress');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [leaderboard, setLeaderboard] = useState<any>(null);
    const [showDailyModal, setShowDailyModal] = useState(false);
    const [dailyReward, setDailyReward] = useState<{ points: number; streak: string | null }>({ points: 5, streak: null });
    const [earnedBadges, setEarnedBadges] = useState<any[]>([]);
    const [allBadges, setAllBadges] = useState<any[]>([]);
    const [badgesLoading, setBadgesLoading] = useState(false);
    const [showAvailableModal, setShowAvailableModal] = useState(false);
    const [certificates, setCertificates] = useState<any[]>([]);
    const [selectedCertificate, setSelectedCertificate] = useState<any>(null);
    const [showCertificateModal, setShowCertificateModal] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    const router = useRouter();

    useEffect(() => {
        const init = async () => {
            try {
                const statusRes = await api.get('/auth/status');
                setUser(statusRes.data.user);

                const [attemptsRes, quizzesRes, lbRes, certsRes] = await Promise.all([
                    api.get('/quiz/student-attempts'),
                    api.get('/topics'),
                    api.get('/analytics/global-leaderboard'),
                    api.get('/quiz/my-certificates')
                ]);

                setAttempts(attemptsRes.data);
                setAvailableQuizzes(quizzesRes.data.filter((q: any) => q.status === 'active'));
                setLeaderboard(lbRes.data);
                setCertificates(certsRes.data);

                // Check for daily login reward
                const dailyPointsFlag = localStorage.getItem('dailyPointsAwarded');
                if (dailyPointsFlag === 'true') {
                    const pointsAwarded = parseInt(localStorage.getItem('pointsAwarded') || '5', 10);
                    const streakStatus = localStorage.getItem('streakStatus') || null;

                    setDailyReward({
                        points: pointsAwarded,
                        streak: streakStatus
                    });
                    setShowDailyModal(true);

                    // Clear the flags so modal doesn't show again this session
                    localStorage.removeItem('dailyPointsAwarded');
                    localStorage.removeItem('pointsAwarded');
                    localStorage.removeItem('streakStatus');
                }
            } catch (err) {
                console.error(err);
                router.replace('/');
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [router]);

    useEffect(() => {
        if (activeView === 'badges' && user) {
            fetchBadgesData();
        }
    }, [activeView, user]);

    const fetchBadgesData = async () => {
        setBadgesLoading(true);
        try {
            const [earnedRes, allRes] = await Promise.all([
                api.get('/badges/my-badges'),
                api.get('/badges')
            ]);
            setEarnedBadges(earnedRes.data);
            setAllBadges(allRes.data);
        } catch (err) {
            console.error('Error fetching badges:', err);
        } finally {
            setBadgesLoading(false);
        }
    };

    const getBadgeIcon = (iconName: string) => {
        switch (iconName) {
            case 'FaAward': return <FaAward />;
            case 'FaTrophy': return <FaTrophy />;
            case 'FaStar': return <FaStar />;
            case 'FaBolt': return <FaBolt />;
            case 'FaUsers': return <FaUsers />;
            default: return <FaAward />;
        }
    };

    const availableBadges = allBadges.filter(b => !earnedBadges.some(eb => eb._id === b._id));

    const handleDownloadCertificate = async () => {
        if (!selectedCertificate) return;

        setIsDownloading(true);
        // Small delay to ensure the modal is fully rendered if it just opened
        setTimeout(async () => {
            const element = document.getElementById('certificate-download-area');
            if (!element) {
                console.error('Certificate element not found');
                setIsDownloading(false);
                alert('Could not find certificate preview. Please try again.');
                return;
            }
            await performDownload(element);
        }, 300);
    };

    const performDownload = async (element: HTMLElement) => {
        try {
            const html2canvas = (await import('html2canvas')).default;
            const jsPDF = (await import('jspdf')).default;

            const canvas = await html2canvas(element, {
                scale: 3, // Even higher resolution for ultra-sharp text
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                windowWidth: 1000,
                windowHeight: 750,
                onclone: (clonedDoc) => {
                    // Ensure the element is visible in the clone
                    const clonedElement = clonedDoc.getElementById('certificate-download-area');
                    if (clonedElement) {
                        clonedElement.style.display = 'block';
                        clonedElement.style.visibility = 'visible';
                        clonedElement.style.transform = 'none';
                    }
                }
            });

            const imgData = canvas.toDataURL('image/png', 1.0);
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });

            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save(`Certificate_${selectedCertificate.topicId?.name || 'Quiz'}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (err) {
            console.error('Logout error:', err);
        }
        localStorage.clear();
        // Force a full page reload to clear memory and BFCache
        window.location.href = '/';
    };

    const handleStartQuizByDirectLink = async (quizId: string) => {
        try {
            // Logged in students can start directly
            const res = await api.post('/quiz/start', {
                topicId: quizId,
                name: user.username,
                email: user.email,
                phone: 'N/A' // Placeholder for logged-in users
            });

            if (res.data.canAttempt) {
                localStorage.setItem('quizUser', JSON.stringify({
                    name: user.username,
                    email: user.email,
                    phone: 'N/A'
                }));
                router.push(`/quiz/${quizId}/play`);
            }
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to start quiz');
        }
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

                    <div className="mb-2 pl-2">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-[3px] bg-gradient-to-r from-primary to-secondary rounded-full" />
                            <p className="text-slate-500 text-[0.7rem] font-black uppercase tracking-[0.3em] opacity-60">Student Portal</p>
                        </div>
                        <div className="text-3xl font-light text-slate-400 mb-2">Welcome,</div>
                        <div className="text-4xl font-black bg-gradient-to-r from-white via-primary/80 to-primary bg-clip-text text-transparent transform -tracking-wide leading-tight">
                            {user?.username}
                        </div>
                    </div>

                    <div className="h-14 lg:h-16" />

                    <nav className="flex flex-col gap-5 flex-1 w-full">
                        <Button
                            variant={activeView === 'progress' ? 'secondary' : 'ghost'}
                            className={`justify-start gap-4 h-12 rounded-xl text-lg font-medium transition-all w-full ${activeView === 'progress' ? 'bg-primary/10 text-primary border-none shadow-none' : 'text-slate-400 hover:text-primary hover:bg-primary/5 border-none'}`}
                            onClick={() => { setActiveView('progress'); setSidebarOpen(false); }}
                        >
                            <FaHistory className={activeView === 'progress' ? 'text-primary' : 'text-slate-400'} /> Manage Topics
                        </Button>
                        <Button
                            variant={activeView === 'lb' ? 'secondary' : 'ghost'}
                            className={`justify-start gap-4 h-12 rounded-xl text-lg font-medium transition-all ${activeView === 'lb' ? 'bg-yellow-500/10 text-yellow-600 border-none shadow-none' : 'text-slate-400 hover:text-yellow-600 hover:bg-yellow-500/5 border-none'}`}
                            onClick={() => { setActiveView('lb'); setSidebarOpen(false); }}
                        >
                            <FaTrophy className={activeView === 'lb' ? 'text-yellow-600' : 'text-slate-400'} /> Leaderboard
                        </Button>
                        <Button
                            variant={activeView === 'badges' ? 'secondary' : 'ghost'}
                            className={`justify-start gap-4 h-12 rounded-xl text-lg font-medium transition-all ${activeView === 'badges' ? 'bg-purple-500/10 text-purple-600 border-none shadow-none' : 'text-slate-400 hover:text-purple-600 hover:bg-purple-500/5 border-none'}`}
                            onClick={() => { setActiveView('badges'); setSidebarOpen(false); }}
                        >
                            <FaAward className={activeView === 'badges' ? 'text-purple-600' : 'text-slate-400'} /> My Badges
                        </Button>
                        <Button
                            variant={activeView === 'certificates' ? 'secondary' : 'ghost'}
                            className={`justify-start gap-4 h-12 rounded-xl text-lg font-medium transition-all ${activeView === 'certificates' ? 'bg-indigo-500/10 text-indigo-600 border-none shadow-none' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-500/5 border-none'}`}
                            onClick={() => { setActiveView('certificates'); setSidebarOpen(false); }}
                        >
                            <FaGraduationCap className={activeView === 'certificates' ? 'text-indigo-600' : 'text-slate-400'} /> Certificates
                        </Button>
                    </nav>

                    <div className="mt-8 pt-8 border-t border-slate-200/10 dark:border-white/5 flex flex-col gap-4">
                        <Button
                            variant="ghost"
                            className="justify-start gap-3 h-12 text-slate-400 hover:text-red-500 hover:bg-red-500/5 border-none rounded-xl"
                            onClick={handleLogout}
                        >
                            <FaSignOutAlt /> Sign Out
                        </Button>
                    </div>
                </aside>

                {/* MAIN CONTENT */}
                <main className="flex-1 p-8 lg:p-14 xl:py-24 overflow-y-auto">
                    <div className="max-w-[1400px] mx-auto lg:pr-10 xl:pr-20">
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

                        {/* SECTION HEADING */}
                        <div className="flex items-center gap-8 mb-32 group">
                            <div style={{
                                width: '5rem',
                                height: '5rem',
                                borderRadius: '1.5rem',
                                background: activeView === 'progress' ? 'linear-gradient(135deg, #3b82f6, #10b981)' :
                                    activeView === 'available' ? 'linear-gradient(135deg, #8b5cf6, #6366f1)' :
                                        activeView === 'lb' ? 'linear-gradient(135deg, #f59e0b, #f97316)' :
                                            activeView === 'certificates' ? 'linear-gradient(135deg, #6366f1, #a855f7)' :
                                                'linear-gradient(135deg, #ec4899, #f43f5e)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '2.25rem',
                                boxShadow: activeView === 'progress' ? '0 10px 40px rgba(59, 130, 246, 0.4)' :
                                    activeView === 'available' ? '0 10px 40px rgba(139, 92, 246, 0.4)' :
                                        activeView === 'lb' ? '0 10px 40px rgba(245, 158, 11, 0.4)' :
                                            activeView === 'certificates' ? '0 10px 40px rgba(99, 102, 241, 0.4)' :
                                                '0 10px 40px rgba(236, 72, 153, 0.4)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                transform: 'rotate(-3deg)'
                            }} className="group-hover:rotate-0 transition-transform duration-500">
                                {activeView === 'progress' ? '📝' :
                                    activeView === 'available' ? '💡' :
                                        activeView === 'lb' ? '🏅' :
                                            activeView === 'certificates' ? '📜' : '🏆'}
                            </div>
                            <div className="flex flex-col">
                                <h2
                                    className="text-7xl font-black tracking-tighter"
                                    style={{
                                        backgroundImage: activeView === 'progress' ? 'linear-gradient(to right, #3b82f6, #10b981)' :
                                            activeView === 'available' ? 'linear-gradient(to right, #8b5cf6, #6366f1)' :
                                                activeView === 'lb' ? 'linear-gradient(to right, #f59e0b, #f97316)' :
                                                    activeView === 'certificates' ? 'linear-gradient(to right, #6366f1, #a855f7)' :
                                                        'linear-gradient(to right, #ec4899, #f43f5e)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                    }}
                                >
                                    {activeView === 'progress' ? 'Manage Topics' :
                                        activeView === 'available' ? 'Explore Topics' :
                                            activeView === 'lb' ? 'Leaderboard' :
                                                activeView === 'certificates' ? 'Certificates' : 'My Badges'}
                                </h2>
                                <div className="h-2 w-32 rounded-full mt-2 opacity-40 bg-gradient-to-r" style={{
                                    backgroundImage: activeView === 'progress' ? 'linear-gradient(to right, #3b82f6, transparent)' :
                                        activeView === 'available' ? 'linear-gradient(to right, #8b5cf6, transparent)' :
                                            activeView === 'lb' ? 'linear-gradient(to right, #f59e0b, transparent)' :
                                                activeView === 'certificates' ? 'linear-gradient(to right, #6366f1, transparent)' :
                                                    'linear-gradient(to right, #ec4899, transparent)'
                                }} />
                            </div>
                        </div>

                        {/* PROGRESS VIEW */}
                        {activeView === 'progress' && (
                            <div className="animate-fade-in mb-24">
                                <div className="h-20" /> {/* Explicit Spacer */}
                                {attempts.length === 0 ? (
                                    <Card className="p-20 text-center bg-slate-950/40 border-dashed border-2 border-white/5 rounded-[40px]">
                                        <div className="w-24 h-24 bg-slate-900 rounded-[2rem] flex items-center justify-center mx-auto mb-10 text-5xl shadow-inner shadow-white/5">📝</div>
                                        <h3 className="text-4xl font-black mb-4">No topics yet</h3>
                                        <p className="text-slate-500 mb-12 text-xl max-w-md mx-auto leading-relaxed">Start your academic journey by exploring new quiz topics!</p>
                                        <Button onClick={() => setActiveView('available')} className="px-16 py-6 rounded-[2rem] text-xl font-black bg-primary shadow-xl shadow-primary/20">Discover Topics</Button>
                                    </Card>
                                ) : (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-10">
                                        {attempts.map((attempt) => (
                                            <Card key={attempt._id} className="p-10 group hover:-translate-y-3 transition-all duration-500 border-white/5 bg-slate-950/40 hover:bg-slate-900/60 rounded-[2.5rem] flex flex-col h-full shadow-2xl">
                                                <div className="flex justify-between items-start mb-8">
                                                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary text-2xl border border-primary/20 group-hover:scale-110 transition-transform">
                                                        <FaCheckCircle />
                                                    </div>
                                                    <span className="text-[0.7rem] font-black uppercase tracking-widest text-slate-400 bg-white/5 py-2 px-5 rounded-xl">
                                                        {new Date(attempt.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                </div>
                                                <h3 className="text-2xl font-black mb-1 group-hover:text-primary transition-colors">
                                                    {attempt.topicId?.name}
                                                </h3>
                                                <div className="flex items-center gap-2 mb-6">
                                                    <span className="text-xs font-black uppercase tracking-widest text-slate-500">Global Rank</span>
                                                    <span className={`text-lg font-black ${attempt.rank <= 3 ? 'text-yellow-500' : 'text-primary'}`}>
                                                        #{attempt.rank || '-'}
                                                    </span>
                                                </div>
                                                <p className="text-slate-500 text-lg mb-10 line-clamp-2 leading-relaxed flex-1">{attempt.topicId?.description}</p>

                                                <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
                                                    <div className="flex flex-col">
                                                        <span className="text-slate-500 text-[0.65rem] font-black uppercase tracking-widest leading-none mb-1">Performance</span>
                                                        <span className="text-2xl font-black text-white">{attempt.score} <span className="text-sm text-slate-400 font-medium ml-1">pts</span></span>
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-emerald-500 text-[0.65rem] font-black uppercase tracking-widest leading-none mb-1">Status</span>
                                                        <span className="text-lg font-black text-emerald-400">+1 Point Earned</span>
                                                    </div>
                                                </div>
                                                <Link href={`/quiz/${attempt.topicId?._id}/result?attemptId=${attempt._id}`}>
                                                    <Button variant="secondary" className="px-6 py-3 rounded-xl font-black text-sm bg-primary hover:scale-105 transition-all shadow-lg shadow-primary/20 mt-6">
                                                        View Details →
                                                    </Button>
                                                </Link>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* CERTIFICATES SECTION */}
                        {activeView === 'certificates' && (
                            <div className="animate-fade-in mb-24">
                                <div className="h-10" />
                                {certificates.length === 0 ? (
                                    <Card className="p-20 text-center bg-slate-950/40 border-dashed border-2 border-white/5 rounded-[40px]">
                                        <div className="w-24 h-24 bg-slate-900 rounded-[2rem] flex items-center justify-center mx-auto mb-10 text-5xl shadow-inner shadow-white/5">📜</div>
                                        <h3 className="text-4xl font-black mb-4">No certificates earned</h3>
                                        <p className="text-slate-500 mb-12 text-xl max-w-md mx-auto leading-relaxed">Complete quiz topics with at least one correct answer to earn yours!</p>
                                        <Button onClick={() => setActiveView('available')} className="px-16 py-6 rounded-[2rem] text-xl font-black bg-primary shadow-xl shadow-primary/20">Start a Quiz</Button>
                                    </Card>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {certificates.map((cert) => (
                                            <Card key={cert._id} className="p-8 border-white/5 bg-slate-950/40 hover:bg-slate-900/60 rounded-[2rem] flex flex-col h-full shadow-2xl transition-all group">
                                                <div className="flex justify-between items-start mb-6">
                                                    <div className="text-indigo-400 text-3xl opacity-50 group-hover:opacity-100 transition-opacity">
                                                        <FaGraduationCap />
                                                    </div>
                                                    <div className="bg-indigo-500/10 text-indigo-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
                                                        Verified
                                                    </div>
                                                </div>
                                                <h4 className="text-xl font-black mb-2 text-white group-hover:text-indigo-400 transition-colors">{cert.topicId?.name}</h4>
                                                <p className="text-slate-500 text-sm mb-8 leading-relaxed line-clamp-2">{cert.topicId?.description}</p>

                                                <div className="mt-auto flex items-center justify-between pt-6 border-t border-white/5">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Earned On</span>
                                                        <span className="text-xs font-bold text-slate-300">{new Date(cert.certifiedAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <Button
                                                        className="px-4 py-2 text-xs font-black uppercase tracking-widest bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-900/20 rounded-xl flex items-center gap-2"
                                                        onClick={() => {
                                                            setSelectedCertificate(cert);
                                                            setShowCertificateModal(true);
                                                        }}
                                                    >
                                                        <FaDownload size={10} /> Download
                                                    </Button>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        {activeView === 'lb' && leaderboard && (
                            <div className="animate-fade-in mb-24">
                                <div className="h-10" />
                                <div className="max-w-5xl mx-auto w-full">
                                    <h3 className="text-2xl font-bold mb-8 flex items-center gap-3 text-slate-500 uppercase tracking-widest pl-2">
                                        <FaTrophy className="text-yellow-500" /> Top Global Performers
                                    </h3>

                                    <div className="flex flex-col gap-4">
                                        {leaderboard.topScorers.map((u: any, i: number) => (
                                            <Card
                                                key={i}
                                                className={`
                                                    p-6 flex items-center justify-between rounded-[1.5rem] transition-all hover:-translate-y-1 duration-300
                                                    ${i === 0 ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30' :
                                                        i === 1 ? 'bg-slate-500/5 border-slate-500/20' :
                                                            i === 2 ? 'bg-amber-600/5 border-amber-600/20' :
                                                                'bg-white/5 border-white/5 hover:bg-white/10'}
                                                `}
                                                noGlass={i > 2}
                                            >
                                                <div className="flex items-center gap-6">
                                                    <div className={`
                                                        w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-black
                                                        ${i === 0 ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/40' :
                                                            i === 1 ? 'bg-slate-300 text-slate-800' :
                                                                i === 2 ? 'bg-amber-600 text-white' :
                                                                    'bg-slate-800/50 text-slate-500'}
                                                    `}>
                                                        {i + 1}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className={`font-bold text-lg ${i === 0 ? 'text-yellow-500' : 'text-slate-200'}`}>
                                                            {u.username}
                                                        </span>
                                                        {i === 0 && <span className="text-[0.65rem] font-bold uppercase tracking-wider text-yellow-500/60">Current Champion</span>}
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-end">
                                                    <span className={`text-2xl font-black ${i === 0 ? 'text-yellow-500' : 'text-white'}`}>
                                                        {u.points}
                                                    </span>
                                                    <span className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-500">Points</span>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* AVAILABLE TOPICS VIEW */}
                        {activeView === 'available' && (
                            <div className="animate-fade-in mb-24">
                                <div className="h-20" /> {/* Explicit Spacer */}
                                {availableQuizzes.length === 0 ? (
                                    <Card className="p-20 text-center bg-slate-950/40 border-dashed border-2 border-white/5 rounded-[40px]">
                                        <div className="w-24 h-24 bg-slate-900 rounded-[2rem] flex items-center justify-center mx-auto mb-10 text-5xl shadow-inner shadow-white/5">💡</div>
                                        <h3 className="text-4xl font-black mb-4">All Caught Up!</h3>
                                        <p className="text-slate-500 mb-12 text-xl max-w-md mx-auto leading-relaxed">No new quizzes available right now. Check back soon for more!</p>
                                    </Card>
                                ) : (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-10">
                                        {availableQuizzes.map((quiz) => {
                                            const hasAttempted = attempts.some(a => a.topicId?._id === quiz._id);
                                            return (
                                                <Card
                                                    key={quiz._id}
                                                    onClick={() => !hasAttempted && handleStartQuizByDirectLink(quiz._id)}
                                                    className={`p-10 group transition-all duration-500 border-white/5 bg-slate-950/40 rounded-[2.5rem] flex flex-col h-full shadow-2xl ${hasAttempted ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-3 hover:bg-slate-900/60 cursor-pointer'}`}
                                                >
                                                    <div className="flex justify-between items-start mb-8">
                                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border transition-all duration-700 ${hasAttempted ? 'bg-slate-500/10 text-slate-500 border-slate-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 group-hover:rotate-[360deg]'}`}>
                                                            {hasAttempted ? <FaCheckCircle /> : <FaPlus />}
                                                        </div>
                                                    </div>
                                                    <h3 className={`text-2xl font-black mb-3 transition-colors ${!hasAttempted && 'group-hover:text-primary'}`}>
                                                        {quiz.name}
                                                    </h3>
                                                    <p className="text-slate-500 text-lg mb-10 line-clamp-2 leading-relaxed flex-1">{quiz.description}</p>

                                                    {hasAttempted && (
                                                        <div className="mt-auto pt-6 border-t border-white/5 text-center">
                                                            <span className="text-red-500 font-black uppercase tracking-widest text-sm">
                                                                Attempted Already
                                                            </span>
                                                        </div>
                                                    )}
                                                </Card>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* BADGES VIEW */}
                        {activeView === 'badges' && (
                            <div className="animate-fade-in mb-24 flex flex-col gap-24">
                                <div className="h-10" />

                                {badgesLoading ? (
                                    <div className="flex justify-center p-20">
                                        <div style={{ width: '4rem', height: '4rem', border: '5px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%' }} className="animate-spin" />
                                    </div>
                                ) : (
                                    <>
                                        {/* My Collection Section */}
                                        <div className="flex flex-col gap-10">
                                            <div className="flex items-end justify-between border-b border-white/5 pb-8">
                                                <div className="flex flex-col gap-2">
                                                    <h3 className="text-3xl font-black text-white">My Collection</h3>
                                                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[0.65rem]">Badges you have masterfully earned</p>
                                                </div>
                                                <Button
                                                    onClick={() => setShowAvailableModal(true)}
                                                    className="px-8 py-4 rounded-2xl bg-primary shadow-xl shadow-primary/20 hover:scale-[1.05] transition-all font-black uppercase tracking-widest text-[0.65rem] flex items-center gap-3"
                                                >
                                                    <FaPlus size={10} /> Discover More
                                                </Button>
                                            </div>

                                            {earnedBadges.length === 0 ? (
                                                <Card className="p-20 text-center bg-slate-950/40 border-dashed border-2 border-white/5 rounded-[40px]">
                                                    <div className="w-24 h-24 bg-slate-900 rounded-[2rem] flex items-center justify-center mx-auto mb-10 text-5xl shadow-inner shadow-white/5">🏆</div>
                                                    <h3 className="text-4xl font-black mb-4">No badges yet</h3>
                                                    <p className="text-slate-500 mb-12 text-xl max-w-md mx-auto leading-relaxed">Keep completing challenges to earn exclusive badges!</p>
                                                    <Button onClick={() => setActiveView('available')} className="px-16 py-6 rounded-[2rem] text-xl font-black bg-primary">Explore Topics</Button>
                                                </Card>
                                            ) : (
                                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-10">
                                                    {earnedBadges.map((badge) => (
                                                        <Card key={badge._id} className="p-10 group hover:-translate-y-3 transition-all duration-500 border-white/5 bg-slate-950/40 hover:bg-slate-900/60 rounded-[2.5rem] flex flex-col items-center text-center h-full shadow-2xl relative overflow-hidden gap-4">
                                                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
                                                            <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 flex items-center justify-center text-5xl text-yellow-500 mb-8 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-xl shadow-yellow-500/5">
                                                                {getBadgeIcon(badge.icon)}
                                                                <div className="absolute inset-0 bg-yellow-400/10 rounded-3xl animate-pulse opacity-0 group-hover:opacity-100 transition-opacity" />
                                                            </div>
                                                            <h3 className="text-3xl font-black mb-2 group-hover:text-primary transition-colors">{badge.name}</h3>
                                                            <p className="text-slate-500 text-lg leading-relaxed mb-8 flex-1">{badge.description}</p>
                                                            <div className="mt-auto pt-8 border-t border-white/5 w-full">
                                                                <span className="text-[0.65rem] font-black uppercase tracking-[0.25em] text-emerald-400">
                                                                    ✨ Achievement Unlocked
                                                                </span>
                                                            </div>
                                                        </Card>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* AVAILABLE BADGES MODAL */}
            {showAvailableModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl animate-fade-in" onClick={() => setShowAvailableModal(false)}>
                    <div className="max-w-6xl w-full bg-[#1e293b] rounded-[40px] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col max-h-[85vh] overflow-hidden" onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="relative py-12 md:py-16 border-b border-white/5 flex flex-col items-center justify-center bg-black/20 shrink-0">
                            <h3 className="text-4xl md:text-5xl font-black text-white mb-3">Available Badges</h3>
                            <p className="text-violet-400 font-bold uppercase tracking-[0.3em] text-[0.7rem] md:text-xs">Let's go! Here are more badges for you!</p>
                            <button
                                onClick={() => setShowAvailableModal(false)}
                                className="absolute right-6 md:right-12 top-1/2 -translate-y-1/2 p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-slate-400 hover:text-white"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-10 md:p-16 custom-scrollbar">
                            {availableBadges.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                                    <div className="w-24 h-24 bg-slate-900 rounded-[2rem] flex items-center justify-center mb-8 text-5xl shadow-inner">🏆</div>
                                    <h4 className="text-3xl font-black text-white">Elite Collector Status!</h4>
                                    <p className="text-slate-500 max-w-sm text-xl leading-relaxed mt-4">You've mastered every challenge and claimed every badge. Legendary work!</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                                    {availableBadges.map((badge) => (
                                        <Card key={badge._id} className="p-10 group hover:-translate-y-2 transition-all duration-500 border-white/5 bg-white/[0.02] hover:bg-white/[0.05] rounded-[2.5rem] flex flex-col items-center text-center h-full shadow-2xl relative overflow-hidden gap-4">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16" />
                                            <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-5xl text-slate-600 mb-6 transition-all duration-500 group-hover:scale-110">
                                                {getBadgeIcon(badge.icon)}
                                            </div>
                                            <h3 className="text-2xl font-black mb-1 text-slate-300 group-hover:text-white transition-colors">{badge.name}</h3>
                                            <p className="text-slate-500 text-base leading-relaxed mb-6 flex-1 line-clamp-3">{badge.description}</p>
                                            <div className="mt-auto pt-8 border-t border-white/5 w-full">
                                                <span className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-slate-500">
                                                    Requirement: <span className="text-amber-400 ml-1.5 font-black">{badge.threshold} {badge.type === 'points' ? 'pts' : badge.type === 'streak' ? 'days' : 'items'}</span>
                                                </span>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* DAILY POINTS MODAL */}
            {showDailyModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-fade-in" onClick={() => setShowDailyModal(false)}>
                    <Card className="max-w-md w-full p-12 text-center relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border-white/10 shadow-3xl rounded-[3rem]" onClick={(e) => e.stopPropagation()}>
                        {/* Decorative background elements */}
                        <div className="absolute -top-24 -left-24 w-64 h-64 bg-yellow-500/20 rounded-full blur-3xl animate-pulse" />
                        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

                        <div className="relative z-10 flex flex-col items-center">
                            {/* Trophy Icon */}
                            <div className="w-28 h-28 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-8 border-4 border-yellow-500/30 shadow-2xl shadow-yellow-500/50 animate-bounce" style={{ animationDuration: '2s' }}>
                                <FaTrophy className="text-6xl text-white drop-shadow-lg" />
                            </div>

                            {/* Title */}
                            <h2 className="text-4xl font-black mb-4 bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 bg-clip-text text-transparent">
                                Congratulations!
                            </h2>

                            {/* Points Message */}
                            <p className="text-slate-300 text-lg mb-6 leading-relaxed">
                                You earned <span className="text-yellow-400 font-black text-2xl">{dailyReward.points} points</span> for logging in today!
                            </p>

                            {/* Streak Bonus */}
                            {dailyReward.streak && (
                                <div className="mb-8 p-5 bg-gradient-to-r from-orange-500/20 to-red-500/20 border-2 border-orange-500/30 rounded-2xl text-orange-400 font-bold text-lg shadow-lg shadow-orange-500/20 animate-pulse">
                                    🔥 {dailyReward.streak}
                                </div>
                            )}

                            {/* Close Button */}
                            <Button
                                className="w-full py-5 rounded-3xl text-xl font-black shadow-2xl shadow-yellow-500/30 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 transition-all duration-300 hover:scale-105"
                                onClick={() => setShowDailyModal(false)}
                            >
                                Awesome! 🎉
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
            {/* CERTIFICATE VIEW MODAL */}
            {showCertificateModal && selectedCertificate && (
                <div
                    className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in overflow-y-auto certificate-container-wrapper print-isolated"
                    onClick={() => setShowCertificateModal(false)}
                >
                    <div
                        className="relative max-w-5xl w-full flex flex-col items-center gap-12 py-20 print-isolated"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setShowCertificateModal(false)}
                            className="absolute top-4 right-4 p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-slate-400 hover:text-white flex items-center gap-2 font-bold uppercase tracking-widest text-xs z-[310] print:hidden"
                        >
                            <FaTimes size={16} /> Close Preview
                        </button>

                        <div className="scale-[0.7] sm:scale-[0.8] md:scale-100 origin-center shadow-[0_0_100px_rgba(0,0,0,0.8)] border-[1px] border-white/20 rounded-xl overflow-hidden shrink-0 print:m-0 print:scale-100 print:shadow-none print:border-none">
                            <CertificateTemplate
                                participantName={user?.username || 'Student'}
                                topicName={selectedCertificate.topicId?.name}
                                date={new Date(selectedCertificate.certifiedAt).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            />
                        </div>

                        <div className="flex flex-col gap-6 w-full items-center">
                            <Button
                                className="px-16 py-6 rounded-3xl text-xl font-black bg-indigo-600 hover:bg-indigo-500 shadow-2xl shadow-indigo-600/30 flex items-center gap-4 group hover:scale-105 active:scale-95 transition-all relative overflow-hidden"
                                onClick={handleDownloadCertificate}
                                disabled={isDownloading}
                            >
                                {isDownloading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Preparing...
                                    </>
                                ) : (
                                    <>
                                        <FaDownload className="group-hover:translate-y-1 transition-transform" />
                                        Download Certificate (PDF)
                                    </>
                                )}
                            </Button>

                            <div className="bg-white/5 border border-white/10 p-4 px-6 rounded-2xl max-w-lg text-center backdrop-blur-md">
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] leading-relaxed">
                                    {isDownloading ? "Capturing certificate in high resolution..." : "Generated directly in high quality for your device."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
