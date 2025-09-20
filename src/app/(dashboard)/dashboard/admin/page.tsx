'use client';
import { ProtectedRoute } from '@/components/protected-route';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { getAuditLogs, getUsers } from '@/lib/store';
import { AuditLog, Role, User as UserType } from '@/lib/types';
import { Activity, PieChart as PieChartIcon, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Bar, BarChart as RechartsBarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { subDays, format, parseISO, isValid, formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

function RecentUsers() {
  const [recentUsers, setRecentUsers] = useState<UserType[]>([]);

  useEffect(() => {
    const allUsers = getUsers();
    const sortedUsers = [...allUsers].sort((a, b) => {
        const dateA = a.created_at ? parseISO(a.created_at).getTime() : 0;
        const dateB = b.created_at ? parseISO(b.created_at).getTime() : 0;
        return dateB - dateA;
    });
    setRecentUsers(sortedUsers.slice(0, 5));
  }, []);

  const formatRelativeTime = (dateString: string | undefined) => {
    if (!dateString) return 'date unknown';
    const date = parseISO(dateString);
    if (isValid(date)) {
        return formatDistanceToNow(date, { addSuffix: true });
    }
    return 'invalid date';
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Sign-ups</CardTitle>
        <CardDescription>The 5 most recently created user accounts.</CardDescription>
      </CardHeader>
      <CardContent>
        {recentUsers.length > 0 ? (
          <ul className="space-y-4">
            {recentUsers.map((user) => (
              <li key={user.id} className="flex items-center justify-between">
                <div className='flex items-center gap-3'>
                  <Avatar>
                    <AvatarImage src={user.avatarUrl} />
                    <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className='text-right'>
                  <Badge variant='outline'>{user.role}</Badge>
                  <p className='text-sm text-muted-foreground mt-1'>{formatRelativeTime(user.created_at)}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            No recent users found.
          </div>
        )}
      </CardContent>
    </Card>
  );
}


export default function AdminDashboardPage() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [recentLogsCount, setRecentLogsCount] = useState(0);
  const [roleDistribution, setRoleDistribution] = useState<{ name: string; value: number }[]>([]);
  const [activityData, setActivityData] = useState<{ date: string; actions: number }[]>([]);

  useEffect(() => {
    const users = getUsers();
    const logs = getAuditLogs();
    
    setTotalUsers(users.length);
    setActiveUsers(users.filter(u => u.status === 'active').length);

    const oneDayAgo = subDays(new Date(), 1);
    setRecentLogsCount(logs.filter(log => parseISO(log.timestamp) > oneDayAgo).length);

    const roles: { [key in Role]?: number } = {};
    users.forEach(user => {
      if (roles[user.role]) {
        roles[user.role]!++;
      } else {
        roles[user.role] = 1;
      }
    });
    setRoleDistribution(Object.entries(roles).map(([name, value]) => ({ name, value })));
    
    const sevenDaysAgo = subDays(new Date(), 7);
    const recentLogs = logs.filter(log => parseISO(log.timestamp) > sevenDaysAgo);
    const activityByDay: { [key: string]: number } = {};

    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const formattedDate = format(date, 'MMM d');
      activityByDay[formattedDate] = 0;
    }

    recentLogs.forEach(log => {
      const formattedDate = format(parseISO(log.timestamp), 'MMM d');
      if (activityByDay[formattedDate] !== undefined) {
        activityByDay[formattedDate]++;
      }
    });
    setActivityData(Object.entries(activityByDay).map(([date, actions]) => ({ date, actions })));

  }, []);

  return (
    <ProtectedRoute allowedRoles={['Admin']}>
        <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            A complete overview of the system, user activity, and more.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">All registered user accounts</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeUsers}</div>
               <p className="text-xs text-muted-foreground">{totalUsers > 0 ? `${((activeUsers/totalUsers) * 100).toFixed(0)}% of total users` : 'No users yet'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Actions (24h)</CardTitle>
              <Activity className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{recentLogsCount}</div>
                <p className="text-xs text-muted-foreground">User actions recorded in logs</p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">User Roles</CardTitle>
              <PieChartIcon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{roleDistribution.length}</div>
              <p className="text-xs text-muted-foreground">Distinct roles assigned</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>User actions over the last 7 days.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="min-h-64 w-full">
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={activityData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" tickLine={false} axisLine={false} />
                        <YAxis tickLine={false} axisLine={false} width={20}/>
                        <Tooltip content={<ChartTooltipContent />} cursor={{fill: 'hsl(var(--accent))'}} />
                        <Line type="monotone" dataKey="actions" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>User Role Distribution</CardTitle>
                <CardDescription>A breakdown of all user roles.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={{}} className="min-h-64 w-full">
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Tooltip content={<ChartTooltipContent />} />
                            <Pie data={roleDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="hsl(var(--primary))" label={(props) => `${props.name} (${props.value})`}>
                                {roleDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
          </Card>
        </div>
         <div className="grid gap-6 lg:grid-cols-1">
          <RecentUsers />
        </div>
      </div>
    </ProtectedRoute>
  );
}
