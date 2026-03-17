'use client';

import React from 'react';
import TopicManagement from '@/components/TopicManagement';

export default function ManageTopicsPage() {
    return (
        <section className="flex flex-col gap-10 md:gap-16">
            <h2 style={{
                fontSize: '2.75rem',
                fontWeight: 900,
                letterSpacing: '-0.03em',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                color: 'var(--text-primary)',
                marginBottom: '1rem'
            }}>
                <span style={{ fontSize: '1.5rem', opacity: 0.8}}>🎓</span>
                <span style={{
                    backgroundImage: 'linear-gradient(to right, var(--primary), var(--secondary))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    margin:'0 1rem 1rem 0'
                }}>
                    Manage Topics
                </span>
            </h2>

            <TopicManagement />
        </section>
    );
}
