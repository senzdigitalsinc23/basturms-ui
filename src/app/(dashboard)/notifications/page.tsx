
'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function NotificationsPage() {
    const router = useRouter();
    
    // Redirect to the new communications page
    useEffect(() => {
        router.replace('/communications');
    }, [router]);

    return (
        <div className="flex items-center justify-center h-full">
            <p>Redirecting to communications...</p>
        </div>
    );
}
