
'use client';
import { ProtectedRoute } from '@/components/protected-route';
import { TermlyBillManagement } from '@/components/financials/bill-preparation';

export default function BillPreparationPage() {
  return (
    <ProtectedRoute allowedRoles={['Admin', 'Accountant']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Bill Preparation</h1>
          <p className="text-muted-foreground">
            Create, view, and manage termly bills for students.
          </p>
        </div>
        <TermlyBillManagement />
      </div>
    </ProtectedRoute>
  );
}
