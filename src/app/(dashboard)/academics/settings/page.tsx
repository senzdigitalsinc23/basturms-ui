
'use client';
import { ProtectedRoute } from '@/components/protected-route';
import { AcademicSettings } from '@/components/settings/academic-settings';
import { GradingSchemeSettings } from '@/components/settings/grading-scheme-settings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SubjectManagement } from '@/components/academics/subjects/subject-management';
import { AssignmentActivityManagement } from '@/components/academics/assignments/assignment-activity-management';
import { PromotionCriteriaSettings } from '@/components/settings/promotion-criteria-settings';

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
        
        <Tabs defaultValue="academic-year">
            <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="academic-year">Academic Year</TabsTrigger>
                <TabsTrigger value="subjects">Subjects</TabsTrigger>
                <TabsTrigger value="assignments">Assignments</TabsTrigger>
                <TabsTrigger value="grading-scheme">Grading Scheme</TabsTrigger>
                <TabsTrigger value="promotion">Promotion Criteria</TabsTrigger>
            </TabsList>

            <TabsContent value="academic-year">
                <Card>
                    <CardHeader>
                        <CardTitle>Academic Year & Term Management</CardTitle>
                        <CardDescription>Define academic years and the terms within them.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AcademicSettings />
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="subjects">
                <Card>
                    <CardHeader>
                        <CardTitle>Subject Management</CardTitle>
                        <CardDescription>Create subjects and assign them to classes.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <SubjectManagement />
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="assignments">
                <Card>
                    <CardHeader>
                        <CardTitle>Assignment & Activity Types</CardTitle>
                        <CardDescription>Define assignment types (e.g., Homework, Class Test) for grading.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AssignmentActivityManagement />
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="grading-scheme">
                <Card>
                    <CardHeader>
                        <CardTitle>Grading Scheme</CardTitle>
                        <CardDescription>Define the grading scale for student assessments.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <GradingSchemeSettings />
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="promotion">
                <Card>
                    <CardHeader>
                        <CardTitle>Promotion Criteria</CardTitle>
                        <CardDescription>Set the rules for student promotion to the next class.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PromotionCriteriaSettings />
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}
