'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Card from '@/components/Card';
import Pagination from '@/components/Pagination';
import { FaAward, FaTrophy, FaStar, FaBolt, FaUsers, FaLock, FaChevronDown, FaChevronUp } from 'react-icons/fa';

export default function StudentBadges() {
    const [allBadges, setAllBadges] = useState<any[]>([]);
    const [earnedBadges, setEarnedBadges] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showMore, setShowMore] = useState(false);
    const [earnedPage, setEarnedPage] = useState(1);
    const [lockedPage, setLockedPage] = useState(1);
    const itemsPerPage = 10;

    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    const isMobile = windowWidth < 768;

    const icons: { [key: string]: React.ReactNode } = {
        'FaAward': <FaAward />,
        'FaTrophy': <FaTrophy />,
        'FaStar': <FaStar />,
        'FaBolt': <FaBolt />,
        'FaUsers': <FaUsers />
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [allRes, earnedRes] = await Promise.all([
                    api.get('/badges'),
                    api.get('/badges/my-badges')
                ]);
                setAllBadges(allRes.data);
                setEarnedBadges(earnedRes.data);
            } catch (err) {
                console.error('Failed to fetch badges:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    const earnedIds = new Set(earnedBadges.map(b => b._id));
    const lockedBadges = allBadges.filter(b => !earnedIds.has(b._id));

    return (
        <div className="flex flex-col gap-12 px-4 md:px-0">
            {/* Earned Badges Section */}
        <div className="flex flex-col gap-8" >
                <div className="flex items-center gap-4">
                    <div className="w-1.5 h-8 bg-pink-500 rounded-full shadow-[0_0_15px_rgba(236,72,153,0.4)]"></div>
                    <h3 className="text-3xl font-black tracking-tight" style={{ color: '#000' }}>My Earned Collection</h3>
                </div>

                {earnedBadges.length === 0 ? (
                    <Card className="p-16 text-center border-dashed border-2 border-slate-200 rounded-[40px]" style={{ background: 'white', padding: 30, margin: '1rem', boxShadow: '0 4px 24px rgba(0,0,0,0.10)' }}>
                        <div className="w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-4xl grayscale opacity-60">🏆</div>
                        <h4 className="text-xl font-bold mb-2" style={{ color: '#000' }}>No badges earned yet</h4>
                        <p className="max-w-sm mx-auto" style={{ color: '#555' }}>Complete quizzes and achieve high scores to start your collection!</p>
                    </Card>
                ) : (
                    <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {earnedBadges.slice((earnedPage - 1) * itemsPerPage, earnedPage * itemsPerPage).map(badge => (
                            <Card key={badge._id} className="p-8 border-none hover:from-pink-500/10 transition-all group relative overflow-hidden flex flex-col items-center text-center gap-2 rounded-[2.5rem] shadow-xl" style={{padding:30, background: 'white', margin: '1rem', boxShadow: '0 4px 24px rgba(0,0,0,0.10), 0 1.5px 6px rgba(0,0,0,0.06)' }}>
                                <div className="absolute -top-4 -right-4 w-24 h-24 bg-pink-500/10 blur-3xl rounded-full group-hover:bg-pink-500/20 transition-all"></div>

                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-500/20 to-rose-500/20 border border-pink-500/30 flex items-center justify-center text-4xl text-pink-400 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-2xl shadow-pink-500/10">
                                    {icons[badge.icon] || <FaAward />}
                                </div>

                                <h4 className="text-2xl font-black group-hover:text-pink-500 transition-colors" style={{ color: '#000' }}>{badge.name}</h4>
                                <p className="text-sm mb-6 flex-1 leading-relaxed px-4" style={{ color: '#555' }}>{badge.description}</p>

                                <div className="px-6 py-2 rounded-full bg-pink-500/10 border border-pink-500/20">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-500">Achieved</span>
                                </div>
                            </Card>
                        ))}
                    </div>
                    {earnedBadges.length > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: isMobile ? '1rem 1rem 1.5rem' : '1rem 1.5rem 2rem' }}>
                            <Pagination
                                currentPage={earnedPage}
                                totalItems={earnedBadges.length}
                                itemsPerPage={itemsPerPage}
                                onPageChange={setEarnedPage}
                                isMobile={isMobile}
                            />
                        </div>
                    )}
                    </>
                )}
            </div>

            {/* Locked Badges / Discover More */}
            <div className="flex flex-col items-center gap-10 mt-8 mb-20">
                <button
                    onClick={() => setShowMore(!showMore)}
                    className="group flex items-center gap-4 px-10 py-5 rounded-[2rem] bg-white/5 border border-white/10 hover:bg-white/10 hover:border-pink-500/40 transition-all text-slate-300 font-black uppercase tracking-[0.2em] text-xs shadow-2xl"
                >
                    {showMore ? <FaChevronUp className="text-pink-500" /> : <FaChevronDown className="text-pink-500" />}
                    {showMore ? 'Hide Locked Badges' : 'Discover More Badges'}
                </button>

                {showMore && (
                    <div className="w-full flex flex-col gap-8 animate-in slide-in-from-top-8 duration-500">
                        <div className="flex items-center gap-4">
                            <div className="w-1.5 h-8 bg-slate-300 rounded-full"></div>
                            <h3 className="text-3xl font-black tracking-tight text-slate-400">Available Rewards</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {lockedBadges.slice((lockedPage - 1) * itemsPerPage, lockedPage * itemsPerPage).map(badge => (
                                <Card key={badge._id} className="p-8 border-slate-200 grayscale opacity-60 flex flex-col items-center text-center gap-2 rounded-[2.5rem] relative group overflow-hidden" style={{padding:30, background: 'white', margin: '1rem', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
                                    <div className="absolute inset-0 flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                        <div className="px-6 py-3 rounded-2xl bg-black/80 backdrop-blur-md border border-white/10 flex items-center gap-3">
                                            <FaLock className="text-pink-500 text-xs" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-white">Locked Reward</span>
                                        </div>
                                    </div>

                                    <div className="w-20 h-20 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-3xl text-slate-400 mb-6">
                                        {icons[badge.icon] || <FaAward />}
                                    </div>

                                    <h4 className="text-xl font-bold" style={{ color: '#333' }}>{badge.name}</h4>
                                    <p className="text-xs mb-6 px-6 leading-relaxed" style={{ color: '#555' }}>{badge.description}</p>

                                    <div className="text-[10px] font-black uppercase tracking-widest py-3 border-t border-slate-200 w-full" style={{ color: '#555' }}>
                                        Target: <span className="ml-1" style={{ color: '#333' }}>{badge.threshold} {badge.type === 'points' ? 'pts' : badge.type === 'streak' ? 'days' : 'items'}</span>
                                    </div>
                                </Card>
                            ))}
                        </div>
                        {lockedBadges.length > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: isMobile ? '1rem 1rem 1.5rem' : '1rem 1.5rem 2rem' }}>
                                <Pagination
                                    currentPage={lockedPage}
                                    totalItems={lockedBadges.length}
                                    itemsPerPage={itemsPerPage}
                                    onPageChange={setLockedPage}
                                    isMobile={isMobile}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
