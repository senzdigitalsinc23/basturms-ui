'use client';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { OnboardingTips } from '@/components/dashboard/onboarding-tips';
import { Camera, Shield, UserCheck, Clock } from 'lucide-react';
import { ProtectedRoute } from '@/components/protected-route';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const recentEvents = [
    { time: '2 mins ago', event: 'Unauthorized Access Attempt', location: 'Main Gate', status: 'Alert' },
    { time: '1 hour ago', event: 'Scheduled Patrol', location: 'Zone 2', status: 'Normal' },
    { time: '3 hours ago', event: 'Visitor Checkout Overdue', location: 'Reception', status: 'Warning' },
    { time: '8 hours ago', event: 'Perimeter Check', location: 'All Zones', status: 'Normal' },
];

export default function SecurityDashboardPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute allowedRoles={['Security', 'Admin']}>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Security Command Center</h1>
          <p className="text-muted-foreground">Welcome, Officer {user?.name.split(' ').pop()}.</p>
        </div>
        <OnboardingTips />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
              <Shield className="h-5 w-5 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">1</div>
              <p className="text-xs text-muted-foreground">Unresolved incident in Zone 3</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Visitor Check-ins</CardTitle>
              <UserCheck className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7</div>
              <p className="text-xs text-muted-foreground">Today</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CCTV Status</CardTitle>
              <Camera className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">48/48</div>
              <p className="text-xs text-muted-foreground">All cameras operational</p>
            </CardContent>
          </Card>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Recent Security Events</CardTitle>
                <CardDescription>A log of the most recent events on campus.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Time</TableHead>
                            <TableHead>Event</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {recentEvents.map((event, index) => (
                            <TableRow key={index}>
                                <TableCell className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground"/>
                                    {event.time}
                                </TableCell>
                                <TableCell>{event.event}</TableCell>
                                <TableCell>{event.location}</TableCell>
                                <TableCell>
                                    <Badge variant={event.status === 'Alert' ? 'destructive' : (event.status === 'Warning' ? 'secondary' : 'outline')}>
                                        {event.status}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
