'use client';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OnboardingTips } from '@/components/dashboard/onboarding-tips';
import { Laptop, Book, History } from 'lucide-react';
import { ProtectedRoute } from '@/components/protected-route';

export default function ITSupportDashboardPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute allowedRoles={['I.T Support']}>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">I.T Support Dashboard</h1>
          <p className="text-muted-foreground">Welcome, {user?.name?.split(' ')[0]}. Here are your open tickets.</p>
        </div>
        <OnboardingTips />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
              <Laptop className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Assigned to you</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Knowledge Base</CardTitle>
              <Book className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12 articles</div>
              <p className="text-xs text-muted-foreground">Recently updated</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ticket History</CardTitle>
              <History className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2 resolved</div>
              <p className="text-xs text-muted-foreground">In the last 24 hours</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
