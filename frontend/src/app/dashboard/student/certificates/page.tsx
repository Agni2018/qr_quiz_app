'use client';

import React from 'react';
import StudentCertificates from '@/components/StudentCertificates';

export default function CertificatesPage() {
    return (
        <div className="animate-fade-in mb-24">
            <div className="flex items-center gap-8 group" style={{ margin: '10px 0 30px 0' }}>
                <div className="flex flex-col">
                    <h2
                        className="text-4xl md:text-5xl font-black tracking-tighter"
                        style={{
                            color: '#000',
                            marginLeft: 10
                        }}
                    >
                        Certificates
                    </h2>
                    <div className="h-2 w-32 rounded-full mt-2 opacity-40 bg-gradient-to-r from-primary to-transparent" />
                </div>
            </div>

            <StudentCertificates />
        </div>
    );
}
