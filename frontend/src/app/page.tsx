'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { FaLock, FaUser, FaEnvelope, FaEye, FaEyeSlash, FaQuestionCircle } from 'react-icons/fa';

export default function Home() {
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
        // We push a state and listen for popstate to lock them here.
        window.history.pushState(null, '', window.location.href);
        const handlePopState = () => {
            window.history.pushState(null, '', window.location.href);
            // Optionally force a reload to re-run all checks if they try to go back
            window.location.reload();
        };
        window.addEventListener('popstate', handlePopState);

        // 2. REINFORCE REDIRECT: Even if accessed via back-button, check if we have a valid session
        // and redirect away from the login page immediately.
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

    return (
        <main
            className="min-h-screen flex flex-col"
            style={{ background: '#f1f5f9' }}
        >

            {/* ===== BLACK HEADER ===== */}
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
                    color: '#f97316',
                    fontWeight: 900,
                    fontSize: '1rem',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    fontFamily: 'inherit'
                }}>
                    QR Quiz Platform
                </span>

                {/* Orange question mark icon — right side */}
                <FaQuestionCircle
                    style={{
                        color: '#f97316',
                        fontSize: 'clamp(1.25rem, 4vw, 1.6rem)',
                        flexShrink: 0
                    }}
                    aria-label="Help"
                />
            </header>

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
                                backgroundImage: 'linear-gradient(to right, #f97316, #fb923c)',
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
                            padding: '1.75rem 1.75rem',
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
                        <form onSubmit={handleSubmit} className="flex flex-col gap-8 md:gap-10">

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

                            <div className="flex flex-col gap-6">

                                {/* USERNAME */}
                                <div className="relative group">
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '1rem',
                                        marginTop: '1rem',
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
                                                paddingTop: '1rem',
                                                paddingBottom: '1rem',
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
                                            marginBottom: '1rem',
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
                                                    paddingTop: '1rem',
                                                    paddingBottom: '1rem',
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
                                        marginBottom: '1rem',
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
                                                paddingTop: '1rem',
                                                paddingBottom: '1rem',
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
                                                    marginBottom: '1rem',
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
                                                            paddingTop: '1rem',
                                                            paddingBottom: '1rem',
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

        </main>
    );
}
