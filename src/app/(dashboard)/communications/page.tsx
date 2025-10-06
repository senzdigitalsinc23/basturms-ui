
'use client';
import { ProtectedRoute } from '@/components/protected-route';
import { StudentCommunication } from '@/components/communications/student-communication';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Mail, Bell, CheckCheck } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Notification, useNotifications, toggleNotificationRead, markAllAsRead as globalMarkAllAsRead } from '@/lib/notifications';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


function NotificationsList() {
    const notifications = useNotifications();

    const toggleReadStatus = (id: string) => {
        toggleNotificationRead(id);
    };

    const markAllAsRead = () => {
        globalMarkAllAsRead();
    };
    
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                 <div>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>
                        Review all system notifications and alerts.
                    </CardDescription>
                </div>
                <Button onClick={markAllAsRead} disabled={notifications.every(n => n.read)} size="sm">
                    <CheckCheck className="mr-2 h-4 w-4" />
                    Mark all as read
                </Button>
            </CardHeader>
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
                    {notifications.length === 0 && <p className="p-8 text-center text-muted-foreground">No notifications found.</p>}
                </ul>
            </CardContent>
        </Card>
    )
}

export default function CommunicationsPage() {
  const { user } = useAuth();
  
  if (user?.role === 'Admin') {
    return (
      <ProtectedRoute allowedRoles={['Admin', 'Teacher']}>
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">Communications</h1>
                <p className="text-muted-foreground">
                    Manage all school communications, including internal messaging and system-wide notifications.
                </p>
            </div>
            <Tabs defaultValue="messaging">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="messaging">Student Messaging</TabsTrigger>
                    <TabsTrigger value="notifications">System Notifications</TabsTrigger>
                </TabsList>
                <TabsContent value="messaging">
                    <StudentCommunication />
                </TabsContent>
                <TabsContent value="notifications">
                    <NotificationsList />
                </TabsContent>
            </Tabs>
        </div>
      </ProtectedRoute>
    );
  }

  // Default view for Teachers (and other roles)
  return (
    <ProtectedRoute allowedRoles={['Admin', 'Teacher']}>
       <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Student Communications</h1>
          <p className="text-muted-foreground">
            View and respond to messages from students.
          </p>
        </div>
        <StudentCommunication />
      </div>
    </ProtectedRoute>
  );
}
