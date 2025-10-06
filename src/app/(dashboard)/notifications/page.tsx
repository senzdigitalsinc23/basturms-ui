'use client';
import { useState, useEffect } from 'react';
import { Notification, useNotifications, toggleNotificationRead, markAllAsRead as globalMarkAllAsRead } from '@/lib/notifications';
import { ProtectedRoute } from '@/components/protected-route';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Mail, Bell, CheckCheck } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

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

