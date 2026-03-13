'use client';

import React from 'react';
import UploadedMaterials from '@/components/UploadedMaterials';

export default function UploadedFilesPage() {
    return (
        <section className="flex flex-col gap-10 md:gap-16">
            <h2 style={{
                fontSize: '2.75rem',
                fontWeight: 900,
                letterSpacing: '-0.03em',
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                color: 'var(--text-primary)'
            }}>
                <span style={{ fontSize: '1.5rem', opacity: 0.8 }}>📂</span>
                <span style={{
                    backgroundImage: 'linear-gradient(to right, var(--primary), var(--secondary))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                }}>
                    Uploaded Study Materials
                </span>
            </h2>

            <UploadedMaterials />
        </section>
    );
}
