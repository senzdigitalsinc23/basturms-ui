
'use client';
import { ProtectedRoute } from '@/components/protected-route';

export default function StaffAttendancePage() {
  return (
    <ProtectedRoute allowedRoles={['Admin', 'Headmaster']}>
      <div className="space-y-6">
         <div>
            <h1 className="text-3xl font-bold font-headline">Staff Attendance</h1>
            <p className="text-muted-foreground">Track attendance for all staff members.</p>
        </div>
        {/* Attendance tracker will go here */}
        <p>Staff attendance tracker will be implemented here.</p>
      </div>
    </ProtectedRoute>
  );
}
