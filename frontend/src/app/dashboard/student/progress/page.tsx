'use client';

import React from 'react';
import StudentProgress from '@/components/StudentProgress';

export default function ProgressPage() {
    return (
        <div className="animate-fade-in mb-24" >
            <StudentProgress titleComponent={
                <div className="flex items-center gap-8 group" style={{ margin: '10px 0 10px 0' }}>
                    
                    <div className="flex flex-col" >
                        <h2
                            className="text-4xl md:text-5xl font-black tracking-tighter"
                            style={{
                                color: '#000',
                                marginLeft:10

                            }}
                        >
                            Manage Topics
                        </h2>
                    </div>
                </div>
            } />
        </div>
    );
}
