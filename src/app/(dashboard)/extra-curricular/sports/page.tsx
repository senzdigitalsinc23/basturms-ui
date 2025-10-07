
'use client';
import { ProtectedRoute } from '@/components/protected-route';
import { SportsManagement } from '@/components/extra-curricular/sports/sports-management';

export default function SportsPage() {
  return (
    <ProtectedRoute allowedRoles={['Admin']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Sports Teams</h1>
          <p className="text-muted-foreground">
            Manage all school sports teams and their members.
          </p>
        </div>
        <SportsManagement />
      </div>
    </ProtectedRoute>
  );
}
