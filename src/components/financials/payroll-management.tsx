
'use client';
import { useState, useEffect, useMemo } from 'react';
import { getStaff, getPayrolls, savePayroll, Payroll, PayrollStatus, addExpense, addAuditLog, getUserById, updateStaff as storeUpdateStaff } from '@/lib/store';
import { Staff } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Loader2, CheckCircle, XCircle, MoreHorizontal } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '../ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '../ui/input';

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(amount);

const statusColors: Record<PayrollStatus, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Approved: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
};

export function PayrollManagement() {
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { user } = useAuth();
  const { toast } = useToast();

  const refreshData = () => {
    setPayrolls(getPayrolls());
    setStaff(getStaff().filter(s => s.status === 'Active'));
  }

  useEffect(() => {
    refreshData();
  }, []);

  const handleGeneratePayroll = () => {
    if (!user) return;
    setIsLoading(true);

    const monthStr = format(new Date(selectedYear, selectedMonth), 'MMMM yyyy');
    
    if (payrolls.some(p => p.month === monthStr)) {
        toast({ variant: 'destructive', title: 'Payroll Exists', description: `A payroll for ${monthStr} already exists.`});
        setIsLoading(false);
        return;
    }

    const payrollItems = staff.map(s => ({
        staff_id: s.staff_id,
        staff_name: `${s.first_name} ${s.last_name}`,
        base_salary: s.salary || 0,
        deductions: 0, // Placeholder for future implementation
        net_salary: s.salary || 0,
    }));
    
    const total_amount = payrollItems.reduce((acc, item) => acc + item.net_salary, 0);

    const newPayroll: Payroll = {
        id: `PAY-${Date.now()}`,
        month: monthStr,
        generated_at: new Date().toISOString(),
        generated_by: user.id,
        status: 'Pending',
        items: payrollItems,
        total_amount,
    };
    
    const updatedPayrolls = [...payrolls, newPayroll];
    savePayroll(updatedPayrolls);
    setPayrolls(updatedPayrolls);
    
    addAuditLog({
        user: user.email, name: user.name,
        action: 'Generate Payroll',
        details: `Generated payroll for ${monthStr} with a total of ${formatCurrency(total_amount)}.`
    });

    setIsLoading(false);
    toast({ title: 'Payroll Generated', description: `Payroll for ${monthStr} has been created and is pending approval.` });
  };

  const handleUpdateStatus = (payrollId: string, status: PayrollStatus) => {
    if (!user) return;
    const updatedPayrolls = payrolls.map(p => {
        if (p.id === payrollId) {
            const updatedPayroll = { ...p, status, approved_by: user.id, approved_at: new Date().toISOString() };
            
            if (status === 'Approved') {
                addExpense({
                    id: `exp_payroll_${p.id}`,
                    date: new Date().toISOString(),
                    description: `Salary payment for ${p.month}`,
                    category: 'Salaries',
                    amount: p.total_amount,
                    paymentMethod: 'Bank Transfer',
                    recorded_by: user.id
                });
                toast({ title: 'Payroll Approved', description: `An expense of ${formatCurrency(p.total_amount)} for ${p.month} salaries has been recorded.` });
            } else {
                 toast({ title: 'Payroll Rejected', description: `Payroll for ${p.month} has been rejected.` });
            }

             addAuditLog({
                user: user.email, name: user.name,
                action: `Payroll ${status}`,
                details: `${status} payroll for ${p.month}.`
            });
            return updatedPayroll;
        }
        return p;
    });
    savePayroll(updatedPayrolls);
    setPayrolls(updatedPayrolls);
  };
  
  const handleUpdateSalary = (staffId: string, salary: number) => {
    if (!user) return;
    const staffToUpdate = getStaff().find(s => s.staff_id === staffId);
    if(staffToUpdate) {
        storeUpdateStaff(staffId, { ...staffToUpdate, salary }, user.id);
        refreshData();
        toast({ title: 'Salary Updated', description: `Salary for ${staffToUpdate.first_name} has been set.` });
    }
  }

  const canGenerate = !payrolls.some(p => p.month === format(new Date(selectedYear, selectedMonth), 'MMMM yyyy'));
  const isAdmin = user?.role === 'Admin' || user?.role === 'Headmaster';


  return (
    <Tabs defaultValue="payroll">
      <TabsList>
        <TabsTrigger value="payroll">Payroll Runs</TabsTrigger>
        <TabsTrigger value="salaries">Salary Setup</TabsTrigger>
      </TabsList>
      <TabsContent value="payroll" className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Generate New Payroll</CardTitle>
                <CardDescription>Select a month and year to generate a new payroll for all active staff.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
                <Select value={String(selectedMonth)} onValueChange={(v) => setSelectedMonth(Number(v))}>
                    <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => (
                            <SelectItem key={i} value={String(i)}>{format(new Date(0, i), 'MMMM')}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
                    <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                            <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button onClick={handleGeneratePayroll} disabled={isLoading || !canGenerate}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                    Generate
                </Button>
                 {!canGenerate && <p className="text-sm text-muted-foreground">Payroll for this month already exists.</p>}
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Generated Payrolls</CardTitle>
                <CardDescription>Review, approve, or reject generated payrolls.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Month</TableHead>
                                <TableHead>Total Amount</TableHead>
                                <TableHead>Generated By</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payrolls.map(p => (
                                <TableRow key={p.id}>
                                    <TableCell className="font-medium">{p.month}</TableCell>
                                    <TableCell>{formatCurrency(p.total_amount)}</TableCell>
                                    <TableCell>{getUserById(p.generated_by)?.name || 'N/A'}</TableCell>
                                    <TableCell>
                                        <Badge className={statusColors[p.status]}>{p.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {p.status === 'Pending' && isAdmin && (
                                            <div className="flex gap-1 justify-end">
                                                <Button size="sm" variant="outline" className="text-green-600 border-green-600 hover:bg-green-50" onClick={() => handleUpdateStatus(p.id, 'Approved')}>
                                                    <CheckCircle className="mr-2 h-4 w-4"/> Approve
                                                </Button>
                                                <Button size="sm" variant="outline" className="text-red-600 border-red-600 hover:bg-red-50" onClick={() => handleUpdateStatus(p.id, 'Rejected')}>
                                                    <XCircle className="mr-2 h-4 w-4"/> Reject
                                                </Button>
                                            </div>
                                        )}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="salaries">
        <Card>
            <CardHeader>
                <CardTitle>Staff Salary Setup</CardTitle>
                <CardDescription>Set the base salary for each staff member.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Staff Name</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Salary (GHS)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {staff.map(s => (
                                <TableRow key={s.staff_id}>
                                    <TableCell className="font-medium">{s.first_name} {s.last_name}</TableCell>
                                    <TableCell>{s.roles.join(', ')}</TableCell>
                                    <TableCell>
                                        <Input 
                                            type="number" 
                                            className="w-40" 
                                            defaultValue={s.salary || ''} 
                                            onBlur={(e) => handleUpdateSalary(s.staff_id, Number(e.target.value))}
                                            placeholder="Set salary"
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
