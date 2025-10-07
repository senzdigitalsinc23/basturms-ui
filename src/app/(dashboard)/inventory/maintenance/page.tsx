
'use client';
import { ProtectedRoute } from '@/components/protected-route';

export default function MaintenancePage() {
  return (
    <ProtectedRoute allowedRoles={['Admin', 'Stores Manager']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Maintenance & Depreciation</h1>
          <p className="text-muted-foreground">
            Log maintenance activities and track asset depreciation.
          </p>
        </div>
        {/* Maintenance Log Component will go here */}
        <p>Maintenance Log Component coming soon...</p>
      </div>
    </ProtectedRoute>
  );
}
