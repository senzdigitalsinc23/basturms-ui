
'use client';
import { useState, useEffect, useMemo } from 'react';
import { getStaff, getPayrolls, savePayroll, Payroll, PayrollStatus, addExpense, addAuditLog, getUserById, updateStaff as storeUpdateStaff, saveToStorage, STAFF_KEY } from '@/lib/store';
import { Staff, PayrollItem, SalaryAdvance } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Loader2, CheckCircle, XCircle, MoreHorizontal, Trash2, Download, Save } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '../ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../ui/dropdown-menu';
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { DialogContent } from '@radix-ui/react-dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { getSchoolProfile } from '@/lib/store';


const formatCurrency = (amount: number) => new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(amount);

const statusColors: Record<PayrollStatus, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Approved: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
};

function PayrollDetailsDialog({ payroll, open, onOpenChange, onUpdate, onGeneratePayslip }: { payroll: Payroll | null, open: boolean, onOpenChange: (open: boolean) => void, onUpdate: (payroll: Payroll) => void, onGeneratePayslip: (item: PayrollItem, payroll: Payroll) => void }) {
    const [editingItems, setEditingItems] = useState<Record<string, Partial<PayrollItem>>>({});

    useEffect(() => {
        if (payroll) {
            const initialEdits: Record<string, Partial<PayrollItem>> = {};
            payroll.items.forEach(item => {
                initialEdits[item.staff_id] = { allowances: item.allowances || 0, bonuses: item.bonuses || 0 };
            });
            setEditingItems(initialEdits);
        }
    }, [payroll]);

    if (!payroll) return null;
    
    const handleItemChange = (staffId: string, field: 'allowances' | 'bonuses', value: number) => {
        setEditingItems(prev => ({
            ...prev,
            [staffId]: { ...prev[staffId], [field]: value }
        }));
    };

    const handleSave = () => {
        const updatedItems = payroll.items.map(item => {
            const edits = editingItems[item.staff_id];
            if (edits) {
                const updatedItem = { ...item, ...edits };
                const grossSalary = (updatedItem.base_salary || 0) + (updatedItem.allowances || 0) + (updatedItem.bonuses || 0);
                const netSalary = grossSalary - (updatedItem.deductions || 0);
                return { ...updatedItem, gross_salary: grossSalary, net_salary: netSalary };
            }
            return item;
        });
        const total_amount = updatedItems.reduce((acc, item) => acc + (item.net_salary || 0), 0);
        onUpdate({ ...payroll, items: updatedItems, total_amount });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl">
                <DialogHeader>
                    <DialogTitle>Payroll Details for {payroll.month}</DialogTitle>
                    <DialogDescription>Review and adjust allowances or bonuses for this payroll run. Any changes will require re-approval.</DialogDescription>
                </DialogHeader>
                <div className="max-h-[70vh] overflow-y-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Staff Name</TableHead>
                                <TableHead>Base Salary</TableHead>
                                <TableHead>Allowances</TableHead>
                                <TableHead>Bonuses</TableHead>
                                <TableHead>Deductions</TableHead>
                                <TableHead>Net Salary</TableHead>
                                <TableHead>Payslip</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payroll.items.map(item => (
                                <TableRow key={item.staff_id}>
                                    <TableCell>{item.staff_name}</TableCell>
                                    <TableCell>{formatCurrency(item.base_salary)}</TableCell>
                                    <TableCell>
                                        <Input type="number" min="0" className="w-28" value={editingItems[item.staff_id]?.allowances || 0} onChange={(e) => handleItemChange(item.staff_id, 'allowances', Number(e.target.value))} disabled={payroll.status !== 'Pending'}/>
                                    </TableCell>
                                    <TableCell>
                                        <Input type="number" min="0" className="w-28" value={editingItems[item.staff_id]?.bonuses || 0} onChange={(e) => handleItemChange(item.staff_id, 'bonuses', Number(e.target.value))} disabled={payroll.status !== 'Pending'}/>
                                    </TableCell>
                                    <TableCell>{formatCurrency(item.deductions || 0)}</TableCell>
                                    <TableCell>{formatCurrency(item.net_salary)}</TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" onClick={() => onGeneratePayslip(item, payroll)} disabled={payroll.status !== 'Approved'}>
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                {payroll.status === 'Pending' && <div className="flex justify-end pt-4"><Button onClick={handleSave}>Save Changes</Button></div>}
            </DialogContent>
        </Dialog>
    )
}

export function PayrollManagement() {
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null);
  const [isAdvanceOpen, setIsAdvanceOpen] = useState(false);
  const [selectedStaffForAdvance, setSelectedStaffForAdvance] = useState<string | undefined>();
  const [advanceAmount, setAdvanceAmount] = useState<number | ''>('');
  const [repaymentMonths, setRepaymentMonths] = useState<number | ''>('');
  const [salaryInputs, setSalaryInputs] = useState<Record<string, number | string>>({});


  const { user } = useAuth();
  const { toast } = useToast();

  const refreshData = () => {
    const allStaff = getStaff().filter(s => s.status === 'Active');
    setPayrolls(getPayrolls());
    setStaff(allStaff);

    const initialSalaries: Record<string, number | string> = {};
    allStaff.forEach(s => {
        initialSalaries[s.staff_id] = s.salary || '';
    });
    setSalaryInputs(initialSalaries);
  }

  useEffect(() => {
    refreshData();
  }, []);

  const calculateDeductions = (staffId: string): number => {
    const s = getStaff().find(st => st.staff_id === staffId);
    if (!s || !s.salary_advances) return 0;
    
    let totalDeduction = 0;
    s.salary_advances.forEach(adv => {
        if(adv.repayments_made < adv.repayment_months) {
            totalDeduction += adv.monthly_deduction;
        }
    });
    return totalDeduction;
  }

  const handleGeneratePayroll = () => {
    if (!user) return;
    setIsLoading(true);

    const monthStr = format(new Date(selectedYear, selectedMonth), 'MMMM yyyy');
    
    if (payrolls.some(p => p.month === monthStr)) {
        toast({ variant: 'destructive', title: 'Payroll Exists', description: `A payroll for ${monthStr} already exists.`});
        setIsLoading(false);
        return;
    }

    const payrollItems = staff.map(s => {
        const base_salary = s.salary || 0;
        const deductions = calculateDeductions(s.staff_id);
        const gross_salary = base_salary; // Allowances/Bonuses are added later
        const net_salary = gross_salary - deductions;

        return {
            staff_id: s.staff_id,
            staff_name: `${s.first_name} ${s.last_name}`,
            base_salary,
            allowances: 0,
            bonuses: 0,
            gross_salary,
            deductions,
            net_salary,
        }
    });
    
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
    refreshData();
    
    addAuditLog({
        user: user.email, name: user.name,
        action: 'Generate Payroll',
        details: `Generated payroll for ${monthStr} with a total of ${formatCurrency(total_amount)}.`
    });

    setIsLoading(false);
    toast({ title: 'Payroll Generated', description: `Payroll for ${monthStr} has been created and is pending approval.` });
  };

  const handleUpdatePayroll = (updatedPayroll: Payroll) => {
    const updatedPayrolls = payrolls.map(p => p.id === updatedPayroll.id ? {...updatedPayroll, status: 'Pending'} : p);
    savePayroll(updatedPayrolls);
    refreshData();
    setIsDetailsOpen(false);
    toast({ title: 'Payroll Updated', description: 'Changes have been saved. The payroll requires re-approval.'});
  }
  
  const handleDeletePayroll = (payrollId: string) => {
    if (!user || user.role !== 'Admin') {
        toast({variant: 'destructive', title: 'Permission Denied'});
        return;
    }
    const updatedPayrolls = payrolls.filter(p => p.id !== payrollId);
    savePayroll(updatedPayrolls);
    refreshData();
    toast({title: 'Payroll Deleted'});
  }

  const handleUpdateStatus = (payrollId: string, status: PayrollStatus) => {
    if (!user) return;
    const payroll = payrolls.find(p => p.id === payrollId);
    if (!payroll) return;

    const updatedPayrolls = payrolls.map(p => p.id === payrollId ? { ...p, status, approved_by: user.id, approved_at: new Date().toISOString() } : p);

    if (status === 'Approved') {
        addExpense({
            id: `exp_payroll_${payroll.id}`,
            date: new Date().toISOString(),
            description: `Salary payment for ${payroll.month}`,
            category: 'Salaries',
            amount: payroll.total_amount,
            paymentMethod: 'Bank Transfer',
            recorded_by: user.id
        });
        
        // Update salary advance repayments
        const staffList = getStaff();
        payroll.items.forEach(item => {
            if(item.deductions && item.deductions > 0) {
                const staffMember = staffList.find(s => s.staff_id === item.staff_id);
                if (staffMember && staffMember.salary_advances) {
                    staffMember.salary_advances.forEach(adv => {
                        if (adv.repayments_made < adv.repayment_months) {
                            adv.repayments_made += 1;
                        }
                    });
                }
            }
        });
        saveToStorage(STAFF_KEY, staffList);


        toast({ title: 'Payroll Approved', description: `An expense of ${formatCurrency(payroll.total_amount)} for ${payroll.month} salaries has been recorded.` });
    } else {
        toast({ title: 'Payroll Rejected', description: `Payroll for ${payroll.month} has been rejected.` });
    }
    
    savePayroll(updatedPayrolls);
    refreshData();

    addAuditLog({
        user: user.email, name: user.name,
        action: `Payroll ${status}`,
        details: `${status} payroll for ${payroll.month}.`
    });
  };
  
    const handleSalaryInputChange = (staffId: string, value: string) => {
        setSalaryInputs(prev => ({ ...prev, [staffId]: value }));
    };
  
    const handleUpdateSalary = (staffId: string) => {
        if (!user) return;
        const salaryValue = Number(salaryInputs[staffId]);
        if (isNaN(salaryValue) || salaryValue < 0) {
            toast({ variant: 'destructive', title: 'Invalid Salary', description: 'Please enter a valid, non-negative salary.' });
            return;
        }

        const staffToUpdate = getStaff().find(s => s.staff_id === staffId);
        if(staffToUpdate) {
            storeUpdateStaff(staffId, { ...staffToUpdate, salary: salaryValue }, user.id);
            refreshData();
            toast({ title: 'Salary Updated', description: `Salary for ${staffToUpdate.first_name} has been set.` });
        }
    }

  const handleGeneratePayslip = (item: PayrollItem, payroll: Payroll) => {
    const doc = new jsPDF();
    const schoolProfile = getSchoolProfile();
    doc.setFontSize(18);
    doc.text(schoolProfile?.schoolName || "CampusConnect School", 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Payslip for ${payroll.month}`, 105, 30, { align: 'center' });

    (doc as any).autoTable({
        startY: 40,
        body: [
            ['Staff Name', item.staff_name],
            ['Staff ID', item.staff_id],
        ],
        theme: 'plain'
    });

    (doc as any).autoTable({
        startY: (doc as any).lastAutoTable.finalY + 5,
        head: [['Earnings', 'Amount', 'Deductions', 'Amount']],
        body: [
            ['Base Salary', formatCurrency(item.base_salary)],
            ['Allowances', formatCurrency(item.allowances || 0), 'Salary Advance', formatCurrency(item.deductions || 0)],
            ['Bonuses', formatCurrency(item.bonuses || 0), '', ''],
        ],
        foot: [
            ['Gross Salary', formatCurrency(item.gross_salary || item.base_salary), 'Total Deductions', formatCurrency(item.deductions || 0)],
            [{ content: `Net Salary: ${formatCurrency(item.net_salary)}`, colSpan: 4, styles: { fontStyle: 'bold', halign: 'center' }}]
        ],
        theme: 'striped',
    });
    
    doc.save(`Payslip_${item.staff_name.replace(' ', '_')}_${payroll.month}.pdf`);
  }

  const handleAddSalaryAdvance = () => {
    if (!user || !selectedStaffForAdvance || !advanceAmount || !repaymentMonths) return;

    const staffList = getStaff();
    const staffIndex = staffList.findIndex(s => s.staff_id === selectedStaffForAdvance);
    if (staffIndex === -1) return;

    const newAdvance: SalaryAdvance = {
        id: `ADV-${Date.now()}`,
        amount: advanceAmount,
        date_requested: new Date().toISOString(),
        repayment_months: repaymentMonths,
        monthly_deduction: advanceAmount / repaymentMonths,
        repayments_made: 0,
    };

    if (!staffList[staffIndex].salary_advances) {
        staffList[staffIndex].salary_advances = [];
    }
    staffList[staffIndex].salary_advances!.push(newAdvance);
    saveToStorage(STAFF_KEY, staffList);
    refreshData();

    toast({title: "Salary Advance Recorded"});
    setIsAdvanceOpen(false);
    setSelectedStaffForAdvance(undefined);
    setAdvanceAmount('');
    setRepaymentMonths('');
  }

  const canGenerate = !payrolls.some(p => p.month === format(new Date(selectedYear, selectedMonth), 'MMMM yyyy'));
  const isAdmin = user?.role === 'Admin' || user?.role === 'Headmaster';


  return (
    <Tabs defaultValue="payroll">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="payroll">Payroll Runs</TabsTrigger>
        <TabsTrigger value="salaries">Salary Setup</TabsTrigger>
        <TabsTrigger value="advances">Salary Advance</TabsTrigger>
      </TabsList>
      <TabsContent value="payroll" className="space-y-6 pt-4">
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
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onClick={() => { setSelectedPayroll(p); setIsDetailsOpen(true); }}>View Details</DropdownMenuItem>
                                                <DropdownMenuSeparator/>
                                                {p.status === 'Pending' && isAdmin && (
                                                    <>
                                                        <DropdownMenuItem onClick={() => handleUpdateStatus(p.id, 'Approved')} className="text-green-600 focus:text-green-600">Approve</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleUpdateStatus(p.id, 'Rejected')} className="text-red-600 focus:text-red-600">Reject</DropdownMenuItem>
                                                        <DropdownMenuSeparator/>
                                                    </>
                                                )}
                                                {isAdmin && (
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">Delete</DropdownMenuItem>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                <AlertDialogDescription>This will permanently delete the payroll for {p.month}. This action cannot be undone.</AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDeletePayroll(p.id)}>Delete</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                )}
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
      <TabsContent value="salaries" className="pt-4">
        <Card>
            <CardHeader>
                <CardTitle>Staff Salary Setup</CardTitle>
                <CardDescription>Set the base salary for each staff member. This is the foundational amount used for payroll generation.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Staff Name</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Base Salary (GHS)</TableHead>
                                <TableHead className="text-right">Action</TableHead>
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
                                            min="0"
                                            className="w-40" 
                                            value={salaryInputs[s.staff_id] || ''}
                                            onChange={(e) => handleSalaryInputChange(s.staff_id, e.target.value)}
                                            placeholder="Set salary"
                                        />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button size="sm" onClick={() => handleUpdateSalary(s.staff_id)}>
                                            <Save className="mr-2 h-4 w-4" />
                                            Save
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="advances" className="pt-4">
        <Card>
            <CardHeader>
                <CardTitle>Salary Advance</CardTitle>
                <CardDescription>Provide a salary advance to a staff member and set up a repayment plan.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Select value={selectedStaffForAdvance} onValueChange={setSelectedStaffForAdvance}>
                        <SelectTrigger><SelectValue placeholder="Select Staff Member" /></SelectTrigger>
                        <SelectContent>
                            {staff.map(s => <SelectItem key={s.staff_id} value={s.staff_id}>{s.first_name} {s.last_name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Input type="number" min="0" placeholder="Advance Amount (GHS)" value={advanceAmount} onChange={(e) => setAdvanceAmount(Number(e.target.value) || '')} />
                    <Input type="number" min="1" placeholder="Repayment Months" value={repaymentMonths} onChange={(e) => setRepaymentMonths(Number(e.target.value) || '')}/>
                 </div>
                 <Button onClick={handleAddSalaryAdvance} disabled={!selectedStaffForAdvance || !advanceAmount || !repaymentMonths}>Record Advance</Button>
            </CardContent>
        </Card>
      </TabsContent>

       <PayrollDetailsDialog payroll={selectedPayroll} open={isDetailsOpen} onOpenChange={setIsDetailsOpen} onUpdate={handleUpdatePayroll} onGeneratePayslip={handleGeneratePayslip}/>
    </Tabs>
  );
}
