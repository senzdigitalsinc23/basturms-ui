'use client';
import { ProtectedRoute } from '@/components/protected-route';
import { AuthLogDataTable } from '@/components/auth-logs/data-table';
import { columns } from '@/components/auth-logs/columns';
import { useEffect, useState } from 'react';
import { getAuthLogs, deleteAuthLog, bulkDeleteAuthLogs, addAuditLog, deleteAllAuthLogs } from '@/lib/store';
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

  const handleBulkDelete = (logIds: string[]) => {
    if (!user) return;
    const deletedCount = bulkDeleteAuthLogs(logIds);
    if(deletedCount > 0) {
        toast({ title: 'Bulk Delete Successful', description: `${deletedCount} log(s) have been removed.` });
         addAuditLog({
            user: user.email,
            name: user.name,
            action: 'Bulk Delete Auth Logs',
            details: `Deleted ${deletedCount} authentication log entries.`
        });
        fetchLogs();
    } else {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not delete selected logs.' });
    }
  }

  const handleDeleteAll = () => {
    if (!user) return;
    deleteAllAuthLogs();
    toast({ title: 'All Logs Deleted', description: 'All authentication log entries have been removed.' });
    addAuditLog({
        user: user.email,
        name: user.name,
        action: 'Delete All Auth Logs',
        details: 'Deleted all authentication log entries.'
    });
    fetchLogs();
  }

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
            isSuperAdmin={user?.is_super_admin || false}
            onBulkDelete={handleBulkDelete}
            onDeleteAll={handleDeleteAll}
        />
      </div>
    </ProtectedRoute>
  );
}
