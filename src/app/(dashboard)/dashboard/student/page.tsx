
'use client';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OnboardingTips } from '@/components/dashboard/onboarding-tips';
import { BookCopy, GraduationCap, PenSquare } from 'lucide-react';
import { ProtectedRoute } from '@/components/protected-route';
import { useEffect, useState } from 'react';
import { getStudentProfileByUserId, getStudentProfiles } from '@/lib/store';
import { StudentProfile } from '@/lib/types';

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);

  useEffect(() => {
    if (user) {
        const studentProfiles = getStudentProfiles();
        const currentProfile = studentProfiles.find(p => p.contactDetails.email === user.email);
        setProfile(currentProfile || null);
    }
  }, [user]);

  const overallGrade = profile?.academicRecords?.[0]?.grade || 'N/A';
  const gpa = '3.7'; // Placeholder
  const coursesCount = profile?.academicRecords?.length || 0;
  const assignmentsDue = 3; // Placeholder

  return (
    <ProtectedRoute allowedRoles={['Student']}>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Student Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name.split(' ')[0]}!</p>
        </div>

        <OnboardingTips />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                My Courses
              </CardTitle>
              <BookCopy className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{coursesCount}</div>
              <p className="text-xs text-muted-foreground">
                Enrolled this semester
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Overall Grade
              </CardTitle>
              <GraduationCap className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallGrade}</div>
              <p className="text-xs text-muted-foreground">
                GPA: {gpa}
              </p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Assignments Due
              </CardTitle>
              <PenSquare className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assignmentsDue}</div>
              <p className="text-xs text-muted-foreground">
                Due this week
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
