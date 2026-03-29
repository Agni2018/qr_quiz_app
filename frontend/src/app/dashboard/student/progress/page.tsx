'use client';

import React from 'react';
import StudentProgress from '@/components/StudentProgress';

export default function ProgressPage() {
    return (
        <div className="animate-fade-in mb-24" >
            <StudentProgress titleComponent={
                <div className="flex items-center gap-8 group" style={{ margin: '30px 0 50px 0' }}>
                    
                    <div className="flex flex-col" >
                        <h2
                            className="text-7xl font-black tracking-tighter"
                            style={{
                                backgroundImage: 'linear-gradient(to right, var(--primary), var(--secondary))',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                marginLeft:10

                            }}
                        >
                            Manage Topics
                        </h2>
                        <div className="h-2 w-32 rounded-full mt-2 opacity-40 bg-gradient-to-r from-primary to-transparent" />
                    </div>
                </div>
            } />
        </div>
    );
}
