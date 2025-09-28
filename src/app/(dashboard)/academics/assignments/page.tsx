
'use client';
import { ProtectedRoute } from '@/components/protected-route';
import { AssignmentActivityManagement } from '@/components/academics/assignments/assignment-activity-management';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AssignmentsPage() {
  return (
    <ProtectedRoute allowedRoles={['Admin']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Assignments Setup</h1>
          <p className="text-muted-foreground">
            Create and manage assignment types for the entire school.
          </p>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Assignment & Activity Management</CardTitle>
                <CardDescription>
                    Define assignment types (e.g., Homework, Class Test) and assign them to classes.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <AssignmentActivityManagement />
            </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
