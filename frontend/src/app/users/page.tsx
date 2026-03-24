'use client';

import React from 'react';
import TopicPerformance from '@/components/TopicPerformance';

export default function AnalyticsPage() {
    return (
        <section className="flex flex-col gap-10 md:gap-16">
            <TopicPerformance />
        </section>
    );
}
