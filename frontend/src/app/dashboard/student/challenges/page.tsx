'use client';

import WeeklyChallenges from '@/components/WeeklyChallenges';
import BadgeChallengeHeader from '@/components/BadgeChallengeHeader';

export default function ChallengesPage() {
    return (
        <div className="animate-fade-in mb-24">
            <BadgeChallengeHeader type="student" activeTab="challenges" />
            <WeeklyChallenges />
        </div>
    );
}
