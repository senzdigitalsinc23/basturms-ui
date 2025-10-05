'use client';
import { ProtectedRoute } from '@/components/protected-route';
import { ExpenseManagement } from '@/components/financials/expense-management';

export default function ExpensesPage() {
  return (
    <ProtectedRoute allowedRoles={['Admin', 'Accountant']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Expense Management</h1>
          <p className="text-muted-foreground">
            Track and manage all operational costs for the school.
          </p>
        </div>
        <ExpenseManagement />
      </div>
    </ProtectedRoute>
  );
}
