'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
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
            const res = await api.post('/auth/login', {
                username,
                password
            });

            localStorage.setItem('username', res.data.username);
            localStorage.setItem('role', res.data.role);

            router.push('/users');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="container flex items-center justify-center min-h-screen p-6 md:p-12">
            <div className="w-full max-w-[540px] animate-fade-in py-12">
                {/* ---------- HEADER ---------- */}
                <div className="text-center mb-16">
                    <h1 className="text-[3.75rem] font-extrabold bg-gradient-to-r from-violet-400 to-indigo-500 bg-clip-text text-transparent tracking-tight mb-6 leading-tight">
                        Quiz Platform
                    </h1>

                    <p className="text-slate-400 text-lg font-medium opacity-80">
                        Dashboard Access
                    </p>
                </div>

                {/* ---------- CARD ---------- */}
                <Card className="glass p-10 md:p-20 rounded-[40px] border border-white/10 shadow-2xl backdrop-blur-xl">
                    <form onSubmit={handleLogin} className="flex flex-col gap-10">
                        {/* ---------- ERROR ---------- */}
                        {error && (
                            <div className="px-6 py-4 bg-red-500/10 border-l-4 border-red-500 text-red-400 text-sm rounded-xl animate-shake">
                                {error}
                            </div>
                        )}

                        <div className="flex flex-col gap-8">
                            {/* ---------- USERNAME ---------- */}
                            <div className="relative group">
                                <label className="block mb-3 text-[0.7rem] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                                    Username
                                </label>
                                <div className="relative">
                                    <input
                                        className="w-full pr-12 pl-6 py-5 rounded-2xl border border-white/5 bg-white/5 text-white outline-none text-[1rem] transition-all focus:border-violet-500/50 focus:bg-white/10 placeholder:text-slate-700"
                                        type="text"
                                        placeholder="Enter username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-violet-400 transition-colors pointer-events-none z-10">
                                        <FaUser className="w-[16px] h-[16px]" />
                                    </div>
                                </div>
                            </div>

                            {/* ---------- PASSWORD ---------- */}
                            <div className="relative group">
                                <label className="block mb-3 text-[0.7rem] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        className="w-full pr-12 pl-6 py-5 rounded-2xl border border-white/5 bg-white/5 text-white outline-none text-[1rem] transition-all focus:border-violet-500/50 focus:bg-white/10 placeholder:text-slate-700"
                                        type="password"
                                        placeholder="Enter password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-violet-400 transition-colors pointer-events-none z-10">
                                        <FaLock className="w-[16px] h-[16px]" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ---------- BUTTON ---------- */}
                        <div className="mt-4">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 text-lg font-black rounded-2xl shadow-xl shadow-violet-500/20 active:scale-[0.98] hover:scale-[1.02] transition-all duration-300 bg-violet-500 text-white"
                            >
                                {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
                            </Button>
                        </div>
                    </form>
                </Card>

                {/* ---------- FOOTER ---------- */}
                <p className="text-center mt-16 text-slate-500 text-sm font-medium opacity-60">
                    &copy; 2026 Quiz Platform Pro. Secure Dashboard Portal.
                </p>
            </div>
        </main>
    );
}
