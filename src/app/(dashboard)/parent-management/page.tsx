'use client';
import { ProtectedRoute } from '@/components/protected-route';
import { ParentManagement } from '@/components/parent-management/parent-management';

export default function ParentManagementPage() {
  return (
    <ProtectedRoute allowedRoles={['Admin']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Parent & Guardian Management</h1>
          <p className="text-muted-foreground">
            View and manage parent and guardian information.
          </p>
        </div>
        <ParentManagement />
      </div>
    </ProtectedRoute>
  );
}
