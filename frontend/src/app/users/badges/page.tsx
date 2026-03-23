'use client';

import BadgeManagement from '@/components/BadgeManagement';
import BadgeChallengeHeader from '@/components/BadgeChallengeHeader';

export default function BadgesPage() {
    return (
        <div className="animate-fade-in mb-24">
            <BadgeChallengeHeader type="admin" activeTab="badges" />
            <BadgeManagement />
        </div>
    );
}
