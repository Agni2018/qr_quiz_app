'use client';

import React, { Suspense } from 'react';
import TopicManagement from '@/components/TopicManagement';

export default function ManageTopicsPage() {
    return (
        <section className="flex flex-col gap-10 md:gap-16">

            <Suspense fallback={
                <div className="flex justify-center items-center py-20">
                    <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                </div>
            }>
                <TopicManagement />
            </Suspense>
        </section>
    );
}
