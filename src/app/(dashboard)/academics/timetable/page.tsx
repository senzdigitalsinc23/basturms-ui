'use client';
import { ProtectedRoute } from '@/components/protected-route';
import { TimetableScheduler } from '@/components/academics/timetable/timetable-scheduler';

export default function TimetablePage() {
  return (
    <ProtectedRoute allowedRoles={['Admin', 'Headmaster']}>
       <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Timetable Scheduler</h1>
          <p className="text-muted-foreground">
            Create and manage class timetables for the week.
          </p>
        </div>
        <TimetableScheduler />
      </div>
    </ProtectedRoute>
  );
}
