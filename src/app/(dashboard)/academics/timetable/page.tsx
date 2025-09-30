'use client';
import { ProtectedRoute } from '@/components/protected-route';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction } from 'lucide-react';

export default function TimetablePage() {
  return (
    <ProtectedRoute allowedRoles={['Admin', 'Teacher', 'Student']}>
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
        <div className="flex flex-col items-center gap-4 text-center">
            <div className="p-4 bg-muted rounded-full">
                <Construction className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight">
                Timetable Feature Under Construction
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
                This module is currently being built. It will allow for automatic timetable generation, conflict resolution, and various views for classes, teachers, and students.
            </p>
        </div>
      </div>
    </ProtectedRoute>
  );
}
