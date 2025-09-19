'use client';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OnboardingTips } from '@/components/dashboard/onboarding-tips';
import { Truck, Building, History } from 'lucide-react';
import { ProtectedRoute } from '@/components/protected-route';

export default function ProcurementDashboardPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute allowedRoles={['Procurement Manager']}>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Procurement Dashboard</h1>
          <p className="text-muted-foreground">Welcome, {user?.name}. Here are your pending orders.</p>
        </div>
        <OnboardingTips />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <Truck className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Suppliers</CardTitle>
              <Building className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">15</div>
              <p className="text-xs text-muted-foreground">2 new this month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Order History</CardTitle>
              <History className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">125</div>
              <p className="text-xs text-muted-foreground">Total orders fulfilled</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
