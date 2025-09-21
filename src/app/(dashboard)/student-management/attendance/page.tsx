
'use client';
import { ProtectedRoute } from '@/components/protected-route';
import { AttendanceTracker } from '@/components/student-management/attendance/attendance-tracker';

export default function StudentAttendancePage() {
  return (
    <ProtectedRoute allowedRoles={['Admin']}>
      <div className="space-y-6">
        <AttendanceTracker />
      </div>
    </ProtectedRoute>
  );
}
