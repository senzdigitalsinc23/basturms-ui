
'use client';
import { ProtectedRoute } from '@/components/protected-route';
import { PayrollManagement } from '@/components/financials/payroll-management';

export default function PayrollPage() {
  return (
    <ProtectedRoute allowedRoles={['Admin', 'Accountant', 'Headmaster']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Staff Payroll</h1>
          <p className="text-muted-foreground">
            Generate and manage monthly staff payrolls.
          </p>
        </div>
        <PayrollManagement />
      </div>
    </ProtectedRoute>
  );
}
