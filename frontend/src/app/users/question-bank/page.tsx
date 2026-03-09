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
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem',
                color: 'var(--text-primary)'
            }}>
                <span style={{
                    width: '4rem',
                    height: '4rem',
                    borderRadius: '1.25rem',
                    background: 'linear-gradient(135deg, #3b82f6, #10b981)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.75rem',
                    boxShadow: '0 8px 30px rgba(59, 130, 246, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    📚
                </span>
                <span style={{
                    backgroundImage: 'linear-gradient(to right, #3b82f6, #10b981)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                }}>
                    Reusable Questions
                </span>
            </h2>
            <ReusableLibrary />
        </section>
    );
}
