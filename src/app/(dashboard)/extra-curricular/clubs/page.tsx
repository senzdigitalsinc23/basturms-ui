
'use client';
import { ProtectedRoute } from '@/components/protected-route';
import { ClubManagement } from '@/components/extra-curricular/clubs/club-management';

export default function ClubsPage() {
  return (
    <ProtectedRoute allowedRoles={['Admin']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Clubs & Societies</h1>
          <p className="text-muted-foreground">
            Manage all school clubs and their members.
          </p>
        </div>
        <ClubManagement />
      </div>
    </ProtectedRoute>
  );
}
