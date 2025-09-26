
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Cloud, Download, Server } from 'lucide-react';

export function BackupSettings() {
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
                <Button variant="secondary">
                    <Download className="mr-2 h-4 w-4"/>
                    Download Local Backup
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}
