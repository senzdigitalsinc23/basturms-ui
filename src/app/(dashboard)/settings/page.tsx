
'use client';
import { ProtectedRoute } from '@/components/protected-route';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SchoolProfileSettings } from '@/components/settings/school-profile-settings';
import { AcademicSettings } from '@/components/settings/academic-settings';
import { GradingSchemeSettings } from '@/components/settings/grading-scheme-settings';
import { RolesPermissionsSettings } from '@/components/settings/roles-permissions-settings';
import { IntegrationSettings } from '@/components/settings/integration-settings';
import { BackupSettings } from '@/components/settings/backup-settings';

export default function SettingsPage() {
  return (
    <ProtectedRoute allowedRoles={['Admin']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">System Settings</h1>
          <p className="text-muted-foreground">
            Manage school-wide configurations and settings.
          </p>
        </div>
        <Tabs defaultValue="school-profile">
            <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="school-profile">School Profile</TabsTrigger>
                <TabsTrigger value="academic">Academic Settings</TabsTrigger>
                <TabsTrigger value="grading">Grading Scheme</TabsTrigger>
                <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
                <TabsTrigger value="integrations">Integrations</TabsTrigger>
                <TabsTrigger value="backup">Backup & Recovery</TabsTrigger>
            </TabsList>
            <TabsContent value="school-profile">
                <Card>
                    <CardHeader>
                        <CardTitle>School Profile</CardTitle>
                        <CardDescription>Manage your school's public information.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <SchoolProfileSettings />
                    </CardContent>
                </Card>
            </TabsContent>
             <TabsContent value="academic">
                <Card>
                    <CardHeader>
                        <CardTitle>Academic Settings</CardTitle>
                        <CardDescription>Configure academic years, terms, subjects and their assignments.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AcademicSettings />
                    </CardContent>
                </Card>
            </TabsContent>
             <TabsContent value="grading">
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
            <TabsContent value="roles">
                <Card>
                    <CardHeader>
                        <CardTitle>Roles & Permissions</CardTitle>
                        <CardDescription>Configure user roles and their access levels across the system.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RolesPermissionsSettings />
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="integrations">
                <Card>
                    <CardHeader>
                        <CardTitle>Integration Settings</CardTitle>
                        <CardDescription>Connect third-party services like SMS, Email, and Payment Gateways.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <IntegrationSettings />
                    </CardContent>
                </Card>
            </TabsContent>
             <TabsContent value="backup">
                <Card>
                    <CardHeader>
                        <CardTitle>Data Backup & Recovery</CardTitle>
                        <CardDescription>Manage data backups to cloud or local storage.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <BackupSettings />
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}
