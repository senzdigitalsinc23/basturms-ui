
'use client';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OnboardingTips } from '@/components/dashboard/onboarding-tips';
import { Users, BookCopy, GraduationCap } from 'lucide-react';
import { ProtectedRoute } from '@/components/protected-route';
import { useEffect, useState } from 'react';
import { getStaff, getStudentProfiles } from '@/lib/store';

export default function HeadmasterDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStaff: 0,
    totalStudents: 0,
    curriculumCoverage: '88%', // Placeholder
  });

  useEffect(() => {
    const allStaff = getStaff();
    const allStudents = getStudentProfiles();

    setStats(prev => ({
        ...prev,
        totalStaff: allStaff.length,
        totalStudents: allStudents.length,
    }));
  }, []);

  return (
    <ProtectedRoute allowedRoles={['Headmaster']}>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Headmaster Dashboard</h1>
          <p className="text-muted-foreground">School-wide overview for {user?.name}.</p>
        </div>
        <OnboardingTips />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStaff}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <GraduationCap className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Curriculum Coverage</CardTitle>
              <BookCopy className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.curriculumCoverage}</div>
              <p className="text-xs text-muted-foreground">On track for the semester</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
