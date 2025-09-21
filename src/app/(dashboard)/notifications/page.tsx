'use client';
import { useState, useEffect } from 'react';
import { notifications as initialNotifications, Notification } from '@/lib/notifications';
import { ProtectedRoute } from '@/components/protected-route';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Mail, Bell, CheckCheck } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        setNotifications(initialNotifications);
    }, []);

    const toggleReadStatus = (id: string) => {
        setNotifications(prev => 
            prev.map(n => n.id === id ? { ...n, read: !n.read } : n)
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    return (
        <ProtectedRoute allowedRoles={['Admin']}>
             <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold font-headline">Notifications</h1>
                        <p className="text-muted-foreground">
                            Review all system notifications and alerts.
                        </p>
                    </div>
                    <Button onClick={markAllAsRead} disabled={notifications.every(n => n.read)} size="sm">
                        <CheckCheck className="mr-2 h-4 w-4" />
                        Mark all as read
                    </Button>
                </div>
                <Card>
                    <CardContent className="p-0">
                        <ul className="divide-y">
                            {notifications.map(notification => (
                                <li key={notification.id} className={cn("flex items-start gap-4 p-4", !notification.read && "bg-blue-50/50")}>
                                    <div className={cn("p-2 rounded-full", notification.read ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary")}>
                                        <Bell className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <Link href={notification.href}>
                                            <p className="font-medium hover:underline">{notification.title}</p>
                                        </Link>
                                        <p className="text-sm text-muted-foreground">{notification.description}</p>
                                    </div>
                                    <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => toggleReadStatus(notification.id)}
                                        title={notification.read ? 'Mark as unread' : 'Mark as read'}
                                    >
                                        {notification.read ? <Mail className="h-5 w-5" /> : <Check className="h-5 w-5 text-green-600" />}
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
             </div>
        </ProtectedRoute>
    );
}
