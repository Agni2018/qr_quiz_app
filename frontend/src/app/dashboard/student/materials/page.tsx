'use client';

import React from 'react';
import StudentMaterials from '@/components/StudentMaterials';

export default function MaterialsPage() {
    return (
        <div className="animate-fade-in mb-32">
            <div className="flex items-center gap-8 group" style={{ margin: '10px 0 10px 0' }}>
                <div className="flex flex-col">
                    <h2
                        className="text-4xl md:text-5xl font-black tracking-tighter"
                        style={{
                            color: '#000',
                            marginLeft: '1.5rem'
                        }}
                    >
                        Study Materials
                    </h2>
                </div>
            </div>

            <StudentMaterials />
        </div>
    );
}
