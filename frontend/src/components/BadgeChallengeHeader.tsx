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
            className="flex flex-col gap-6 md:gap-8 animate-fade-in"
            style={{ marginTop: '20px', marginBottom: '40px' }}
        >
            {/* Main Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 group">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-slate-900" style={{color:'black', marginLeft: '1rem'}}>
                        {activeTab === 'badges' ? badgesLabel : challengesLabel}
                    </h1>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div 
                className="flex flex-col sm:flex-row items-center p-2 bg-white backdrop-blur-xl border border-slate-200 rounded-full w-full sm:w-fit gap-2 shadow-2xl overflow-hidden"
                style={{ marginTop: '20px', padding: 12 }}
            >
                <Link href={badgesPath} className="w-full sm:w-auto">
                    <Button
                        variant={activeTab === 'badges' ? 'primary' : 'ghost'}
                        className={`h-11 md:h-12 px-8 rounded-full font-bold transition-all flex items-center justify-center gap-3 w-full sm:w-auto border-none ${
                            activeTab === 'badges' 
                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                            : 'text-slate-500 hover:text-black hover:bg-slate-50 bg-transparent'
                        }`}
                        style={activeTab === 'badges' ? { background: '#f97316', color: 'white' } : {}}
                    >
                        <FaAward className={activeTab === 'badges' ? 'text-white' : 'text-slate-500'} size={18} />
                        <span className="text-sm md:text-base">{isStudent ? 'Badges' : 'Badge Rewards'}</span>
                    </Button>
                </Link>

                <Link href={challengesPath} className="w-full sm:w-auto">
                    <Button
                        variant={activeTab === 'challenges' ? 'primary' : 'ghost'}
                        className={`h-11 md:h-12 px-8 rounded-full font-bold transition-all flex items-center justify-center gap-3 w-full sm:w-auto border-none ${
                            activeTab === 'challenges' 
                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                            : 'text-slate-500 hover:text-black hover:bg-slate-50 bg-transparent'
                        }`}
                        style={activeTab === 'challenges' ? { background: '#f97316', color: 'white' } : {}}
                    >
                        <FaStar className={activeTab === 'challenges' ? 'text-white' : 'text-yellow-500'} size={18} />
                        <span className="text-sm md:text-base">{isStudent ? 'Weekly Challenges' : 'Challenges'}</span>
                    </Button>
                </Link>
            </div>
        </div>
    );
}
