'use client';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OnboardingTips } from '@/components/dashboard/onboarding-tips';
import { BookCopy, GraduationCap, Users } from 'lucide-react';
import { ProtectedRoute } from '@/components/protected-route';

export default function TeacherDashboardPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute allowedRoles={['Teacher']}>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Teacher Dashboard</h1>
          <p className="text-muted-foreground">Welcome, {user?.name}. Your dashboard is ready.</p>
        </div>

        <OnboardingTips />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                My Students
              </CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">128</div>
              <p className="text-xs text-muted-foreground">
                Across 5 classes
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                My Courses
              </CardTitle>
              <BookCopy className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">
                This semester
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Grading Progress
              </CardTitle>
              <GraduationCap className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">75%</div>
              <p className="text-xs text-muted-foreground">
                3 of 4 assignments graded
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
