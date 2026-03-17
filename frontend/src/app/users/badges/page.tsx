'use client';

import React from 'react';
import BadgeManagement from '@/components/BadgeManagement';

export default function BadgesPage() {
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
                    background: 'linear-gradient(135deg, #f59e0b, #ec4899)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.75rem',
                    boxShadow: '0 8px 30px rgba(245, 158, 11, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    marginLeft:'10px'
                }}>
                    🏆
                </span>
                <span style={{
                    backgroundImage: 'linear-gradient(to right, #f59e0b, #ec4899)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    marginRight:'10px'
                }}>
                    Badge Management
                </span>
            </h2>
            <BadgeManagement />
        </section>
    );
}
