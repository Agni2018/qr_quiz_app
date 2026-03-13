'use client';

import React from 'react';
import StudentMaterials from '@/components/StudentMaterials';

export default function MaterialsPage() {
    return (
        <div className="animate-fade-in mb-32">
            <div className="flex items-center gap-8 mb-32 group" style={{ margin: '10px 0 50px 0' }}>
                <div style={{
                    width: '5rem',
                    height: '5rem',
                    borderRadius: '1.5rem',
                    background: 'linear-gradient(135deg, #f43f5e, #fb7185)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.25rem',
                    boxShadow: '0 10px 40px rgba(244, 63, 94, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    transform: 'rotate(-3deg)'
                }} className="group-hover:rotate-0 transition-transform duration-500">
                    📚
                </div>
                <div className="flex flex-col">
                    <h2
                        className="text-7xl font-black tracking-tighter"
                        style={{
                            backgroundImage: 'linear-gradient(to right, #f43f5e, #fb7185)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}
                    >
                        Study Materials
                    </h2>
                    <div className="h-2 w-32 rounded-full mt-2 opacity-40 bg-gradient-to-r from-[#f43f5e] to-transparent" />
                </div>
            </div>

            <StudentMaterials />
        </div>
    );
}
