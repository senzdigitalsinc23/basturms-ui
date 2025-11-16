
'use client';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OnboardingTips } from '@/components/dashboard/onboarding-tips';
import { BookCopy, GraduationCap, Users, RefreshCw } from 'lucide-react';
import { ProtectedRoute } from '@/components/protected-route';
import { useEffect, useState } from 'react';
import { getStaffAppointmentHistory, getStaff } from '@/lib/store';
import { Skeleton } from '@/components/ui/skeleton';

export default function TeacherDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    studentCount: 0,
    classCount: 0,
    subjectCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'Teacher') {
        setLoading(true);
        const staffList = getStaff();
        const currentTeacher = staffList.find(s => s.user_id === user.id);
        if (currentTeacher) {
            const appointments = getStaffAppointmentHistory();
            const teacherAppointments = appointments
                .filter(a => a.staff_id === currentTeacher.staff_id)
                .sort((a,b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime());
            const latestAppointment = teacherAppointments[0];
            if (latestAppointment) {
                setStats({
                    studentCount: 128, // Placeholder, needs logic to count students in assigned classes
                    classCount: latestAppointment.class_assigned?.length || 0,
                    subjectCount: latestAppointment.subjects_assigned?.length || 0,
                });
            }
        }
        setLoading(false);
    }
  }, [user]);

  return (
    <ProtectedRoute allowedRoles={['Teacher']}>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Teacher Dashboard</h1>
          <p className="text-muted-foreground">Welcome, {user?.name}. Your dashboard is ready.</p>
        </div>

        <OnboardingTips />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <>
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
            </>
          ) : (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    My Students
                  </CardTitle>
                  <Users className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.studentCount}</div>
                  <p className="text-xs text-muted-foreground">
                    Across {stats.classCount} classes
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    My Subjects
                  </CardTitle>
                  <BookCopy className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.subjectCount}</div>
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
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
