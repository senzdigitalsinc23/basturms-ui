'use client';
import { ProtectedRoute } from '@/components/protected-route';
import { AuthLogDataTable } from '@/components/auth-logs/data-table';
import { columns } from '@/components/auth-logs/columns';
import { useEffect, useState } from 'react';
import { getAuthLogs } from '@/lib/store';
import { AuthLog } from '@/lib/types';

export default function AuthLogsPage() {
  const [logs, setLogs] = useState<AuthLog[]>([]);

  useEffect(() => {
    setLogs(getAuthLogs());
  }, []);

  return (
    <ProtectedRoute allowedRoles={['Admin']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Authentication Logs</h1>
          <p className="text-muted-foreground">
            Review user login, logout, and failed login attempts.
          </p>
        </div>
        <AuthLogDataTable columns={columns} data={logs} />
      </div>
    </ProtectedRoute>
  );
}
