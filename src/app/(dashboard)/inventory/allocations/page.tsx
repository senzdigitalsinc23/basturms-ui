
'use client';
import { ProtectedRoute } from '@/components/protected-route';

export default function AllocationsPage() {
  return (
    <ProtectedRoute allowedRoles={['Admin', 'Stores Manager']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Asset Allocations</h1>
          <p className="text-muted-foreground">
            Track which assets are assigned to classrooms or staff.
          </p>
        </div>
        {/* Asset Allocation Component will go here */}
        <p>Asset Allocation Component coming soon...</p>
      </div>
    </ProtectedRoute>
  );
}
