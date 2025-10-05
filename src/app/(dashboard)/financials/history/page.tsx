
'use client';
import { ProtectedRoute } from '@/components/protected-route';
import { StudentFinancials } from '@/components/financials/student-financials';

export default function StudentFinancialsPage() {
  return (
    <ProtectedRoute allowedRoles={['Admin', 'Student', 'Parent']}>
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">My Financials</h1>
                <p className="text-muted-foreground">
                    A detailed history of your account, including all bills and payments.
                </p>
            </div>
            <StudentFinancials />
        </div>
    </ProtectedRoute>
  );
}
