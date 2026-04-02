'use client';

import React from 'react';
import StudentExplore from '@/components/StudentExplore';

export default function ExplorePage() {
    return (
        <div className="animate-fade-in mb-24" >
            <div className="flex items-center gap-8 group" style={{ margin: '10px 0 30px 0' }}>
                <div className="flex flex-col" >
                    <h2
                        className="text-4xl md:text-5xl font-black tracking-tighter"
                        style={{
                            color: '#000',
                            marginLeft: 10
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
