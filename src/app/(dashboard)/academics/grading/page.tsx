'use client';
import { ProtectedRoute } from '@/components/protected-route';
import { ScoreEntryForm } from '@/components/academics/grading/score-entry-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function GradingPage() {
  return (
    <ProtectedRoute allowedRoles={['Admin', 'Teacher']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Grading & Assignments</h1>
          <p className="text-muted-foreground">
            Enter homework, assignment, and exam scores for students.
          </p>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Assignment Score Entry</CardTitle>
                <CardDescription>Select a class to view subjects and enter scores for each student.</CardDescription>
            </CardHeader>
            <CardContent>
                <ScoreEntryForm />
            </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
