'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaAward, FaStar } from 'react-icons/fa';
import Button from './Button';

interface BadgeChallengeHeaderProps {
    type: 'student' | 'admin';
    activeTab: 'badges' | 'challenges';
}

export default function BadgeChallengeHeader({ type, activeTab }: BadgeChallengeHeaderProps) {
    const isStudent = type === 'student';
    
    const badgesPath = isStudent ? '/dashboard/student/badges' : '/users/badges';
    const challengesPath = isStudent ? '/dashboard/student/challenges' : '/users/challenges';

    const badgesLabel = isStudent ? 'My Badges' : 'Badge Management';
    const challengesLabel = isStudent ? 'My Weekly Challenges' : 'Challenge Management';

    return (
        <div 
            className="flex flex-col gap-8 md:gap-12 animate-fade-in"
            style={{ marginTop: '50px', marginBottom: '50px', marginLeft: '10px', marginRight: '10px' }}
        >
            {/* Main Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 group">
                <div 
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-xl transition-all duration-500 transform group-hover:rotate-6 ${
                        activeTab === 'badges' 
                        ? 'bg-gradient-to-br from-pink-500 to-rose-500 shadow-rose-500/30' 
                        : 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-yellow-500/30'
                    }`}
                >
                    {activeTab === 'badges' ? '🏆' : '⭐'}
                </div>
                <div className="flex flex-col gap-1">
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter bg-gradient-to-r from-white via-slate-400 to-slate-500 bg-clip-text text-transparent">
                        {activeTab === 'badges' ? badgesLabel : challengesLabel}
                    </h1>
                    <div className={`h-1.5 w-24 rounded-full bg-gradient-to-r ${
                        activeTab === 'badges' ? 'from-rose-500' : 'from-yellow-500'
                    } to-transparent opacity-50`} />
                </div>
            </div>

            {/* Navigation Tabs */}
            <div 
                className="flex flex-col sm:flex-row items-center p-2 md:p-3 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl md:rounded-[2rem] w-full sm:w-fit gap-4 sm:gap-8"
                style={{ marginTop: '20px' }}
            >
                <Link href={badgesPath} className="w-full sm:w-auto">
                    <Button
                        variant={activeTab === 'badges' ? 'primary' : 'ghost'}
                        className={`h-12 md:h-14 px-6 md:px-10 rounded-xl md:rounded-2xl font-bold transition-all flex items-center justify-center gap-3 w-full sm:w-auto ${
                            activeTab === 'badges' 
                            ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                            : 'text-slate-400 hover:text-white hover:bg-white/10 bg-white/5 sm:bg-transparent'
                        }`}
                    >
                        <FaAward className={activeTab === 'badges' ? 'text-white' : 'text-slate-500'} size={20} />
                        <span className="text-base md:text-lg">{isStudent ? 'Badges' : 'Badge Rewards'}</span>
                    </Button>
                </Link>

                <div className="hidden sm:block w-px h-8 bg-white/10 mx-2" />

                <Link href={challengesPath} className="w-full sm:w-auto">
                    <Button
                        variant={activeTab === 'challenges' ? 'primary' : 'ghost'}
                        className={`h-12 md:h-14 px-6 md:px-10 rounded-xl md:rounded-2xl font-bold transition-all flex items-center justify-center gap-3 w-full sm:w-auto ${
                            activeTab === 'challenges' 
                            ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                            : 'text-slate-400 hover:text-white hover:bg-white/10 bg-white/5 sm:bg-transparent'
                        }`}
                    >
                        <FaStar className={activeTab === 'challenges' ? 'text-white' : 'text-yellow-500'} size={20} />
                        <span className="text-base md:text-lg">{isStudent ? 'Weekly Challenges' : 'Challenges'}</span>
                    </Button>
                </Link>
            </div>
        </div>
    );
}
