'use client';

import React from 'react';
import UploadedMaterials from '@/components/UploadedMaterials';

export default function UploadedFilesPage() {
    return (
        <section className="flex flex-col gap-10 md:gap-16">


            <UploadedMaterials />
        </section>
    );
}
