'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { FaLock, FaUser } from 'react-icons/fa';

export default function Home() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
                username,
                password
            });

            localStorage.setItem('token', res.data.token);
            localStorage.setItem('username', res.data.username);

            // Set cookie for middleware
            document.cookie = `token=${res.data.token}; path=/; max-age=86400; SameSite=Lax`;

            router.push('/admin');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="container" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '90vh'
        }}>
            <div style={{ width: '100%', maxWidth: '450px', animation: 'fadeIn 0.5s ease-out' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <h1 style={{
                        fontSize: '3.5rem',
                        fontWeight: 800,
                        background: 'linear-gradient(135deg, #c084fc 0%, #6366f1 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: '0.5rem',
                        letterSpacing: '-1px'
                    }}>
                        Quiz Platform
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>Admin Dashboard Login</p>
                </div>

                <Card className="glass" style={{
                    padding: '2.5rem',
                    borderRadius: '24px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {error && (
                            <div style={{
                                padding: '0.75rem 1rem',
                                background: 'rgba(239, 68, 68, 0.1)',
                                borderLeft: '4px solid #ef4444',
                                color: '#f87171',
                                fontSize: '0.9rem',
                                borderRadius: '4px'
                            }}>
                                {error}
                            </div>
                        )}

                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '1rem', top: '2.6rem', color: '#64748b' }}>
                                <FaUser />
                            </div>
                            <Input
                                label="Username"
                                type="text"
                                placeholder="Enter admin username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                style={{ paddingLeft: '2.8rem' }}
                                required
                            />
                        </div>

                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '1rem', top: '2.6rem', color: '#64748b' }}>
                                <FaLock />
                            </div>
                            <Input
                                label="Password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ paddingLeft: '2.8rem' }}
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            style={{
                                marginTop: '1rem',
                                padding: '1rem',
                                fontSize: '1.1rem',
                                fontWeight: 600,
                                background: 'linear-gradient(to right, #8b5cf6, #3b82f6)',
                                boxShadow: '0 10px 15px -3px rgba(139, 92, 246, 0.3)'
                            }}
                        >
                            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
                        </Button>
                    </form>
                </Card>

                <p style={{ textAlign: 'center', marginTop: '2rem', color: '#64748b', fontSize: '0.9rem' }}>
                    &copy; 2026 Quiz Platform Pro. All rights reserved.
                </p>
            </div>
        </main>
    );
}
