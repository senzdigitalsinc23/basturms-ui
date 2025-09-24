'use client';
import { ProtectedRoute } from '@/components/protected-route';
import { AuditLogDataTable } from '@/components/audit-logs/data-table';
import { columns } from '@/components/audit-logs/columns';
import { useEffect, useState } from 'react';
import { getAuditLogs, deleteAuditLog } from '@/lib/store';
import { AuditLog } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchLogs = () => {
    setLogs(getAuditLogs());
  }

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleDelete = (logId: string) => {
    if (deleteAuditLog(logId)) {
        toast({ title: 'Log Deleted', description: 'The audit log entry has been removed.' });
        fetchLogs();
    } else {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete log entry.' });
    }
  }

  return (
    <ProtectedRoute allowedRoles={['Admin']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Audit Logs</h1>
          <p className="text-muted-foreground">
            Review a log of all significant user actions within the system.
          </p>
        </div>
        <AuditLogDataTable 
            columns={columns({ isSuperAdmin: user?.is_super_admin || false, onDelete: handleDelete })} 
            data={logs} 
        />
      </div>
    </ProtectedRoute>
  );
}
