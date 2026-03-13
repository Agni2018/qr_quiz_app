'use client';

import React from 'react';
import StudentExplore from '@/components/StudentExplore';

export default function ExplorePage() {
    return (
        <div className="animate-fade-in mb-24" >
            <div className="flex items-center gap-8 mb-32 group" style={{ margin: '10px 0 50px 0' }}>
                <div style={{
                    width: '5rem',
                    height: '5rem',
                    borderRadius: '1.5rem',
                    background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.25rem',
                    boxShadow: '0 10px 40px rgba(139, 92, 246, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    transform: 'rotate(-3deg)'
                }} className="group-hover:rotate-0 transition-transform duration-500">
                    💡
                </div>
                <div className="flex flex-col" >
                    <h2
                        className="text-7xl font-black tracking-tighter"
                        style={{
                            backgroundImage: 'linear-gradient(to right, #8b5cf6, #6366f1)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}
                    >
                        Explore Topics
                    </h2>
                    <div className="h-2 w-32 rounded-full mt-2 opacity-40 bg-gradient-to-r from-[#8b5cf6] to-transparent" />
                </div>
            </div>

            <StudentExplore />
        </div>
    );
}
