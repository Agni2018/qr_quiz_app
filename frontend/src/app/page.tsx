'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Input from "@/components/Input";
import ThemeToggle from "@/components/ThemeToggle";
import { FaLock, FaUser, FaEnvelope } from 'react-icons/fa';

export default function Home() {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
            <div className="flex flex-1 items-center justify-center p-6 md:p-12 relative">
                <div className="w-full max-w-[540px] animate-fade-in py-12">

                    <div className="flex justify-end mb-16 md:absolute md:top-8 md:right-8 md:mb-0">
                        <ThemeToggle />
                    </div>

                    {/* ---------- HEADER ---------- */}
                    <div className="text-center mb-16 md:mb-24">
                        <h1
                            className="text-[2.5rem] md:text-[3.75rem] font-extrabold mb-4 leading-[1.1]"
                            style={{
                                background: 'linear-gradient(to right, var(--primary), var(--secondary))',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}
                        >
                            Quiz Platform
                        </h1>

                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', fontWeight: 500 }}>
                            {mode === 'login'
                                ? 'Welcome back! Please enter your details.'
                                : 'Create an account to start your journey.'
                            }
                        </p>
                    </div>

                    {/* ---------- CARD ---------- */}
                    <Card className="p-8 md:p-12" style={{ borderRadius: '2.5rem' }}>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-8">

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
                                        marginBottom: '0.75rem',
                                        fontSize: '0.7rem',
                                        fontWeight: 800,
                                        color: 'var(--text-muted)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.2em'
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
                                            marginBottom: '0.75rem',
                                            fontSize: '0.7rem',
                                            fontWeight: 800,
                                            color: 'var(--text-muted)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.2em'
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
                                        marginBottom: '0.75rem',
                                        fontSize: '0.7rem',
                                        fontWeight: 800,
                                        color: 'var(--text-muted)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.2em'
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
                                            type="password"
                                            placeholder="Enter password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
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
                                            <FaLock className="w-[16px] h-[16px]" />
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
                                    borderRadius: 'var(--radius-lg)'
                                }}
                            >
                                {loading ? 'Processing...' : (mode === 'login' ? 'Sign In to Dashboard' : 'Create Account')}
                            </Button>

                            {/* TOGGLE */}
                            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
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
