'use client';

import { useState, useEffect, use } from 'react';
import api from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import AlertModal from '@/components/AlertModal';

export default function QuizLanding({
    params
}: {
    params: Promise<{ topicId: string }>;
}) {
    const { topicId } = use(params);
    const router = useRouter();

    const [topic, setTopic] = useState<any>(null);
    const [questionCount, setQuestionCount] = useState<number | null>(null);
    const [user, setUser] = useState({
        name: '',
        email: '',
        phone: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const searchParams = useSearchParams();
    const isDirect = searchParams.get('direct') === 'true';

    useEffect(() => {
        const storedUser = sessionStorage.getItem('quizUser');
        if (storedUser && !isDirect) {
            router.replace(`/quiz/${topicId}/play?back=true`);
            return;
        }

        // Fetch topic and question count
        api.get(`/topics/${topicId}`)
            .then(res => setTopic(res.data))
            .catch(err => console.error(err));

        api.get(`/questions/topic/${topicId}`)
            .then(res => setQuestionCount(res.data.length))
            .catch(err => {
                console.error(err);
                setQuestionCount(0);
            });

        // Check if user is logged in to pre-fill the form
        api.get('/auth/status')
            .then(res => {
                // Pre-fill logic
                if (res.data.user) {
                    const authUser = res.data.user;
                    // Case 1: Direct attempt (Bypass form) - Pre-fill everything with fallbacks
                    if (isDirect) {
                        setUser({
                            name: authUser.username || '',
                            email: authUser.email || `${authUser.username}@internal`,
                            phone: 'N/A'
                        });
                    } 
                    // Case 2: Regular link but user is a student - Pre-fill known info only
                    else if (authUser.role === 'student') {
                        setUser({
                            name: authUser.username || '',
                            email: authUser.email || '',
                            phone: ''
                        });
                    }
                    // Case 3: Admin or other role on regular link - Keep form empty for testing/guest flow
                }
            })
            .catch(() => {
                // Not logged in, no problem
            });
    }, [topicId, isDirect]);

    // Auto-start if direct and questions exist
    useEffect(() => {
        if (isDirect && topic && questionCount !== null && questionCount > 0 && user.name && user.email && user.phone === 'N/A') {
            const startForm = {
                preventDefault: () => { },
                target: {}
            } as any;
            handleStart(startForm);
        }
        
        if (questionCount === 0) {
            setIsAlertOpen(true);
        }
    }, [isDirect, topic, questionCount, user.name]);

    const handleStart = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user.name || !user.email || !user.phone) {
            setError('All fields are required');
            return;
        }

        // Phone number validation: 10 digits only (or N/A for direct)
        const phoneRegex = /^\d{10}$/;
        if (user.phone !== 'N/A' && !phoneRegex.test(user.phone)) {
            setError('Phone number must be exactly 10 digits (e.g., 9876543210)');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await api.post('/quiz/start', {
                topicId,
                ...user
            });

            if (res.data.canAttempt) {
                sessionStorage.setItem('quizUser', JSON.stringify(user));
                router.push(`/quiz/${topicId}/play`);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to start quiz');
            if (err.response?.status === 400) {
                // already attempted - now handled by 400 to avoid redirect
            }
            if (err.response?.status === 404) {
                // User not found
            }
        } finally {
            setLoading(false);
        }
    };

    if (!topic || questionCount === null) {
        return (
            <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', width: '100%' }}>
                <div
                    className="container flex justify-center items-center pt-16"
                >
                    <div
                        className="glass p-10 rounded-2xl text-lg"
                        style={{ color: '#0f172a' }}
                    >
                        Loading Quiz...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', width: '100%' }}>
            <main className="container flex items-center justify-center py-24 sm:py-32">
                <Card
                    className="max-w-[550px] w-full rounded-[3.5rem] relative overflow-hidden"
                    style={{ 
                        padding: '3.5rem 2.5rem',
                        backgroundColor: '#ffffff',
                        border: '1.5px solid #e2e8f0',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)',
                        '--text-primary': '#0f172a',
                        '--text-secondary': '#64748b',
                    } as any }
                >
                    {/* Background accent */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16"></div>

                    <div className="text-center mb-8 leading-relaxed">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100/50 flex items-center justify-center text-2xl mx-auto mb-4 border border-slate-200 shadow-sm">
                            🎯
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 leading-tight mb-2">
                            {topic.name}
                        </h1>
                        <p className="text-slate-500 font-medium leading-relaxed" style={{marginBottom:30}}>
                            {topic.description}
                        </p>
                    </div>

                    {/* No Questions State */}
                    {questionCount === 0 ? (
                        <div className="text-center py-16 px-8 bg-primary/5 rounded-3xl border-2 border-dashed border-primary/20">
                            <div className="text-5xl mb-6">📝</div>
                            <h3 className="text-2xl font-black text-primary mb-2">
                                Coming Soon
                            </h3>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed italic">
                                Questions are being prepared. Check back later to challenge yourself!
                            </p>
                        </div>
                    ) : (
                        /* User Details Form */
                        <form
                            onSubmit={handleStart}
                            className="flex flex-col gap-6"
                        >
                            <div className="flex flex-col gap-4">
                                <Input
                                    label={<>Full Name <span style={{ color: '#ef4444' }}>*</span></>}
                                    value={user.name}
                                    onChange={e =>
                                        setUser({ ...user, name: e.target.value })
                                    }
                                    placeholder="Enter your name"
                                    className="!p-4"
                                    style={{ background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0' }}
                                />

                                <Input
                                    label={<>Email Address <span style={{ color: '#ef4444' }}>*</span></>}
                                    type="email"
                                    value={user.email}
                                    onChange={e =>
                                        setUser({ ...user, email: e.target.value })
                                    }
                                    placeholder="name@email.com"
                                    className="!p-4"
                                    style={{ background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0' }}
                                />

                                <Input
                                    label={<>Phone Number <span style={{ color: '#ef4444' }}>*</span></>}
                                    type="tel"
                                    value={user.phone}
                                    onChange={e =>
                                        setUser({ ...user, phone: e.target.value })
                                    }
                                    placeholder="10-digit number"
                                    className="!p-4"
                                    style={{ background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0' }}
                                />
                            </div>

                            {error && (
                                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center font-bold">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-6 py-4 rounded-xl text-lg font-black shadow-2xl shadow-primary/40 bg-primary text-white hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                {loading ? 'Preparing Session...' : '🚀 Start Quiz Challenge'}
                            </Button>

                            <p className="text-center text-[0.65rem] font-black uppercase tracking-[0.2em] text-slate-400 mt-2">
                                One attempt allowed per person
                            </p>
                        </form>
                    )}
                </Card>

                <AlertModal
                    isOpen={isAlertOpen}
                    onClose={() => setIsAlertOpen(false)}
                    title="Quiz Not Ready"
                    message="questions haven't been created"
                    type="info"
                />
            </main>
        </div>
    );
}
