'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { FaLock, FaUser, FaEnvelope, FaEye, FaEyeSlash, FaQuestionCircle } from 'react-icons/fa';
import QRCode from 'react-qr-code';

export default function Home() {
    /* ── Landing vs Auth view ── */
    const [showLanding, setShowLanding] = useState(true);

    /* ── Existing auth states (unchanged) ── */
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [referralCode, setReferralCode] = useState('');
    const [showReferralInput, setShowReferralInput] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // 1. HISTORY TRAP: Prevent the user from going back into the dashboard after logout.
        window.history.pushState(null, '', window.location.href);
        const handlePopState = () => {
            window.history.pushState(null, '', window.location.href);
            window.location.reload();
        };
        window.addEventListener('popstate', handlePopState);

        // 2. REINFORCE REDIRECT
        const checkAuth = async () => {
            try {
                const res = await api.get('/auth/status');
                if (res.data.authenticated) {
                    if (res.data.user.role === 'admin') {
                        router.replace('/users');
                    } else {
                        router.replace('/dashboard/student');
                    }
                }
            } catch (err) {
                // Not authenticated, stay on login page
            }
        };

        checkAuth();

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const trimmedUsername = username.trim();
            const trimmedPassword = password.trim();
            const trimmedEmail = email.trim();

            if (mode === 'login') {
                const res = await api.post('/auth/login', {
                    username: trimmedUsername,
                    password: trimmedPassword
                });

                if (res.data.pointsAwarded) {
                    sessionStorage.setItem('dailyPointsAwarded', 'true');
                    sessionStorage.setItem('pointsAwarded', res.data.pointsAwarded.toString());
                    if (res.data.streakStatus) {
                        sessionStorage.setItem('streakStatus', res.data.streakStatus);
                    }
                }

                if (res.data.role === 'admin') {
                    router.push('/users');
                } else {
                    router.push('/dashboard/student');
                }
            } else {
                await api.post('/auth/register', {
                    username: trimmedUsername,
                    email: trimmedEmail,
                    password: trimmedPassword,
                    referralCode: referralCode.trim()
                });
                setSuccess('Registration successful! Please login.');
                setMode('login');
                setPassword('');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || (mode === 'login' ? 'Login failed.' : 'Registration failed.'));
        } finally {
            setLoading(false);
        }
    };

    /* ── Shared header ── */
    const Header = () => (
        <header style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            background: '#000000',
            width: '100%',
            padding: '0 1.5rem',
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
        }}>
            <span style={{
                color: '#4f46e5',
                fontWeight: 900,
                fontSize: '1rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                fontFamily: 'inherit'
            }}>
                QR Quiz Platform
            </span>
            <FaQuestionCircle
                style={{
                    color: '#4f46e5',
                    fontSize: 'clamp(1.25rem, 4vw, 1.6rem)',
                    flexShrink: 0
                }}
                aria-label="Help"
            />
        </header>
    );

    /* ── Shared footer ── */
    const Footer = () => (
        <div
            className="text-center py-10 border-t border-white/10"
            style={{
                color: '#64748b',
                fontSize: '0.875rem',
                fontWeight: 500,
                width: '100%'
            }}
        >
            &copy; 2026 Quiz Platform Pro. Secure Dashboard Portal.
        </div>
    );

    /* ══════════════════════════════════════════
       LANDING VIEW
    ══════════════════════════════════════════ */
    if (showLanding) {
        return (
            <main
                className="min-h-screen flex flex-col"
                style={{
                    background: 'linear-gradient(150deg, #f8f9ff 0%, #edeaff 45%, #f5f0ff 100%)',
                }}
            >
                <Header />

                {/* Hero Section */}
                <div
                    className="flex flex-1"
                    style={{
                        padding: 'clamp(2.5rem, 6vw, 5rem) clamp(1.5rem, 6vw, 5rem)',
                        gap: 'clamp(2rem, 4vw, 4rem)',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {/* LEFT — Hero text */}
                    <div
                        className="animate-fade-in"
                        style={{
                            flex: '1 1 300px',
                            minWidth: '260px',
                            maxWidth: '500px',
                        }}
                    >
                        {/* Pill badge */}
                        <span style={{
                            display: 'inline-block',
                            background: 'rgba(79,70,229,0.08)',
                            border: '1px solid rgba(79,70,229,0.22)',
                            color: '#4f46e5',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            letterSpacing: '0.13em',
                            textTransform: 'uppercase',
                            borderRadius: '9999px',
                            padding: '0.35rem 1rem',
                            marginBottom: '1.4rem',
                        }}>
                            New Experience
                        </span>

                        {/* Headline */}
                        <h1 style={{
                            fontSize: 'clamp(2.6rem, 6.5vw, 4.25rem)',
                            fontWeight: 900,
                            lineHeight: 1.08,
                            color: '#0f172a',
                            marginBottom: '1.25rem',
                            letterSpacing: '-0.03em',
                        }}>
                            Create a{' '}
                            <em style={{
                                fontStyle: 'italic',
                                color: '#4f46e5',
                                fontFamily: 'Georgia, "Times New Roman", serif',
                            }}>Quiz</em>
                        </h1>

                        {/* Subtitle */}
                        <p style={{
                            color: '#475569',
                            fontSize: 'clamp(0.9rem, 2vw, 1.05rem)',
                            lineHeight: 1.65,
                            marginBottom: '2.5rem',
                            maxWidth: '390px',
                            fontWeight: 400,
                        }}>
                            Transform your engagement strategy with high-end,
                            scannable experiences. Bridge the physical and digital
                            worlds instantly.
                        </p>

                        {/* CTA Buttons */}
                        <div style={{
                            display: 'flex',
                            gap: '1rem',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                        }}>
                            <button
                                id="get-started-btn"
                                onClick={() => setShowLanding(false)}
                                style={{
                                    background: '#4f46e5',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '9999px',
                                    padding: '0.875rem 2.25rem',
                                    fontSize: '1rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    boxShadow: '0 8px 28px rgba(79,70,229,0.38)',
                                    transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                                    letterSpacing: '0.01em',
                                    whiteSpace: 'nowrap',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 12px 36px rgba(79,70,229,0.45)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 8px 28px rgba(79,70,229,0.38)';
                                }}
                            >
                                Get Started
                            </button>


                        </div>
                    </div>

                    {/* RIGHT — QR Card Visual */}
                    <div
                        className="animate-fade-in"
                        style={{
                            flex: '1 1 280px',
                            minWidth: '250px',
                            maxWidth: '400px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            position: 'relative',
                            paddingBottom: '2rem',
                        }}
                    >
                        {/* Outer white card */}
                        <div style={{
                            background: '#ffffff',
                            borderRadius: '1.75rem',
                            padding: '1.75rem 1.75rem 1.5rem',
                            boxShadow: '0 24px 72px rgba(79,70,229,0.12), 0 8px 24px rgba(0,0,0,0.06)',
                            width: '100%',
                            maxWidth: '360px',
                        }}>
                            {/* Dark inner card */}
                            <div style={{
                                background: 'linear-gradient(145deg, #111827 0%, #1e1b4b 100%)',
                                borderRadius: '1.25rem',
                                padding: '1.5rem',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                marginBottom: '1.25rem',
                            }}>
                                {/* White QR holder */}
                                <div style={{
                                    background: '#ffffff',
                                    borderRadius: '0.875rem',
                                    padding: '1rem 1rem 0.75rem',
                                    width: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                }}>
                                    <QRCode
                                        value="https://qrquizplatform.io/preview"
                                        size={170}
                                        style={{ height: 'auto', maxWidth: '100%', width: '170px' }}
                                        fgColor="#0f172a"
                                        bgColor="#ffffff"
                                    />
                                    <p style={{
                                        color: '#94a3b8',
                                        fontSize: '0.62rem',
                                        marginTop: '0.625rem',
                                        textAlign: 'center',
                                        letterSpacing: '0.05em',
                                        lineHeight: 1.5,
                                    }}>
                                        Professional<br />Safe &middot; Secure &middot; Work
                                    </p>
                                </div>
                            </div>

                            {/* Scan label */}
                            <p style={{
                                textAlign: 'center',
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                letterSpacing: '0.15em',
                                textTransform: 'uppercase',
                                color: '#64748b',
                                marginBottom: '0.75rem',
                            }}>
                                Scan to Preview
                            </p>

                            {/* Dot indicators */}
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem' }}>
                                {[0, 1, 2].map(i => (
                                    <div key={i} style={{
                                        width: '7px',
                                        height: '7px',
                                        borderRadius: '50%',
                                        background: i === 0 ? '#4f46e5' : '#e2e8f0',
                                        transition: 'background 0.2s',
                                    }} />
                                ))}
                            </div>
                        </div>

                        {/* Dynamic Generation floating badge */}
                        <div style={{
                            position: 'absolute',
                            bottom: '0.25rem',
                            left: '0',
                            background: '#ffffff',
                            borderRadius: '9999px',
                            padding: '0.55rem 1rem 0.55rem 0.55rem',
                            boxShadow: '0 8px 28px rgba(0,0,0,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                        }}>
                            <div style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #4f46e5, #818cf8)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.85rem',
                                color: '#fff',
                                flexShrink: 0,
                            }}>✦</div>
                            <div>
                                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
                                    Dynamic Generation
                                </p>
                                <p style={{ fontSize: '0.65rem', color: '#64748b', margin: 0 }}>
                                    Update content in real-time
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <Footer />
            </main>
        );
    }

    /* ══════════════════════════════════════════
       AUTH VIEW  — existing card, zero changes
    ══════════════════════════════════════════ */
    return (
        <main
            className="min-h-screen flex flex-col"
            style={{ background: '#f1f5f9' }}
        >
            <Header />

            {/* PAGE CONTENT */}
            <div
                className="flex flex-1 flex-col items-center px-4 sm:px-6 text-balance"
                style={{ paddingTop: mode === 'login' ? '3.5rem' : '2rem', paddingBottom: '3rem' }}
            >
                <div className="w-full max-w-[520px] animate-fade-in">

                    {/* ---------- HEADER ---------- */}
                    <div className="text-center" style={{ marginBottom: '2rem' }}>
                        <h1
                            className="text-2xl md:text-[3rem] font-black mb-4 leading-tight"
                            style={{
                                backgroundImage: 'linear-gradient(to right, #4f46e5, #6366f1)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}
                        >
                            Quiz Platform
                        </h1>

                        <p style={{ color: 'black', fontSize: '0.9rem', marginBottom: '1rem', fontWeight: 600, letterSpacing: '0.02em' }} className="md:text-[1.125rem]">
                            {mode === 'login'
                                ? 'Welcome back! Please enter your details.'
                                : 'Create an account to start your journey.'
                            }
                        </p>
                    </div>

                    {/* ---------- CARD ---------- */}
                    <Card
                        className="overflow-hidden"
                        style={{
                            padding: '1.5rem 1.5rem',
                            margin:'1rem 1rem 1rem 1rem',
                            borderRadius: '1.25rem',
                            maxWidth: '480px',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.08)',
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            marginTop: mode === 'login' ? '1rem' : '1.5rem',
                            marginBottom: '1rem',
                        }}
                    >
                        <form onSubmit={handleSubmit} className="flex flex-col gap-6 md:gap-8">

                            {/* ---------- MESSAGE ---------- */}
                            {error && (
                                <div
                                    style={{
                                        padding: '1rem 1.5rem',
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        borderLeft: '4px solid var(--error)',
                                        color: 'var(--error)',
                                        fontSize: '0.875rem',
                                        borderRadius: 'var(--radius)'
                                    }}
                                    className="animate-shake"
                                >
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div
                                    style={{
                                        padding: '1rem 1.5rem',
                                        background: 'rgba(34, 197, 94, 0.1)',
                                        borderLeft: '4px solid #22c55e',
                                        color: '#22c55e',
                                        fontSize: '0.875rem',
                                        borderRadius: 'var(--radius)'
                                    }}
                                >
                                    {success}
                                </div>
                            )}

                            <div className="flex flex-col gap-5">

                                {/* USERNAME */}
                                <div className="relative group">
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '0.75rem',
                                        fontSize: '0.75rem',
                                        fontWeight: 800,
                                        color: '#475569',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.15em',
                                        paddingLeft: '1.5rem'
                                    }}>
                                        Username <span style={{ color: 'var(--error)' }}>*</span>
                                    </label>

                                    <div className="relative">
                                        <input
                                            style={{
                                                width: '100%',
                                                paddingRight: '3.5rem',
                                                paddingLeft: '1.5rem',
                                                paddingTop: '0.875rem',
                                                paddingBottom: '0.875rem',
                                                borderRadius: 'var(--radius-lg)',
                                                border: '1px solid var(--border-color)',
                                                background: '#f8fafc',
                                                color: '#0f172a',
                                                outline: 'none',
                                                fontSize: '1rem',
                                                transition: 'var(--transition)'
                                            }}
                                            className="focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20"
                                            type="text"
                                            placeholder="Enter username"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            autoCapitalize="none"
                                            autoCorrect="off"
                                            spellCheck="false"
                                            required
                                        />

                                        <div style={{
                                            position: 'absolute',
                                            right: '1.5rem',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: '#475569',
                                            pointerEvents: 'none',
                                            transition: 'var(--transition)',
                                            flexShrink: 0
                                        }}
                                            className="group-focus-within:text-[var(--primary)]">
                                            <FaUser className="w-[16px] h-[16px]" />
                                        </div>
                                    </div>
                                </div>

                                {/* EMAIL */}
                                {mode === 'register' && (
                                    <div className="relative group animate-fade-in">
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '0.75rem',
                                            fontSize: '0.75rem',
                                            fontWeight: 800,
                                            color: '#475569',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.15em',
                                            paddingLeft: '1.5rem'
                                        }}>
                                            Email <span style={{ color: 'var(--error)' }}>*</span>
                                        </label>

                                        <div className="relative">
                                            <input
                                                style={{
                                                    width: '100%',
                                                    paddingRight: '3.5rem',
                                                    paddingLeft: '1.5rem',
                                                    paddingTop: '0.875rem',
                                                    paddingBottom: '0.875rem',
                                                    borderRadius: 'var(--radius-lg)',
                                                    border: '1px solid var(--border-color)',
                                                    background: '#f8fafc',
                                                    color: '#0f172a',
                                                    outline: 'none',
                                                    fontSize: '1rem',
                                                    transition: 'var(--transition)'
                                                }}
                                                className="focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20"
                                                type="email"
                                                placeholder="Enter email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                autoCapitalize="none"
                                                autoCorrect="off"
                                                spellCheck="false"
                                                required
                                            />
                                            <div style={{
                                                position: 'absolute',
                                                right: '1.5rem',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: '#475569',
                                                pointerEvents: 'none',
                                                transition: 'var(--transition)',
                                                flexShrink: 0
                                            }} className="group-focus-within:text-[var(--primary)]">
                                                <FaEnvelope className="w-[16px] h-[16px]" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* PASSWORD */}
                                <div className="relative group">
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '0.75rem',
                                        fontSize: '0.75rem',
                                        fontWeight: 800,
                                        color: '#475569',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.15em',
                                        paddingLeft: '1.5rem'
                                    }}>
                                        Password <span style={{ color: 'var(--error)' }}>*</span>
                                    </label>

                                    <div className="relative">
                                        <input
                                            style={{
                                                width: '100%',
                                                paddingRight: '5.5rem',
                                                paddingLeft: '1.5rem',
                                                paddingTop: '0.875rem',
                                                paddingBottom: '0.875rem',
                                                borderRadius: 'var(--radius-lg)',
                                                border: '1px solid var(--border-color)',
                                                background: '#f8fafc',
                                                color: '#0f172a',
                                                outline: 'none',
                                                fontSize: '1rem',
                                                transition: 'var(--transition)'
                                            }}
                                            className="focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            autoCapitalize="none"
                                            autoCorrect="off"
                                            spellCheck="false"
                                            required
                                        />
                                        <div style={{
                                            position: 'absolute',
                                            right: '1.5rem',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: '#475569',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem',
                                            flexShrink: 0
                                        }} className="group-focus-within:text-[var(--primary)]">
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    padding: 0,
                                                    cursor: 'pointer',
                                                    color: 'inherit',
                                                    display: 'flex',
                                                    flexShrink: 0
                                                }}
                                                title={showPassword ? "Hide password" : "Show password"}
                                            >
                                                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                                            </button>
                                            <FaLock size={16} />
                                        </div>
                                    </div>
                                </div>

                                {mode === 'register' && (
                                    <div className="animate-fade-in">
                                        {!showReferralInput ? (
                                            <button
                                                type="button"
                                                onClick={() => setShowReferralInput(true)}
                                                className="text-xs font-black uppercase tracking-widest text-primary hover:text-secondary transition-colors underline underline-offset-4 ml-6"
                                                style={{color:'black'}}
                                            >
                                                + Have a referral code?
                                            </button>
                                        ) : (
                                            <div className="relative group animate-fade-in">
                                                <label style={{
                                                    display: 'block',
                                                    marginBottom: '0.75rem',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 800,
                                                    color: '#475569',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.15em',
                                                    paddingLeft: '1.5rem'
                                                }}>
                                                    Referral Code
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        style={{
                                                            width: '100%',
                                                            paddingRight: '3.5rem',
                                                            paddingLeft: '1.5rem',
                                                            paddingTop: '0.875rem',
                                                            paddingBottom: '0.875rem',
                                                            borderRadius: 'var(--radius-lg)',
                                                            border: '1px solid var(--border-color)',
                                                            background: '#f8fafc',
                                                            color: '#0f172a',
                                                            outline: 'none',
                                                            fontSize: '1rem',
                                                            transition: 'var(--transition)'
                                                        }}
                                                        className="focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20 uppercase tracking-widest"
                                                        type="text"
                                                        placeholder="ENTER CODE"
                                                        value={referralCode}
                                                        onChange={(e) => setReferralCode(e.target.value)}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {setShowReferralInput(false); setReferralCode('');}}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                                                    >
                                                        &times;
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                            </div>

                            {/* BUTTON */}
                            <Button
                                type="submit"
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    fontSize: '1rem',
                                    fontWeight: 800,
                                    borderRadius: 'var(--radius-lg)',
                                    background: 'var(--primary)',
                                    boxShadow: '0 10px 30px rgba(var(--primary-rgb), 0.3)'
                                }}
                            >
                                {loading ? 'Processing...' : (mode === 'login' ? 'Sign In to Dashboard' : 'Create Account')}
                            </Button>

                            {/* TOGGLE */}
                            <p style={{ textAlign: 'center', color: 'black', fontSize: '0.9rem' }} className="mt-2">
                                {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMode(mode === 'login' ? 'register' : 'login');
                                        setUsername('');
                                        setEmail('');
                                        setPassword('');
                                        setError('');
                                        setSuccess('');
                                    }}
                                    style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'underline' }}
                                >
                                    {mode === 'login' ? 'Register here' : 'Login here'}
                                </button>
                            </p>

                        </form>
                    </Card>

                </div>
            </div>

            {/* FOOTER */}
            <Footer />

        </main>
    );
}
