
'use client';
import { ProtectedRoute } from '@/components/protected-route';
import { StudentCommunication } from '@/components/communications/student-communication';

export default function CommunicationsPage() {
  return (
    <ProtectedRoute allowedRoles={['Admin', 'Teacher']}>
       <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Student Communications</h1>
          <p className="text-muted-foreground">
            View and respond to messages from students.
          </p>
        </div>
        <StudentCommunication />
      </div>
    </ProtectedRoute>
  );
}
