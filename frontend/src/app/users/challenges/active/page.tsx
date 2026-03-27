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
                    <Button variant="primary" className="h-12 px-6 rounded-2xl bg-orange-500 hover:bg-orange-600 border-none shadow-xl shadow-orange-500/30 transition-all flex items-center gap-3 group" style={{ background: '#f97316', color: 'white' }}>
                        <FaArrowLeft className="text-white text-sm group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-black text-white tracking-widest uppercase">Back to Creator</span>
                    </Button>
                </Link>
            </div>

            <ActiveChallengesList />
        </section>
    );
}
