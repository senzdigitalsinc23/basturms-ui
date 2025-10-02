
'use client';
import { ProtectedRoute } from '@/components/protected-route';
import { ClassAttendanceTracker } from '@/components/student-management/attendance/class-attendance-tracker';

export default function TeacherAttendancePage() {
  return (
    <ProtectedRoute allowedRoles={['Teacher', 'Admin']}>
      <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-bold font-headline">My Class Register</h1>
            <p className="text-muted-foreground">Take attendance for your assigned classes.</p>
        </div>
        <ClassAttendanceTracker />
      </div>
    </ProtectedRoute>
  );
}
