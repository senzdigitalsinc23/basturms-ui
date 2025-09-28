'use client';
import { ProtectedRoute } from '@/components/protected-route';
import { ClassManagement } from '@/components/academics/classes/class-management';

export default function ClassesPage() {
  return (
    <ProtectedRoute allowedRoles={['Admin']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Classes & Subjects</h1>
          <p className="text-muted-foreground">
            Manage classes and the subjects assigned to them.
          </p>
        </div>
        <ClassManagement />
      </div>
    </ProtectedRoute>
  );
}
