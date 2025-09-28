
'use client';
import { ProtectedRoute } from '@/components/protected-route';
import { LeaveManagementTable } from '@/components/staff-management/leave/leave-management-table';

export default function LeaveManagementPage() {
  return (
    <ProtectedRoute allowedRoles={['Admin', 'Headmaster']}>
      <div className="space-y-6">
        <LeaveManagementTable />
      </div>
    </ProtectedRoute>
  );
}
