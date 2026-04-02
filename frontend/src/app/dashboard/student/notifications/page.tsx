'use client';

import React from 'react';
import StudentNotifications from '@/components/StudentNotifications';

export default function NotificationsPage() {
    return (
        <div className="animate-fade-in mb-32">
            <div className="flex items-center gap-8 group" style={{ margin: '10px 0 10px 0' }}>
                <div className="flex flex-col relative">
                    <h2
                        className="text-4xl md:text-5xl font-black tracking-tighter"
                        style={{
                            color: '#000',
                            marginLeft: '1rem'
                        }}
                    >
                        Notifications
                    </h2>
                </div>
            </div>

            <StudentNotifications />
        </div>
    );
}
