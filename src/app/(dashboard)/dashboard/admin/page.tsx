
'use client';
import { ProtectedRoute } from '@/components/protected-route';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Users, DollarSign, BarChart3, CalendarCheck } from 'lucide-react';
import { PromotionSuggestions } from '@/components/dashboard/admin/promotion-suggestions';

function RecentNotices() {
  const notices = [
    { title: 'Mid-term Exam Schedule', date: '2024-09-15', audience: 'Students' },
    { title: 'Parent-Teacher Meeting', date: '2024-09-12', audience: 'Parents' },
    { title: 'Annual Sports Day', date: '2024-09-10', audience: 'All School' },
    { title: 'Staff Meeting', date: '2024-09-08', audience: 'Teachers' },
  ];

  const getAudienceBadgeVariant = (audience: string) => {
    switch (audience) {
      case 'Students':
        return 'default';
      case 'Parents':
        return 'secondary';
      case 'Teachers':
        return 'outline';
      default:
        return 'destructive';
    }
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Notices</CardTitle>
        <CardDescription>Important announcements for the school community.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {notices.map((notice, index) => (
            <li key={index} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{notice.title}</p>
                <p className="text-sm text-muted-foreground">{notice.date}</p>
              </div>
              <Badge variant={getAudienceBadgeVariant(notice.audience) as any}>{notice.audience}</Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

const salesData = [
  { name: 'Jan', sales: 4000, views: 2400 },
  { name: 'Feb', sales: 3000, views: 1398 },
  { name: 'Mar', sales: 5000, views: 9800 },
  { name: 'Apr', sales: 2780, views: 3908 },
  { name: 'May', sales: 1890, views: 4800 },
  { name: 'Jun', sales: 2390, views: 3800 },
  { name: 'Jul', sales: 3490, views: 4300 },
];

const performanceData = [
    { name: 'Jan', performance: 78 },
    { name: 'Feb', performance: 82 },
    { name: 'Mar', performance: 80 },
    { name: 'Apr', performance: 85 },
    { name: 'May', performance: 88 },
    { name: 'Jun', performance: 90 },
    { name: 'Jul', performance: 92 },
];


export default function AdminDashboardPage() {
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
              <p className="text-xs text-muted-foreground">+20.1% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$45,231.89</div>
               <p className="text-xs text-muted-foreground">+12.2% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Attendance</CardTitle>
              <CalendarCheck className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className='flex items-center gap-4'>
                    <div className="text-2xl font-bold">92%</div>
                    <div className="w-12 h-12 relative">
                        <svg className="w-full h-full" viewBox="0 0 36 36">
                            <path
                                className="stroke-current text-muted/20"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                strokeWidth="3"
                            />
                            <path
                                className="stroke-current text-primary"
                                strokeDasharray="92, 100"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                strokeWidth="3"
                                strokeLinecap="round"
                                transform="rotate(-90 18 18)"
                            />
                        </svg>
                    </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">+2.5% from yesterday</p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Performance</CardTitle>
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">85%</div>
              <p className="text-xs text-muted-foreground">+5.1% from last term</p>
            </CardContent>
          </Card>
        </div>

        <PromotionSuggestions />

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Sales &amp; Views</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="min-h-64 w-full">
                <ResponsiveContainer width="100%" height={300}>
                   <BarChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} />
                        <YAxis tickLine={false} axisLine={false} width={20} />
                        <Tooltip content={<ChartTooltipContent />} cursor={{fill: 'hsl(var(--accent))'}} />
                        <Legend iconType="square" />
                        <Bar dataKey="views" stackId="a" fill="hsl(var(--chart-2))" name="Page Views" />
                        <Bar dataKey="sales" stackId="a" fill="hsl(var(--chart-1))" name="Sales" />
                    </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
          <RecentNotices />
        </div>

         <div className="grid gap-6 lg:grid-cols-1">
            <Card>
                <CardHeader>
                    <CardTitle>Student Performance</CardTitle>
                    <CardDescription>Average scores across different classes.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={{}} className="min-h-64 w-full">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={performanceData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                                <YAxis tickLine={false} axisLine={false} width={20} />
                                <Tooltip content={<ChartTooltipContent />} cursor={{fill: 'hsl(var(--accent))'}} />
                                <Line type="monotone" dataKey="performance" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
