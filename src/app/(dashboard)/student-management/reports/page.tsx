
'use client';
import { ProtectedRoute } from '@/components/protected-route';
import { ReportCardGenerator } from '@/components/student-management/reports/report-card-generator';
import { Suspense } from 'react';

function ReportGenerationPageContent() {
  return (
    <ProtectedRoute allowedRoles={['Admin', 'Teacher', 'Headmaster']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Report Card Generation</h1>
          <p className="text-muted-foreground">
            Generate and view termly report cards for students.
          </p>
        </div>
        <ReportCardGenerator />
      </div>
    </ProtectedRoute>
  );
}


export default function ReportGenerationPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ReportGenerationPageContent />
        </Suspense>
    )
}
