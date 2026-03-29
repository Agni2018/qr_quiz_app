'use client';

import React from 'react';
import StudentExplore from '@/components/StudentExplore';

export default function ExplorePage() {
    return (
        <div className="animate-fade-in mb-24" >
            <div className="flex items-center gap-8 mb-32 group" style={{ margin: '10px 0 50px 0' }}>
                
                <div className="flex flex-col" >
                    <h2
                        className="text-7xl font-black tracking-tighter"
                        style={{
                            backgroundImage: 'linear-gradient(to right, #8b5cf6, #6366f1)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            marginLeft:20
                        }}
                    >
                        Explore Topics
                    </h2>
                   
                </div>
            </div>

            <StudentExplore />
        </div>
    );
}
