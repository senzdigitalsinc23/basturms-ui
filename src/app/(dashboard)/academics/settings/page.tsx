
'use client';
import { ProtectedRoute } from '@/components/protected-route';
import { AcademicSettings } from '@/components/settings/academic-settings';
import { GradingSchemeSettings } from '@/components/settings/grading-scheme-settings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function AcademicSettingsPage() {
  return (
    <ProtectedRoute allowedRoles={['Admin']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Academic Settings</h1>
          <p className="text-muted-foreground">
            Configure academic years, terms, subjects, and grading schemes.
          </p>
        </div>
        
        <Card>
            <CardHeader>
                <CardTitle>Academic Year & Subject Management</CardTitle>
                <CardDescription>Configure academic years, terms, subjects and their assignments.</CardDescription>
            </CardHeader>
            <CardContent>
                <AcademicSettings />
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Grading Scheme</CardTitle>
                <CardDescription>Define the grading scale for student assessments.</CardDescription>
            </CardHeader>
            <CardContent>
                <GradingSchemeSettings />
            </CardContent>
        </Card>

      </div>
    </ProtectedRoute>
  );
}
