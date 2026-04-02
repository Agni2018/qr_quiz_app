'use client';

import React from 'react';
import ActiveChallengesList from '@/components/ActiveChallengesList';

export default function ActiveChallengesPage() {
    return (
        <section className="flex flex-col gap-4 max-w-7xl mx-auto py-8 animate-fade-in" style={{ paddingLeft: '20px', paddingRight: '20px' }}>
            <ActiveChallengesList />
        </section>
    );
}
