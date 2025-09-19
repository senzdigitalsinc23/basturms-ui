'use client';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OnboardingTips } from '@/components/dashboard/onboarding-tips';
import { BookCopy, History, Users } from 'lucide-react';
import { ProtectedRoute } from '@/components/protected-route';
import { useEffect, useState } from 'react';
import { getAuditLogs, getUsers } from '@/lib/store';
import { Role, User } from '@/lib/types';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalAudits, setTotalAudits] = useState(0);
  const [userRoleData, setUserRoleData] = useState<{ name: Role; count: number }[]>([]);

  useEffect(() => {
    const users = getUsers();
    const audits = getAuditLogs();
    setTotalUsers(users.length);
    setTotalAudits(audits.length);

    const roleCounts = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<Role, number>);

    const chartData = Object.entries(roleCounts).map(([name, count]) => ({
      name: name as Role,
      count,
    }));
    setUserRoleData(chartData);

  }, []);

  return (
    <ProtectedRoute allowedRoles={['Admin']}>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold font-headline">Welcome back, {user?.name.split(' ')[0]}!</h1>
          <p className="text-muted-foreground">Here's the Admin Dashboard overview.</p>
        </div>

        <OnboardingTips />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Users
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Currently active in the system
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                System Audits
              </CardTitle>
              <History className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAudits}</div>
              <p className="text-xs text-muted-foreground">
                Total actions logged
              </p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Courses
              </CardTitle>
              <BookCopy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">82</div>
              <p className="text-xs text-muted-foreground">
                +12 from last semester
              </p>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>User Role Distribution</CardTitle>
          </CardHeader>
          <CardContent>
             <ChartContainer config={{}} className="min-h-64 w-full">
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={userRoleData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false} />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar dataKey="count" fill="hsl(var(--primary))" name="User Count" />
                    </BarChart>
                </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
