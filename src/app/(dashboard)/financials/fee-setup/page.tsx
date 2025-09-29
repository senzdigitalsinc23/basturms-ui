
'use client';
import { ProtectedRoute } from '@/components/protected-route';
import { FeeStructureSetup } from '@/components/financials/fee-structure-setup';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function FeeSetupPage() {
  return (
    <ProtectedRoute allowedRoles={['Admin']}>
        <Card>
            <CardHeader>
                <CardTitle>Fee Structure Setup</CardTitle>
                <CardDescription>Define all billable items for the school, such as tuition, PTA dues, and other levies.</CardDescription>
            </CardHeader>
            <CardContent>
                <FeeStructureSetup />
            </CardContent>
        </Card>
    </ProtectedRoute>
  );
}
