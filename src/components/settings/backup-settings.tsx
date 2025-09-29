
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Cloud, Download, Server, Trash2, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { useState, useEffect, useRef } from 'react';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useAuth } from '@/hooks/use-auth';
import { addAuditLog, deleteAllFinancialRecords } from '@/lib/store';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';

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
    backupTime: string;
    lastBackup: string | null;
}

export function BackupSettings() {
    const { toast } = useToast();
    const { user } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [backupSettings, setBackupSettings] = useState<BackupSettings>({
        autoBackupEnabled: true,
        frequency: 'daily',
        backupTime: '00:00',
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
             if(user) {
                addAuditLog({
                    user: user.email,
                    name: user.name,
                    action: 'Update Backup Settings',
                    details: `Automatic backup settings updated. Enabled: ${updated.autoBackupEnabled}, Frequency: ${updated.frequency}, Time: ${updated.backupTime}`
                });
            }
            return updated;
        });
    }

    const handleDownloadBackup = () => {
        if (!user) return;
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
        
        addAuditLog({
            user: user.email,
            name: user.name,
            action: 'Create Backup',
            details: `Created a local backup of the system data.`
        });

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
        if (!file || !user) return;

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
                
                addAuditLog({
                    user: user.email,
                    name: user.name,
                    action: 'Restore Backup',
                    details: `Restored system data from file: ${file.name}.`
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

    const handleDeleteFinancials = () => {
        if (!user) return;
        deleteAllFinancialRecords(user.id);
        toast({
            title: "Financial Records Deleted",
            description: "All student financial records have been cleared. The page will now reload."
        });
        setTimeout(() => window.location.reload(), 2000);
    }

  return (
    <div className="space-y-6">
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
                            <div className="grid md:grid-cols-2 gap-4">
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
                                <div className="grid w-full max-w-sm items-center gap-1.5">
                                    <Label htmlFor="backup-time">Time of Day</Label>
                                    <Select 
                                        value={backupSettings.backupTime} 
                                        onValueChange={(value: string) => updateBackupSettings({ backupTime: value })}
                                    >
                                        <SelectTrigger id="backup-time">
                                            <SelectValue placeholder="Select time" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="00:00">12:00 AM (Midnight)</SelectItem>
                                            <SelectItem value="06:00">6:00 AM</SelectItem>
                                            <SelectItem value="12:00">12:00 PM (Noon)</SelectItem>
                                            <SelectItem value="18:00">6:00 PM</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
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
         <Card className="border-destructive">
            <CardHeader>
                <div className="flex items-center gap-4">
                    <AlertTriangle className="h-8 w-8 text-destructive"/>
                    <div>
                        <CardTitle className="text-destructive">Danger Zone</CardTitle>
                        <CardDescription>These actions are irreversible. Please proceed with caution.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex justify-between items-center p-4 bg-destructive/10 rounded-md">
                    <div>
                        <h4 className="font-semibold text-destructive">Delete All Financial Records</h4>
                        <p className="text-sm text-destructive/80">This will permanently delete all student bills, payments, and financial history.</p>
                    </div>
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete Records
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete all financial records for all students, including payment histories and outstanding balances.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={handleDeleteFinancials}>I understand, delete everything</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
