'use client';

import React from 'react';
import ReusableLibrary from '@/components/ReusableLibrary';

export default function QuestionBankPage() {
    return (
        <section className="flex flex-col gap-10 md:gap-16">
            <h2 style={{
                fontSize: '2.75rem',
                fontWeight: 900,
                letterSpacing: '-0.03em',
                marginBottom: '0.75rem',
                marginLeft:5,
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem',
                color: 'var(--primary)'
            }}>
                Reusable Questions
            </h2>
            <ReusableLibrary />
        </section>
    );
}
