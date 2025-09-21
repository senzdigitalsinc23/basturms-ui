
'use client';
import { ProtectedRoute } from '@/components/protected-route';
import { AddStaffForm } from '@/components/staff-management/add-staff-form';

export default function AddStaffPage() {
  return (
    <ProtectedRoute allowedRoles={['Admin', 'Headmaster']}>
      <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-bold font-headline">Add New Staff</h1>
            <p className="text-muted-foreground">Fill in the details below to add a new staff member.</p>
        </div>
        <AddStaffForm />
      </div>
    </ProtectedRoute>
  );
}
