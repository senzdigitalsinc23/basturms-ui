
'use client';
import { ProtectedRoute } from '@/components/protected-route';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Users, DollarSign, BarChart3, CalendarCheck, BookCopy, RefreshCw } from 'lucide-react';
import { PromotionSuggestions } from '@/components/dashboard/admin/promotion-suggestions';
import { useEffect, useState } from 'react';
import { getStudentProfiles, getStaff, getAnnouncements, Announcement, getExpenses, getPayrolls } from '@/lib/store';
import { format, subDays } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

function RecentNotices() {
  const [notices, setNotices] = useState<Announcement[]>([]);

  useEffect(() => {
    setNotices(getAnnouncements().slice(0, 4));
  }, []);

  const getAudienceBadgeVariant = (audience: string) => {
    switch (audience) {
      case 'Students': return 'default';
      case 'Parents': return 'secondary';
      case 'Teachers': return 'outline';
      default: return 'destructive';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Notices</CardTitle>
        <CardDescription>Important announcements for the school community.</CardDescription>
      </CardHeader>
      <CardContent>
        {notices.length > 0 ? (
          <ul className="space-y-4">
            {notices.map((notice) => (
              <li key={notice.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{notice.title}</p>
                  <p className="text-sm text-muted-foreground">{format(new Date(notice.created_at), 'PPP')}</p>
                </div>
                <Badge variant={getAudienceBadgeVariant(notice.audience) as any}>{notice.audience}</Badge>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">No recent announcements.</p>
        )}
      </CardContent>
    </Card>
  );
}

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
    const [stats, setStats] = useState({
        totalStudents: 0,
        studentChange: 0,
        totalRevenue: 0,
        revenueChange: 0,
        avgAttendance: 0,
        avgPerformance: 0,
    });
    const [financeChartData, setFinanceChartData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      async function fetchData() {
        setLoading(true);
        const { students: studentProfiles } = await getStudentProfiles();
        const lastMonth = subDays(new Date(), 30);
        
        const totalStudents = studentProfiles.length;
        const newStudents = studentProfiles.filter(p => new Date(p.admissionDetails.enrollment_date) > lastMonth).length;
        
        let totalRevenue = 0;
        studentProfiles.forEach(p => {
            p.financialDetails?.payment_history.forEach(h => {
                totalRevenue += h.amount_paid;
            });
        });

        const payrolls = getPayrolls();
        const expenses = getExpenses();
        const totalSalaries = payrolls.reduce((acc, p) => acc + p.total_amount, 0);
        const totalOtherExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

        const feeData = { name: 'Fees', value: totalRevenue };
        const salaryData = { name: 'Salaries', value: totalSalaries };
        const expenseData = { name: 'Other Expenses', value: totalOtherExpenses };

        setFinanceChartData([feeData, salaryData, expenseData]);
        
        let totalAttendance = 0;
        let attendanceDays = 0;
        studentProfiles.forEach(p => {
            p.attendanceRecords?.forEach(rec => {
                attendanceDays++;
                if (rec.status === 'Present' || rec.status === 'Late') totalAttendance++;
            });
        });
        const avgAttendance = attendanceDays > 0 ? (totalAttendance / attendanceDays) * 100 : 0;
        
        let totalScore = 0;
        let scoreCount = 0;
        studentProfiles.forEach(p => {
            p.assignmentScores?.forEach(score => {
                totalScore += score.score;
                scoreCount++;
            });
        });
        const avgPerformance = scoreCount > 0 ? totalScore / scoreCount : 0;

        setStats({
            totalStudents,
            studentChange: newStudents,
            totalRevenue,
            revenueChange: 12.2, // Placeholder
            avgAttendance,
            avgPerformance,
        });
        setLoading(false);
      }
      fetchData();
    }, []);

    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(amount);

  return (
    <ProtectedRoute allowedRoles={['Admin']}>
        <div className="flex flex-col gap-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            <>
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
            </>
          ) : (
            <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">{stats.totalStudents}</div>
                <p className="text-xs text-muted-foreground">+{stats.studentChange} from last month</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">+{stats.revenueChange}% from last month</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Attendance</CardTitle>
                <CalendarCheck className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className='flex items-center gap-4'>
                        <div className="text-2xl font-bold">{stats.avgAttendance.toFixed(1)}%</div>
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
                                    strokeDasharray={`${stats.avgAttendance.toFixed(0)}, 100`}
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    transform="rotate(-90 18 18)"
                                />
                            </svg>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Performance</CardTitle>
                <BarChart3 className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">{stats.avgPerformance.toFixed(1)}%</div>
                </CardContent>
            </Card>
            </>
          )}
        </div>

        <PromotionSuggestions />

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Financial Overview</CardTitle>
              <CardDescription>A breakdown of total fees collected vs. school expenditure.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="min-h-64 w-full">
                <ResponsiveContainer width="100%" height={300}>
                   <BarChart data={financeChartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} />
                        <YAxis tickLine={false} axisLine={false} width={20} tickFormatter={(value) => `${value / 1000}k`}/>
                        <Tooltip content={<ChartTooltipContent />} cursor={{fill: 'hsl(var(--accent))'}} />
                        <Legend iconType="square" />
                        <Bar dataKey="value" name="Amount (GHS)" fill="hsl(var(--chart-1))" />
                    </BarChart>
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
