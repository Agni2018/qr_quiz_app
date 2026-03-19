'use client';

import React from 'react';
import ActiveChallengesList from '@/components/ActiveChallengesList';
import Link from 'next/link';
import Button from '@/components/Button';
import { FaArrowLeft, FaPlus } from 'react-icons/fa';

export default function ActiveChallengesPage() {
    return (
        <section className="flex flex-col gap-10 md:gap-16 max-w-7xl mx-auto py-10 px-4 sm:px-10 animate-fade-in">
            {/* HEADER & NAV */}
            <div className="flex justify-end items-center gap-8 mb-4">
                
                <div className="flex items-center gap-4">
                    <Link href="/users/challenges">
                        <Button variant="ghost" className="h-16 px-8 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all flex items-center gap-3 font-black uppercase tracking-widest text-xs">
                            <FaArrowLeft className="text-primary" /> Back to Creator
                        </Button>
                    </Link>
                </div>
            </div>

            <ActiveChallengesList />
        </section>
    );
}
