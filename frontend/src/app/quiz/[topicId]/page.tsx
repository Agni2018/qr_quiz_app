'use client';

import { useState, useEffect, use } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';

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

    useEffect(() => {
        api.get(`/topics/${topicId}`)
            .then(res => setTopic(res.data))
            .catch(err => console.error(err));

        api.get(`/questions/topic/${topicId}`)
            .then(res => setQuestionCount(res.data.length))
            .catch(err => {
                console.error(err);
                setQuestionCount(0);
            });
    }, [topicId]);

    const handleStart = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user.name || !user.email || !user.phone) {
            setError('All fields are required');
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
                localStorage.setItem('quizUser', JSON.stringify(user));
                router.push(`/quiz/${topicId}/play`);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to start quiz');
            if (err.response?.status === 403) {
                // already attempted
            }
        } finally {
            setLoading(false);
        }
    };

    if (!topic || questionCount === null) {
        return (
            <div
                className="container flex justify-center items-center pt-16"
            >
                <div
                    className="glass p-10 rounded-2xl text-lg"
                >
                    Loading Quiz...
                </div>
            </div>
        );
    }

    return (
        <main className="container flex items-center justify-center py-20">
            <Card
                className="max-w-[500px] w-full p-12 md:p-16 rounded-[40px] border border-white/5 bg-slate-900/60 backdrop-blur-3xl shadow-3xl relative overflow-hidden"
            >
                {/* Background accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 rounded-full blur-3xl -mr-16 -mt-16"></div>

                {/* Topic Header */}
                <div className="text-center mb-12">
                    <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center text-3xl mx-auto mb-6">
                        🎯
                    </div>
                    <h1 className="text-3xl font-black text-white leading-tight mb-3">
                        {topic.name}
                    </h1>
                    <p className="text-slate-400 font-medium leading-relaxed">
                        {topic.description}
                    </p>
                </div>

                {/* No Questions State */}
                {questionCount === 0 ? (
                    <div className="text-center py-16 px-8 bg-violet-600/5 rounded-3xl border-2 border-dashed border-violet-500/20">
                        <div className="text-5xl mb-6">📝</div>
                        <h3 className="text-2xl font-black text-violet-400 mb-2">
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
                        <div className="flex flex-col gap-5">
                            <Input
                                label="Full Name"
                                value={user.name}
                                onChange={e =>
                                    setUser({ ...user, name: e.target.value })
                                }
                                placeholder="Enter your name"
                                className="!p-4"
                            />

                            <Input
                                label="Email Address"
                                type="email"
                                value={user.email}
                                onChange={e =>
                                    setUser({ ...user, email: e.target.value })
                                }
                                placeholder="name@email.com"
                                className="!p-4"
                            />

                            <Input
                                label="Phone Number"
                                type="tel"
                                value={user.phone}
                                onChange={e =>
                                    setUser({ ...user, phone: e.target.value })
                                }
                                placeholder="10-digit number"
                                className="!p-4"
                            />
                        </div>

                        {error && (
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center font-bold">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-6 py-5 rounded-2xl text-lg font-black shadow-xl shadow-violet-500/20 bg-violet-500 text-white hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            {loading ? 'Preparing Session...' : '🚀 Start Quiz Challenge'}
                        </Button>

                        <p className="text-center text-[0.65rem] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">
                            One attempt allowed per person
                        </p>
                    </form>
                )}
            </Card>
        </main>
    );
}
