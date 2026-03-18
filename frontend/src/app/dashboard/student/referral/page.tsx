'use client';

import React from 'react';
import StudentReferral from '@/components/StudentReferral';

export default function ReferralPage() {
    return (
        <div className="animate-fade-in">
            <h1 className="text-4xl font-black mb-2 tracking-tight" style={{margin: '2rem 1rem 2rem 1rem'}}>Referral Program</h1>
            <p className="text-slate-500 font-medium text-lg" style={{margin: '1rem 1rem 2rem 1rem'}}>Earn bonus points by inviting your friends to the platform!</p>
            <StudentReferral />
        </div>
    );
}
