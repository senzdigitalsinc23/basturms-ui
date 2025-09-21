'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { AddStudentForm } from '@/components/student-management/add-student-form';

export default function AddStudentPage() {
  return (
    <ProtectedRoute allowedRoles={['Admin']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Add New Student</h1>
          <p className="text-muted-foreground">
            Fill in the details below to enroll a new student.
          </p>
        </div>
        <AddStudentForm />
      </div>
    </ProtectedRoute>
  );
}
