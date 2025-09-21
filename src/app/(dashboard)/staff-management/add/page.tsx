
'use client';
import { ProtectedRoute } from '@/components/protected-route';

export default function AddStaffPage() {
  return (
    <ProtectedRoute allowedRoles={['Admin', 'Headmaster']}>
      <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-bold font-headline">Add Staff</h1>
            <p className="text-muted-foreground">Add a new staff member to the system.</p>
        </div>
        {/* Form will go here */}
        <p>Add staff form will be implemented here.</p>
      </div>
    </ProtectedRoute>
  );
}
