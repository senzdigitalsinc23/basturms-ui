
'use client';

import { useState, useEffect, useMemo } from 'react';
import { getPayrolls, getStaff, getUserById, getSchoolProfile } from '@/lib/store';
import { Payroll, PayrollItem, Staff } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { ProtectedRoute } from '@/components/protected-route';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download, WalletCards } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(amount);

const generatePayslipPdf = (item: PayrollItem, payroll: Payroll) => {
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

export default function MyPayslipsPage() {
    const { user } = useAuth();
    const [staffMember, setStaffMember] = useState<Staff | null>(null);
    const [myPayrolls, setMyPayrolls] = useState<Payroll[]>([]);
    const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null);

    useEffect(() => {
        if (user) {
            const currentStaff = getStaff().find(s => s.user_id === user.id);
            if (currentStaff) {
                setStaffMember(currentStaff);
                const allPayrolls = getPayrolls();
                const staffPayrolls = allPayrolls
                    .filter(p => p.status === 'Approved' && p.items.some(item => item.staff_id === currentStaff.staff_id))
                    .sort((a, b) => new Date(b.generated_at).getTime() - new Date(a.generated_at).getTime());
                setMyPayrolls(staffPayrolls);
                if (staffPayrolls.length > 0) {
                    setSelectedPayroll(staffPayrolls[0]);
                }
            }
        }
    }, [user]);

    const handleSelectPayroll = (payrollId: string) => {
        const payroll = myPayrolls.find(p => p.id === payrollId);
        setSelectedPayroll(payroll || null);
    };

    const selectedPayslipItem = useMemo(() => {
        if (!selectedPayroll || !staffMember) return null;
        return selectedPayroll.items.find(item => item.staff_id === staffMember.staff_id) || null;
    }, [selectedPayroll, staffMember]);

    const staffRoles: Role[] = ['Teacher', 'Admin', 'Headmaster', 'Accountant', 'Librarian', 'Security', 'Procurement Manager', 'Stores Manager', 'Proprietor', 'I.T Manager', 'I.T Support'];

    return (
        <ProtectedRoute allowedRoles={staffRoles}>
            <div className="space-y-6">
                 <div>
                    <h1 className="text-3xl font-bold font-headline">My Payslips</h1>
                    <p className="text-muted-foreground">View and download your monthly salary statements.</p>
                </div>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Select Payslip</CardTitle>
                        <CardDescription>Choose a month to view your payslip details.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Select onValueChange={handleSelectPayroll} value={selectedPayroll?.id}>
                            <SelectTrigger className="w-full md:w-72">
                                <SelectValue placeholder="Select a month..." />
                            </SelectTrigger>
                            <SelectContent>
                                {myPayrolls.map(p => (
                                    <SelectItem key={p.id} value={p.id}>{p.month}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>
                
                {selectedPayroll && selectedPayslipItem ? (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Payslip for {selectedPayroll.month}</CardTitle>
                                <CardDescription>
                                    Generated on {new Date(selectedPayroll.generated_at).toLocaleDateString()}
                                </CardDescription>
                            </div>
                            <Button size="sm" onClick={() => generatePayslipPdf(selectedPayslipItem, selectedPayroll)}>
                                <Download className="mr-2 h-4 w-4" />
                                Download PDF
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <h4 className="font-semibold text-lg mb-2">Earnings</h4>
                                    <Table>
                                        <TableBody>
                                            <TableRow><TableCell>Base Salary</TableCell><TableCell className="text-right">{formatCurrency(selectedPayslipItem.base_salary)}</TableCell></TableRow>
                                            <TableRow><TableCell>Allowances</TableCell><TableCell className="text-right">{formatCurrency(selectedPayslipItem.allowances || 0)}</TableCell></TableRow>
                                            <TableRow><TableCell>Bonuses</TableCell><TableCell className="text-right">{formatCurrency(selectedPayslipItem.bonuses || 0)}</TableCell></TableRow>
                                            <TableRow className="font-bold bg-muted/50"><TableCell>Gross Salary</TableCell><TableCell className="text-right">{formatCurrency(selectedPayslipItem.gross_salary)}</TableCell></TableRow>
                                        </TableBody>
                                    </Table>
                                </div>
                                 <div>
                                    <h4 className="font-semibold text-lg mb-2">Deductions</h4>
                                    <Table>
                                        <TableBody>
                                            <TableRow><TableCell>Salary Advance</TableCell><TableCell className="text-right">{formatCurrency(selectedPayslipItem.deductions || 0)}</TableCell></TableRow>
                                            <TableRow className="font-bold bg-muted/50"><TableCell>Total Deductions</TableCell><TableCell className="text-right">{formatCurrency(selectedPayslipItem.deductions || 0)}</TableCell></TableRow>
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                            <div className="mt-6 p-4 bg-primary/10 rounded-lg flex justify-between items-center">
                                <h3 className="text-xl font-bold text-primary">Net Salary</h3>
                                <p className="text-2xl font-bold text-primary">{formatCurrency(selectedPayslipItem.net_salary)}</p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <WalletCards className="mx-auto h-12 w-12 text-muted-foreground" />
                            <p className="mt-4 text-muted-foreground">Select a month to view payslip details, or no payslips are available.</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </ProtectedRoute>
    )
}
