
'use client';
import { ProtectedRoute } from '@/components/protected-route';

export default function AssetsPage() {
  return (
    <ProtectedRoute allowedRoles={['Admin', 'Stores Manager', 'Procurement Manager']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Asset Register</h1>
          <p className="text-muted-foreground">
            Manage all school properties and equipment.
          </p>
        </div>
        {/* Asset Management Component will go here */}
        <p>Asset Management Component coming soon...</p>
      </div>
    </ProtectedRoute>
  );
}
