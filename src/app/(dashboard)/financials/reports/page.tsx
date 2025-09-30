
'use client';
import { ProtectedRoute } from '@/components/protected-route';
import { FinancialReports } from '@/components/financials/financial-reports';

export default function FinancialReportsPage() {
  return (
    <ProtectedRoute allowedRoles={['Admin', 'Accountant', 'Headmaster']}>
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">Financial Reports</h1>
                <p className="text-muted-foreground">
                    Generate and view detailed financial reports for the school.
                </p>
            </div>
            <FinancialReports />
      </div>
    </ProtectedRoute>
  );
}
