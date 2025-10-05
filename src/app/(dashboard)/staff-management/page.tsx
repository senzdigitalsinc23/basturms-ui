

'use client';
import { ProtectedRoute } from '@/components/protected-route';
import { StaffManagement } from '@/components/staff-management/staff-management';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function StaffPage() {
  return (
    <ProtectedRoute allowedRoles={['Admin', 'Headmaster']}>
      <div className="space-y-6">
        <StaffManagement />
      </div>
    </ProtectedRoute>
  );
}
