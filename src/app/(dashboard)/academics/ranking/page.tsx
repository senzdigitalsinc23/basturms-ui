
'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { StudentRanking } from '@/components/academics/ranking/student-ranking';

export default function RankingPage() {
  return (
    <ProtectedRoute allowedRoles={['Admin', 'Headmaster', 'Teacher']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Student Academic Ranking</h1>
          <p className="text-muted-foreground">
            View and analyze student performance rankings across classes and the school.
          </p>
        </div>
        <StudentRanking />
      </div>
    </ProtectedRoute>
  );
}
