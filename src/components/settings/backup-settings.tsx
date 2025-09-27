
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Cloud, Download, Server, Upload, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { useState, useEffect, useRef } from 'react';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const ALL_STORAGE_KEYS = [
    'campusconnect_users', 'campusconnect_roles', 'campusconnect_logs', 
    'campusconnect_auth_logs', 'campusconnect_students', 'campusconnect_classes',
    'campusconnect_staff', 'campusconnect_declined_staff', 'campusconnect_staff_academic_history',
    'campusconnect_staff_documents', 'campusconnect_staff_appointment_history', 'campusconnect_staff_attendance_records',
    'campusconnect_subjects', 'campusconnect_class_subjects', 'campusconnect_teacher_subjects',
    'campusconnect_school', 'campusconnect_academic_years', 'campusconnect_grading_scheme',
    'campusconnect_role_permissions', 'campusconnect_leave_requests', 'campusconnect_backup_settings'
];

const BACKUP_SETTINGS_KEY = 'campusconnect_backup_settings';

type BackupSettings = {
    autoBackupEnabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    lastBackup: string | null;
}

export function BackupSettings() {
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [backupSettings, setBackupSettings] = useState<BackupSettings>({
        autoBackupEnabled: true,
        frequency: 'daily',
        lastBackup: null
    });

    useEffect(() => {
        const storedSettings = localStorage.getItem(BACKUP_SETTINGS_KEY);
        if (storedSettings) {
            setBackupSettings(JSON.parse(storedSettings));
        } else {
            // Set initial last backup time for display
            setBackupSettings(prev => ({...prev, lastBackup: new Date().toISOString()}));
        }
    }, []);

    const updateBackupSettings = (newSettings: Partial<BackupSettings>) => {
        setBackupSettings(prev => {
            const updated = {...prev, ...newSettings};
            localStorage.setItem(BACKUP_SETTINGS_KEY, JSON.stringify(updated));
            return updated;
        });
    }

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
        
        const newLastBackup = new Date().toISOString();
        updateBackupSettings({ lastBackup: newLastBackup });

        toast({
            title: "Backup Downloaded",
            description: "A local backup of all application data has been downloaded."
        });
    };

    const handleRestoreClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') {
                    throw new Error("File content is not readable.");
                }
                const restoredData = JSON.parse(text);

                // Basic validation
                if (typeof restoredData !== 'object' || !restoredData.campusconnect_users) {
                     throw new Error("Invalid backup file format.");
                }

                Object.keys(restoredData).forEach(key => {
                    if (ALL_STORAGE_KEYS.includes(key)) {
                        localStorage.setItem(key, JSON.stringify(restoredData[key]));
                    }
                });

                toast({
                    title: "Restore Successful",
                    description: "Data has been restored. The application will now reload.",
                });

                // Reload the page to apply changes
                setTimeout(() => window.location.reload(), 2000);

            } catch (error) {
                const message = error instanceof Error ? error.message : "An unknown error occurred.";
                toast({
                    variant: "destructive",
                    title: "Restore Failed",
                    description: message,
                });
            }
        };
        reader.readAsText(file);
    };

  return (
    <div className="grid md:grid-cols-2 gap-6">
        <Card>
            <CardHeader>
                <div className="flex items-center gap-4">
                    <Cloud className="h-8 w-8 text-primary"/>
                    <div>
                        <CardTitle>Automatic Backup</CardTitle>
                        <CardDescription>Configure simulated automatic cloud backups.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                    <Switch 
                        id="auto-backup" 
                        checked={backupSettings.autoBackupEnabled} 
                        onCheckedChange={(checked) => updateBackupSettings({ autoBackupEnabled: checked })}
                    />
                    <Label htmlFor="auto-backup">Enable Automatic Backups</Label>
                </div>
                {backupSettings.autoBackupEnabled && (
                    <div className="space-y-4">
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="frequency">Backup Frequency</Label>
                             <Select 
                                value={backupSettings.frequency} 
                                onValueChange={(value: 'daily' | 'weekly' | 'monthly') => updateBackupSettings({ frequency: value })}
                            >
                                <SelectTrigger id="frequency">
                                    <SelectValue placeholder="Select frequency" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="daily">Daily</SelectItem>
                                    <SelectItem value="weekly">Weekly</SelectItem>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Last backup: {backupSettings.lastBackup ? format(new Date(backupSettings.lastBackup), 'PPP p') : 'Never'}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <div className="flex items-center gap-4">
                    <Server className="h-8 w-8 text-primary"/>
                    <div>
                        <CardTitle>Manual Backup & Restore</CardTitle>
                        <CardDescription>Download a local copy or restore from a backup file.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                 <p className="text-sm text-muted-foreground">Download a JSON file of all application data, or restore from a previously downloaded file.</p>
                <div className="flex items-center gap-2">
                    <Button variant="secondary" onClick={handleDownloadBackup}>
                        <Download className="mr-2 h-4 w-4"/>
                        Download Local Backup
                    </Button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".json"
                        onChange={handleFileChange}
                    />
                    <Button variant="outline" onClick={handleRestoreClick}>
                        <Upload className="mr-2 h-4 w-4"/>
                        Restore from File
                    </Button>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}

