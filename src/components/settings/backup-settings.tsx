
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Cloud, Download, Server } from 'lucide-react';
import { format } from 'date-fns';

const ALL_STORAGE_KEYS = [
    'campusconnect_users', 'campusconnect_roles', 'campusconnect_logs', 
    'campusconnect_auth_logs', 'campusconnect_students', 'campusconnect_classes',
    'campusconnect_staff', 'campusconnect_declined_staff', 'campusconnect_staff_academic_history',
    'campusconnect_staff_documents', 'campusconnect_staff_appointment_history', 'campusconnect_staff_attendance_records',
    'campusconnect_subjects', 'campusconnect_class_subjects', 'campusconnect_teacher_subjects',
    'campusconnect_school', 'campusconnect_academic_years', 'campusconnect_grading_scheme',
    'campusconnect_role_permissions',
];


export function BackupSettings() {
    const { toast } = useToast();

    const handleDownloadBackup = () => {
        const backupData: Record<string, any> = {};

        ALL_STORAGE_KEYS.forEach(key => {
            const data = localStorage.getItem(key);
            if (data) {
                try {
                    backupData[key] = JSON.parse(data);
                } catch (e) {
                    console.warn(`Could not parse data for key ${key}, storing as string.`);
                    backupData[key] = data;
                }
            }
        });

        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
            JSON.stringify(backupData, null, 2)
        )}`;
        
        const link = document.createElement("a");
        link.href = jsonString;
        const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
        link.download = `campusconnect_backup_${timestamp}.json`;

        link.click();

        toast({
            title: "Backup Downloaded",
            description: "A local backup of all application data has been downloaded."
        });
    };

  return (
    <div className="grid md:grid-cols-2 gap-6">
        <Card>
            <CardHeader>
                <div className="flex items-center gap-4">
                    <Cloud className="h-8 w-8 text-primary"/>
                    <div>
                        <CardTitle>Cloud Backup</CardTitle>
                        <CardDescription>Automatically back up data to a secure cloud provider.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Last backup: 2 hours ago</p>
                <Button>Configure Cloud Backup</Button>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <div className="flex items-center gap-4">
                    <Server className="h-8 w-8 text-primary"/>
                    <div>
                        <CardTitle>Local Backup</CardTitle>
                        <CardDescription>Download a local copy of your entire database.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                 <p className="text-sm text-muted-foreground">This will download a JSON file of all application data.</p>
                <Button variant="secondary" onClick={handleDownloadBackup}>
                    <Download className="mr-2 h-4 w-4"/>
                    Download Local Backup
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}
