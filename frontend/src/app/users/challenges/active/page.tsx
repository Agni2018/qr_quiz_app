'use client';

import React from 'react';
import ActiveChallengesList from '@/components/ActiveChallengesList';
import Link from 'next/link';
import Button from '@/components/Button';
import { FaArrowLeft, FaPlus } from 'react-icons/fa';

export default function ActiveChallengesPage() {
    return (
        <section className="flex flex-col gap-4 max-w-7xl mx-auto py-8 animate-fade-in" style={{ paddingLeft: '20px', paddingRight: '20px' }}>
            <div className="flex justify-end mb-4">
                <Link href="/users/challenges">
                    <Button variant="ghost" className="h-11 px-5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center gap-3 group shadow-lg">
                        <FaArrowLeft className="text-emerald-500 text-xs group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs font-black text-white tracking-widest uppercase">Back to Creator</span>
                    </Button>
                </Link>
            </div>

            <ActiveChallengesList />
        </section>
    );
}
