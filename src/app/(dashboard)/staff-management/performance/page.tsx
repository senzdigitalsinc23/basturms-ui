'use client';
import { ProtectedRoute } from '@/components/protected-route';
import { TeacherPerformanceEvaluation } from '@/components/staff-management/performance/teacher-performance';

export default function PerformancePage() {
  return (
    <ProtectedRoute allowedRoles={['Admin', 'Headmaster']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Teacher Performance</h1>
          <p className="text-muted-foreground">
            Evaluate teacher performance based on various metrics.
          </p>
        </div>
        <TeacherPerformanceEvaluation />
      </div>
    </ProtectedRoute>
  );
}
