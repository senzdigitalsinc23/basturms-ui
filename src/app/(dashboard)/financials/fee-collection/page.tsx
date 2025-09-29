
'use client';
import { ProtectedRoute } from '@/components/protected-route';
import { FeeCollection } from '@/components/financials/fee-collection';

export default function FeeCollectionPage() {
  return (
    <ProtectedRoute allowedRoles={['Admin']}>
        <div className="space-y-6">
            <div>
            <h1 className="text-3xl font-bold font-headline">Fee Collection</h1>
            <p className="text-muted-foreground">
                Search for students to view their balance and record new payments.
            </p>
            </div>
            <FeeCollection />
      </div>
    </ProtectedRoute>
  );
}
