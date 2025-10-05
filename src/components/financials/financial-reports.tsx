
'use client';
import { useState, useEffect, useMemo } from 'react';
import { getStudentProfiles, getClasses, getTermlyBills } from '@/lib/store';
import { StudentProfile, Class, TermPayment, TermlyBill } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Download, Search, X } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format, isWithinInterval } from 'date-fns';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Papa from 'papaparse';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '../ui/badge';

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(amount);

type PaymentRecord = {
    studentId: string;
    studentName: string;
    className: string;
    paymentDate: string;
    amount: number;
    totalBilled: number;
    method: string;
    billNumber: string;
    receiptNumber?: string;
}

type DebtorRecord = {
    studentId: string;
    studentName: string;
    className: string;
    outstandingBalance: number;
}

export function FinancialReports() {
    const [allProfiles, setAllProfiles] = useState<StudentProfile[]>([]);
    const [allClasses, setAllClasses] = useState<Class[]>([]);
    const [allBills, setAllBills] = useState<TermlyBill[]>([]);
    const [filteredPaymentRecords, setFilteredPaymentRecords] = useState<PaymentRecord[]>([]);
    const [debtorsList, setDebtorsList] = useState<DebtorRecord[]>([]);
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [selectedClass, setSelectedClass] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        setAllProfiles(getStudentProfiles());
        setAllClasses(getClasses());
        setAllBills(getTermlyBills());
    }, []);

    const classMap = useMemo(() => new Map(allClasses.map(c => [c.id, c.name])), [allClasses]);

    const filteredProfiles = useMemo(() => {
        return allProfiles.filter(p => {
            const inClass = selectedClass === 'all' || p.admissionDetails.class_assigned === selectedClass;
            const matchesSearch = !searchTerm || `${p.student.first_name} ${p.student.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) || p.student.student_no.toLowerCase().includes(searchTerm.toLowerCase());
            return inClass && matchesSearch;
        });
    }, [allProfiles, selectedClass, searchTerm]);

    useEffect(() => {
        const allPayments: PaymentRecord[] = [];
        const allDebtors: DebtorRecord[] = [];

        filteredProfiles.forEach(profile => {
            profile.financialDetails?.payment_history.forEach(termPayment => {
                termPayment.payments.forEach(payment => {
                    const paymentDate = new Date(payment.date);
                    const inDateRange = !dateRange?.from || (paymentDate >= dateRange.from && (!dateRange.to || paymentDate <= dateRange.to));

                    if (inDateRange) {
                        allPayments.push({
                            studentId: profile.student.student_no,
                            studentName: `${profile.student.first_name} ${profile.student.last_name}`,
                            className: classMap.get(profile.admissionDetails.class_assigned) || 'N/A',
                            paymentDate: payment.date,
                            amount: payment.amount,
                            totalBilled: termPayment.total_fees,
                            method: payment.method,
                            billNumber: termPayment.bill_number,
                            receiptNumber: payment.receipt_number,
                        });
                    }
                });
            });

            if (profile.financialDetails && profile.financialDetails.account_balance < 0) {
                allDebtors.push({
                    studentId: profile.student.student_no,
                    studentName: `${profile.student.first_name} ${profile.student.last_name}`,
                    className: classMap.get(profile.admissionDetails.class_assigned) || 'N/A',
                    outstandingBalance: Math.abs(profile.financialDetails.account_balance),
                });
            }
        });

        setFilteredPaymentRecords(allPayments.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()));
        setDebtorsList(allDebtors.sort((a, b) => b.outstandingBalance - a.outstandingBalance));

    }, [dateRange, filteredProfiles, classMap]);
    
    const summary = useMemo(() => {
        const totalPaid = filteredPaymentRecords.reduce((acc, rec) => acc + rec.amount, 0);

        let totalExpected = 0;
        const processedTerms = new Set<string>();

        filteredProfiles.forEach(profile => {
            profile.financialDetails?.payment_history.forEach(termPayment => {
                const termKey = `${profile.student.student_no}-${termPayment.term}`;
                const paymentDate = termPayment.payment_date ? new Date(termPayment.payment_date) : new Date(termPayment.bill_number.split('-')[1]);
                
                const inDateRange = !dateRange?.from || (paymentDate >= dateRange.from && (!dateRange.to || paymentDate <= dateRange.to));

                if (inDateRange && !processedTerms.has(termKey)) {
                    totalExpected += termPayment.total_fees;
                    processedTerms.add(termKey);
                }
            });
        });
        
        const totalOutstanding = debtorsList.reduce((acc, debtor) => acc + debtor.outstandingBalance, 0);

        return {
            totalPaid,
            totalExpected,
            totalOutstanding
        }
    }, [filteredPaymentRecords, debtorsList, filteredProfiles, dateRange]);


    const handleClearFilters = () => {
        setDateRange(undefined);
        setSelectedClass('all');
        setSearchTerm('');
    };
    
    const handleExportPDF = (reportType: 'collection' | 'debtors') => {
        const doc = new jsPDF();
        
        if (reportType === 'collection') {
            doc.text("Fee Collection Report", 14, 15);
            (doc as any).autoTable({
                head: [['Date', 'Student Name', 'Class', 'Billed', 'Paid', 'Method']],
                body: filteredPaymentRecords.map(rec => [
                    format(new Date(rec.paymentDate), 'yyyy-MM-dd'),
                    rec.studentName,
                    rec.className,
                    formatCurrency(rec.totalBilled),
                    formatCurrency(rec.amount),
                    rec.method,
                ])
            });
            doc.save('fee_collection_report.pdf');
        } else {
             doc.text("Debtors Report", 14, 15);
            (doc as any).autoTable({
                head: [['Student Name', 'Class', 'Outstanding Balance']],
                body: debtorsList.map(rec => [
                    rec.studentName,
                    rec.className,
                    formatCurrency(rec.outstandingBalance),
                ])
            });
            doc.save('debtors_report.pdf');
        }
    };

    const handleExportCSV = (reportType: 'collection' | 'debtors') => {
        const dataToExport = reportType === 'collection' ? filteredPaymentRecords : debtorsList;
        const csv = Papa.unparse(dataToExport);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${reportType}_report.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Tabs defaultValue="fee-collection" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="fee-collection">Fee Collection Report</TabsTrigger>
                <TabsTrigger value="debtors">Debtors Report</TabsTrigger>
            </TabsList>
            <div className="pt-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap items-center gap-4">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn("w-[280px] justify-start text-left font-normal", !dateRange && "text-muted-foreground")}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateRange?.from ? (
                                        dateRange.to ? (
                                            `${format(dateRange.from, "LLL dd, y")} - ${format(dateRange.to, "LLL dd, y")}`
                                        ) : (
                                            format(dateRange.from, "LLL dd, y")
                                        )
                                    ) : (
                                        <span>Filter by date range</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={dateRange?.from}
                                    selected={dateRange}
                                    onSelect={setDateRange}
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>
                         <Select value={selectedClass} onValueChange={setSelectedClass}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Select Class" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Classes</SelectItem>
                                {allClasses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                         <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by student..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button variant="ghost" onClick={handleClearFilters}>
                            <X className="mr-2 h-4 w-4" /> Clear
                        </Button>
                    </CardContent>
                </Card>
            </div>
            <TabsContent value="fee-collection" className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4 pt-4">
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Fees Paid</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(summary.totalPaid)}</div>
                            <p className="text-xs text-muted-foreground">Within selected filters</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Fees Expected</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(summary.totalExpected)}</div>
                             <p className="text-xs text-muted-foreground">In selected date range</p>
                        </CardContent>
                    </Card>
                </div>
                 <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Detailed Payment Records</CardTitle>
                                <CardDescription>A list of all individual payments matching the current filters.</CardDescription>
                            </div>
                             <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleExportPDF('collection')}><Download className="mr-2" /> PDF</Button>
                                <Button variant="outline" size="sm" onClick={() => handleExportCSV('collection')}><Download className="mr-2" /> CSV</Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Payment Date</TableHead>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Class</TableHead>
                                        <TableHead>Amount Paid</TableHead>
                                        <TableHead>Total Billed (Term)</TableHead>
                                        <TableHead>Method</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredPaymentRecords.length > 0 ? (
                                        filteredPaymentRecords.map(rec => (
                                            <TableRow key={`${rec.studentId}-${rec.paymentDate}-${rec.amount}`}>
                                                <TableCell>{format(new Date(rec.paymentDate), 'PPP')}</TableCell>
                                                <TableCell>{rec.studentName}</TableCell>
                                                <TableCell>{rec.className}</TableCell>
                                                <TableCell className="font-medium text-green-600">{formatCurrency(rec.amount)}</TableCell>
                                                <TableCell>{formatCurrency(rec.totalBilled)}</TableCell>
                                                <TableCell>{rec.method}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center">
                                                No payment records found for the selected filters.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                 </Card>
            </TabsContent>
             <TabsContent value="debtors" className="space-y-4">
                 <div className="grid md:grid-cols-1 gap-4 pt-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-destructive">Total Outstanding Balance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-destructive">{formatCurrency(summary.totalOutstanding)}</div>
                            <p className="text-xs text-muted-foreground">Across all filtered students</p>
                        </CardContent>
                    </Card>
                </div>
                 <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Debtors List</CardTitle>
                                <CardDescription>Students with an outstanding balance.</CardDescription>
                            </div>
                             <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleExportPDF('debtors')}><Download className="mr-2" /> PDF</Button>
                                <Button variant="outline" size="sm" onClick={() => handleExportCSV('debtors')}><Download className="mr-2" /> CSV</Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student Name</TableHead>
                                        <TableHead>Class</TableHead>
                                        <TableHead className="text-right">Outstanding Balance</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {debtorsList.length > 0 ? (
                                        debtorsList.map(rec => (
                                            <TableRow key={rec.studentId}>
                                                <TableCell className="font-medium">{rec.studentName}</TableCell>
                                                <TableCell><Badge variant="outline">{rec.className}</Badge></TableCell>
                                                <TableCell className="text-right font-semibold text-destructive">{formatCurrency(rec.outstandingBalance)}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={3} className="h-24 text-center">
                                                No debtors found for the selected filters.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                 </Card>
            </TabsContent>
        </Tabs>
    );
}
