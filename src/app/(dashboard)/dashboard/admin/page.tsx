'use client';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { OnboardingTips } from '@/components/dashboard/onboarding-tips';
import { Users, DollarSign, BarChart, Activity, User, Briefcase } from 'lucide-react';
import { ProtectedRoute } from '@/components/protected-route';
import { useEffect, useState } from 'react';
import { getAuditLogs, getUsers } from '@/lib/store';
import { Role, User as UserType } from '@/lib/types';
import { Bar, BarChart as RechartsBarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { RecentNotices } from '@/components/dashboard/recent-notices';

const salesData = [
  { name: 'Jan', pageViews: 1000, sales: 600 },
  { name: 'Feb', pageViews: 400, sales: 300 },
  { name: 'Mar', pageViews: 1200, sales: 900 },
  { name: 'Apr', pageViews: 600, sales: 400 },
  { name: 'May', pageViews: 500, sales: 350 },
  { name: 'Jun', pageViews: 700, sales: 400 },
  { name: 'Jul', pageViews: 900, sales: 500 },
];

const attendanceData = [{ name: 'Present', value: 92 }, { name: 'Absent', value: 8 }];
const performanceData = [{ name: 'Achieved', value: 85 }, { name: 'Remaining', value: 15 }];
const COLORS = ['hsl(var(--primary))', 'hsl(var(--muted))'];

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    const users = getUsers();
    setTotalUsers(users.length);
  }, []);

  return (
    <ProtectedRoute allowedRoles={['Admin']}>
      <div className="flex flex-col gap-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,254</div>
              <p className="text-xs text-green-500">+20.1% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$45,231.89</div>
              <p className="text-xs text-green-500">+12.2% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Attendance</CardTitle>
              <Activity className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">92%</div>
                <p className="text-xs text-green-500">+2.5% from yesterday</p>
              </div>
              <div className="h-20 w-20">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={attendanceData} cx="50%" cy="50%" innerRadius={25} outerRadius={35} fill="#8884d8" paddingAngle={5} dataKey="value" stroke="none">
                      {attendanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Performance</CardTitle>
              <BarChart className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">85%</div>
              <p className="text-xs text-green-500">+5.1% from last term</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Sales & Views</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="min-h-64 w-full">
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsBarChart data={salesData} barGap={10} barSize={20}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} />
                    <YAxis hide={true} />
                    <Tooltip content={<ChartTooltipContent />} cursor={{fill: 'hsl(var(--accent))', radius: 4}} />
                    <Legend iconType="square" />
                    <Bar dataKey="pageViews" stackId="a" fill="hsl(var(--chart-2))" name="Page Views" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="sales" stackId="a" fill="hsl(var(--chart-1))" name="Sales" radius={[4, 4, 0, 0]} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <RecentNotices />
        </div>
      </div>
    </ProtectedRoute>
  );
}
