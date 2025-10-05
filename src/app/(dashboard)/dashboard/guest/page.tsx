
'use client';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ProtectedRoute } from '@/components/protected-route';
import { Button } from '@/components/ui/button';
import { HardDriveDownload, HardDriveUpload } from 'lucide-react';
import Link from 'next/link';

export default function GuestDashboardPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute allowedRoles={['Guest']}>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Guest Dashboard</h1>
          <p className="text-muted-foreground">Welcome, {user?.name}. Use this interface to backup or restore system data.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Backup & Recovery</CardTitle>
            <CardDescription>
                You can create a local backup of the entire application's data or restore the system from a previously saved backup file.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
                <Button asChild>
                    <Link href="/settings">
                        <HardDriveUpload className="mr-2" />
                        Go to Backup/Restore
                    </Link>
                </Button>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
