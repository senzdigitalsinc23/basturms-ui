
'use client';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OnboardingTips } from '@/components/dashboard/onboarding-tips';
import { GraduationCap, ShieldCheck, User } from 'lucide-react';
import { ProtectedRoute } from '@/components/protected-route';
import { useEffect, useState } from 'react';
import { getStudentProfiles } from '@/lib/store';
import { StudentProfile } from '@/lib/types';

export default function ParentDashboardPage() {
  const { user } = useAuth();
  const [childProfile, setChildProfile] = useState<StudentProfile | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      if (user) {
          const { students: studentProfiles } = await getStudentProfiles();
          const profile = studentProfiles.find(p => p.guardianInfo.guardian_email === user.email);
          setChildProfile(profile || null);
      }
    }
    fetchProfile();
  }, [user]);

  const gpa = '3.4'; // Placeholder
  const attendancePercentage = '98%'; // Placeholder
  
  return (
    <ProtectedRoute allowedRoles={['Parent']}>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Parent Dashboard</h1>
          <p className="text-muted-foreground">Welcome, {user?.name}.</p>
        </div>

        <OnboardingTips />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                My Child
              </CardTitle>
              <User className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{childProfile ? `${childProfile.student.first_name} ${childProfile.student.last_name}` : 'N/A'}</div>
              <p className="text-xs text-muted-foreground">
                {childProfile?.admissionDetails.class_assigned || 'N/A'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Child's Grades
              </CardTitle>
              <GraduationCap className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{childProfile?.academicRecords?.[0]?.grade || 'N/A'}</div>
              <p className="text-xs text-muted-foreground">
                Overall GPA: {gpa}
              </p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Attendance
              </CardTitle>
              <ShieldCheck className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{attendancePercentage}</div>
              <p className="text-xs text-muted-foreground">
                1 absence this month
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
