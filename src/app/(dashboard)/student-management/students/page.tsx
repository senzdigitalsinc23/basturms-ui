import { ProtectedRoute } from '@/components/protected-route';
import { StudentManagement } from '@/components/student-management/student-management';

export default function StudentsPage() {
  return (
    <ProtectedRoute allowedRoles={['Admin']}>
      <div className="space-y-6">
        <StudentManagement />
      </div>
    </ProtectedRoute>
  );
}
