'use client';

import StudentBadges from '@/components/StudentBadges';
import BadgeChallengeHeader from '@/components/BadgeChallengeHeader';

export default function StudentBadgesPage() {
    return (
        <div className="animate-fade-in mb-24">
            <BadgeChallengeHeader type="student" activeTab="badges" />

            <div className="mt-12">
                <StudentBadges />
            </div>
        </div>
    );
}
