'use client';
import { ProtectedRoute } from '@/components/protected-route';
import { AuditLogDataTable } from '@/components/audit-logs/data-table';
import { columns } from '@/components/audit-logs/columns';
import { useEffect, useState } from 'react';
import { getAuditLogs } from '@/lib/store';
import { AuditLog } from '@/lib/types';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    setLogs(getAuditLogs());
  }, []);

  return (
    <ProtectedRoute allowedRoles={['Admin']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Audit Logs</h1>
          <p className="text-muted-foreground">
            Review a log of all significant user actions within the system.
          </p>
        </div>
        <AuditLogDataTable columns={columns} data={logs} />
      </div>
    </ProtectedRoute>
  );
}
