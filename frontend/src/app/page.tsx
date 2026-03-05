'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Input from "@/components/Input";
import ThemeToggle from "@/components/ThemeToggle";
import { FaLock, FaUser, FaEnvelope, FaEye, FaEyeSlash } from 'react-icons/fa';

export default function Home() {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
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
            if (mode === 'login') {
                const res = await api.post('/auth/login', {
                    username,
                    password
                });

                if (res.data.pointsAwarded) {
                    localStorage.setItem('dailyPointsAwarded', 'true');
                    localStorage.setItem('pointsAwarded', res.data.pointsAwarded.toString());
                    if (res.data.streakStatus) {
                        localStorage.setItem('streakStatus', res.data.streakStatus);
                    }
                }

                localStorage.setItem('userId', res.data.id);
                localStorage.setItem('userPoints', res.data.points.toString());
                localStorage.setItem('userRole', res.data.role);
                localStorage.setItem('userName', res.data.username);

                if (res.data.role === 'admin') {
                    router.push('/users');
                } else {
                    router.push('/dashboard/student');
                }
            } else {
                await api.post('/auth/register', {
                    username,
                    email,
                    password
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
            style={{ background: 'var(--background)' }}
        >

            {/* CENTERED CONTENT */}
            <div className="flex flex-1 items-center justify-center px-10 py-16 md:p-12 relative text-balance">
                <div className="w-full max-w-[520px] animate-fade-in py-10 md:py-12">

                    <div className="flex justify-end mb-12 md:absolute md:top-8 md:right-8 md:mb-0" style={{ margin: '0 1rem 2.5rem 1rem' }}>
                        <ThemeToggle />
                    </div>

                    {/* ---------- HEADER ---------- */}
                    <div className="text-center mb-16 md:mb-20">
                        <h1
                            className="text-2xl md:text-[3.75rem] font-black mb-4 leading-tight"
                            style={{
                                backgroundImage: 'linear-gradient(to right, var(--primary), var(--secondary))',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}
                        >
                            Quiz Platform
                        </h1>

                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem', fontWeight: 600, letterSpacing: '0.02em' }} className="md:text-[1.125rem]">
                            {mode === 'login'
                                ? 'Welcome back! Please enter your details.'
                                : 'Create an account to start your journey.'
                            }
                        </p>
                    </div>

                    {/* ---------- CARD ---------- */}
                    <Card className="overflow-hidden" style={{ padding: '2.5rem', borderRadius: '2rem', maxWidth: '100%', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', background: 'rgba(15, 23, 42, 0.9)', margin: '0 1rem 1rem 1rem' }}>
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
                                        color: 'var(--text-muted)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.15em',
                                        paddingLeft: '1.5rem'
                                    }}>
                                        Username
                                    </label>

                                    <div className="relative">
                                        <input
                                            style={{
                                                width: '100%',
                                                paddingRight: '3rem',
                                                paddingLeft: '1.5rem',
                                                paddingTop: '1.25rem',
                                                paddingBottom: '1.25rem',
                                                borderRadius: 'var(--radius-lg)',
                                                border: '1px solid var(--border-color)',
                                                background: 'var(--glass-bg)',
                                                color: 'var(--text-primary)',
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
                                            color: 'var(--text-muted)',
                                            pointerEvents: 'none',
                                            transition: 'var(--transition)'
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
                                            color: 'var(--text-muted)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.15em',
                                            paddingLeft: '1.5rem'
                                        }}>
                                            Email
                                        </label>

                                        <div className="relative">
                                            <input
                                                style={{
                                                    width: '100%',
                                                    paddingRight: '3rem',
                                                    paddingLeft: '1.5rem',
                                                    paddingTop: '1.25rem',
                                                    paddingBottom: '1.25rem',
                                                    borderRadius: 'var(--radius-lg)',
                                                    border: '1px solid var(--border-color)',
                                                    background: 'var(--glass-bg)',
                                                    color: 'var(--text-primary)',
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
                                                color: 'var(--text-muted)',
                                                pointerEvents: 'none',
                                                transition: 'var(--transition)'
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
                                        color: 'var(--text-muted)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.15em',
                                        paddingLeft: '1.5rem'
                                    }}>
                                        Password
                                    </label>

                                    <div className="relative">
                                        <input
                                            style={{
                                                width: '100%',
                                                paddingRight: '3rem',
                                                paddingLeft: '1.5rem',
                                                paddingTop: '1.25rem',
                                                paddingBottom: '1.25rem',
                                                borderRadius: 'var(--radius-lg)',
                                                border: '1px solid var(--border-color)',
                                                background: 'var(--glass-bg)',
                                                color: 'var(--text-primary)',
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
                                            color: 'var(--text-muted)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem'
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
                                                    display: 'flex'
                                                }}
                                                title={showPassword ? "Hide password" : "Show password"}
                                            >
                                                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                                            </button>
                                            <FaLock size={16} />
                                        </div>
                                    </div>
                                </div>

                            </div>

                            {/* BUTTON */}
                            <Button
                                type="submit"
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    padding: '1.25rem',
                                    fontSize: '1.125rem',
                                    fontWeight: 800,
                                    borderRadius: 'var(--radius-lg)',
                                    background: 'var(--primary)',
                                    boxShadow: '0 10px 30px rgba(var(--primary-rgb), 0.3)'
                                }}
                            >
                                {loading ? 'Processing...' : (mode === 'login' ? 'Sign In to Dashboard' : 'Create Account')}
                            </Button>

                            {/* TOGGLE */}
                            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }} className="mt-2">
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
                    color: 'var(--text-muted)',
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
