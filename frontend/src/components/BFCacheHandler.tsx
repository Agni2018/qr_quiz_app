'use client';

import { useEffect } from 'react';

export default function BFCacheHandler() {
    useEffect(() => {
        /**
         * Global BFCache Neutralization
         * 
         * Browsers use "Back-Forward Cache" (bfcache) to keep a snapshot of a page in memory.
         * When a user hits "Back", the browser might show the cached page without hitting the server or middleware.
         * This script detects if the page was served from bfcache and forces a reload, 
         * which then triggers the middleware to re-verify authentication.
         */
        const handlePageShow = (event: PageTransitionEvent) => {
            if (event.persisted) {
                // Page was restored from bfcache, force a reload to re-run middleware checks
                window.location.reload();
            }
        };

        window.addEventListener('pageshow', handlePageShow);

        return () => {
            window.removeEventListener('pageshow', handlePageShow);
        };
    }, []);

    // This component doesn't render anything UI-wise
    return null;
}
