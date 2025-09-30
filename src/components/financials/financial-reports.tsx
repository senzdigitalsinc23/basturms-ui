
'use client';
import { useState, useEffect, useMemo } from 'react';
import { getStudentProfiles, getClasses } from '@/lib/store';
import { StudentProfile, Class, TermPayment } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Download, Search, X } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Papa from 'papaparse';

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(amount);

type PaymentRecord = {
    studentId: string;
    studentName: string;
    className: string;
    paymentDate: string;
    amount: number;
    method: string;
    billNumber: string;
    receiptNumber?: string;
}

export function FinancialReports() {
    const [allProfiles, setAllProfiles] = useState<StudentProfile[]>([]);
    const [allClasses, setAllClasses] = useState<Class[]>([]);
    const [filteredRecords, setFilteredRecords] = useState<PaymentRecord[]>([]);
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [selectedClass, setSelectedClass] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        setAllProfiles(getStudentProfiles());
        setAllClasses(getClasses());
    }, []);

    const classMap = useMemo(() => new Map(allClasses.map(c => [c.id, c.name])), [allClasses]);

    useEffect(() => {
        const allPayments: PaymentRecord[] = [];
        allProfiles.forEach(profile => {
            profile.financialDetails?.payment_history.forEach(termPayment => {
                termPayment.payments.forEach(payment => {
                    allPayments.push({
                        studentId: profile.student.student_no,
                        studentName: `${profile.student.first_name} ${profile.student.last_name}`,
                        className: classMap.get(profile.admissionDetails.class_assigned) || 'N/A',
                        paymentDate: payment.date,
                        amount: payment.amount,
                        method: payment.method,
                        billNumber: termPayment.bill_number,
                        receiptNumber: payment.receipt_number,
                    });
                });
            });
        });

        const filtered = allPayments.filter(record => {
            const paymentDate = new Date(record.paymentDate);
            const inDateRange = !dateRange?.from || (paymentDate >= dateRange.from && (!dateRange.to || paymentDate <= dateRange.to));
            const inClass = selectedClass === 'all' || allProfiles.find(p => p.student.student_no === record.studentId)?.admissionDetails.class_assigned === selectedClass;
            const matchesSearch = !searchTerm || record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || record.studentId.toLowerCase().includes(searchTerm.toLowerCase());
            return inDateRange && inClass && matchesSearch;
        });

        setFilteredRecords(filtered.sort((a,b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()));

    }, [dateRange, selectedClass, searchTerm, allProfiles, classMap]);
    
    const summary = useMemo(() => {
        let totalPaid = 0;
        let totalExpected = 0; // This is a simplification. A real implementation would be more complex.
        
        filteredRecords.forEach(rec => {
            totalPaid += rec.amount;
        });

        // Simple estimation of expected fees
        const relevantStudentIds = new Set(filteredRecords.map(r => r.studentId));
        relevantStudentIds.forEach(studentId => {
            const profile = allProfiles.find(p => p.student.student_no === studentId);
            profile?.financialDetails?.payment_history.forEach(term => {
                totalExpected += term.total_fees;
            })
        });


        return {
            totalPaid,
            totalExpected,
            outstanding: Math.max(0, totalExpected - totalPaid)
        }
    }, [filteredRecords, allProfiles]);

    const handleClearFilters = () => {
        setDateRange(undefined);
        setSelectedClass('all');
        setSearchTerm('');
    };
    
    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.text("Fee Collection Report", 14, 15);
        
        (doc as any).autoTable({
            head: [['Date', 'Student Name', 'Class', 'Amount', 'Method', 'Bill No.']],
            body: filteredRecords.map(rec => [
                format(new Date(rec.paymentDate), 'yyyy-MM-dd'),
                rec.studentName,
                rec.className,
                formatCurrency(rec.amount),
                rec.method,
                rec.billNumber
            ])
        });

        doc.save('fee_collection_report.pdf');
    };

    const handleExportCSV = () => {
        const csv = Papa.unparse(filteredRecords);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'fee_collection_report.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Tabs defaultValue="fee-collection" className="w-full">
            <TabsList>
                <TabsTrigger value="fee-collection">Fee Collection Report</TabsTrigger>
                <TabsTrigger value="outstanding-balance" disabled>Outstanding Balance</TabsTrigger>
            </TabsList>
            <TabsContent value="fee-collection" className="space-y-4">
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
                                        <span>Pick a date range</span>
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
                        <div className="flex-grow" />
                        <div className="flex gap-2">
                             <Button variant="outline" size="sm" onClick={handleExportPDF}><Download className="mr-2" /> PDF</Button>
                             <Button variant="outline" size="sm" onClick={handleExportCSV}><Download className="mr-2" /> CSV</Button>
                        </div>
                    </CardContent>
                </Card>
                <div className="grid md:grid-cols-3 gap-4">
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
                            <CardTitle className="text-sm font-medium">Total Expected Fees</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(summary.totalExpected)}</div>
                             <p className="text-xs text-muted-foreground">(Estimated for filtered students)</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-destructive">Total Outstanding</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-destructive">{formatCurrency(summary.outstanding)}</div>
                            <p className="text-xs text-muted-foreground">(Estimated for filtered students)</p>
                        </CardContent>
                    </Card>
                </div>
                 <Card>
                    <CardHeader>
                        <CardTitle>Detailed Payment Records</CardTitle>
                        <CardDescription>A list of all individual payments matching the current filters.</CardDescription>
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
                                        <TableHead>Method</TableHead>
                                        <TableHead>Bill Number</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredRecords.length > 0 ? (
                                        filteredRecords.map(rec => (
                                            <TableRow key={`${rec.studentId}-${rec.paymentDate}`}>
                                                <TableCell>{format(new Date(rec.paymentDate), 'PPP')}</TableCell>
                                                <TableCell>{rec.studentName}</TableCell>
                                                <TableCell>{rec.className}</TableCell>
                                                <TableCell className="font-medium">{formatCurrency(rec.amount)}</TableCell>
                                                <TableCell>{rec.method}</TableCell>
                                                <TableCell className="font-mono">{rec.billNumber}</TableCell>
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
        </Tabs>
    );
}

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
