
'use client';
import { ProtectedRoute } from '@/components/protected-route';
import { SubjectManagement } from '@/components/academics/subjects/subject-management';

export default function SubjectsPage() {
  return (
    <ProtectedRoute allowedRoles={['Admin']}>
      <div className="space-y-6">
        <SubjectManagement />
      </div>
    </ProtectedRoute>
  );
}
