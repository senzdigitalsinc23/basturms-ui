'use client';
import { ProtectedRoute } from '@/components/protected-route';
import { AuthLogDataTable } from '@/components/auth-logs/data-table';
import { columns } from '@/components/auth-logs/columns';
import { useEffect, useState } from 'react';
import { getAuthLogs, deleteAuthLog } from '@/lib/store';
import { AuthLog } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

export default function AuthLogsPage() {
  const [logs, setLogs] = useState<AuthLog[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchLogs = () => {
    setLogs(getAuthLogs());
  }

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleDelete = (logId: string) => {
    if (deleteAuthLog(logId)) {
        toast({ title: 'Log Deleted', description: 'The authentication log entry has been removed.' });
        fetchLogs();
    } else {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete log entry.' });
    }
  };

  return (
    <ProtectedRoute allowedRoles={['Admin']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Authentication Logs</h1>
          <p className="text-muted-foreground">
            Review user login, logout, and failed login attempts.
          </p>
        </div>
        <AuthLogDataTable 
            columns={columns({ isSuperAdmin: user?.is_super_admin || false, onDelete: handleDelete })} 
            data={logs} 
        />
      </div>
    </ProtectedRoute>
  );
}
