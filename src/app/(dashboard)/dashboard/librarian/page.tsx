'use client';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OnboardingTips } from '@/components/dashboard/onboarding-tips';
import { Book, BookCheck, BookX } from 'lucide-react';
import { ProtectedRoute } from '@/components/protected-route';

export default function LibrarianDashboardPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute allowedRoles={['Librarian']}>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Library Dashboard</h1>
          <p className="text-muted-foreground">Welcome, {user?.name}. Here's the library status.</p>
        </div>
        <OnboardingTips />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Books</CardTitle>
              <Book className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12,450</div>
              <p className="text-xs text-muted-foreground">+50 new arrivals</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Books Loaned</CardTitle>
              <BookCheck className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">312</div>
              <p className="text-xs text-muted-foreground">As of today</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Books</CardTitle>
              <BookX className="h-5 w-5 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">15</div>
              <p className="text-xs text-muted-foreground">Send reminders</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
