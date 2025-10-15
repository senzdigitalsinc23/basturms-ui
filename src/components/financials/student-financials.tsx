
'use client';
import { useState, useEffect } from 'react';
import { getStudentProfileByUserId, getStudentProfiles, getSchoolProfile } from '@/lib/store';
import { StudentProfile, TermPayment, FeeItem } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Landmark, Printer } from 'lucide-react';
import { Button } from '../ui/button';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(amount);

export const generateInvoicePdf = (student: StudentProfile, termPayment: TermPayment) => {
    const doc = new jsPDF();
    const schoolProfile = getSchoolProfile();
    const schoolName = schoolProfile?.schoolName || "CampusConnect School";
    
    doc.setFontSize(18);
    doc.text(schoolName, doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
    doc.setFontSize(14);
    doc.text("Student Bill", doc.internal.pageSize.getWidth() / 2, 30, { align: 'center' });

    doc.setFontSize(10);
    doc.text(`Student: ${student.student.first_name} ${student.student.last_name}`, 14, 45);
    doc.text(`Term: ${termPayment.term}`, 14, 50);
    doc.text(`Bill No: ${termPayment.bill_number}`, 14, 55);
    doc.text(`Date: ${format(new Date(), 'PPP')}`, doc.internal.pageSize.getWidth() - 14, 45, { align: 'right' });

    (doc as any).autoTable({
        startY: 65,
        head: [['Item Description', 'Amount']],
        body: termPayment.bill_items.map(item => [item.description, formatCurrency(item.amount)]),
        foot: [['Total Due', formatCurrency(termPayment.total_fees)]],
        footStyles: { fontStyle: 'bold' }
    });

    return doc;
};


export function StudentFinancials() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<StudentProfile | null>(null);

    useEffect(() => {
        async function fetchProfile() {
            if (user) {
                let studentProfile;
                const studentProfiles = await getStudentProfiles();
                if (user.role === 'Student') {
                    const studentUser = studentProfiles.find(p => p.contactDetails.email === user.email);
                    if (studentUser) {
                        studentProfile = studentUser;
                    }
                } else if (user.role === 'Parent') {
                    studentProfile = studentProfiles.find(p => p.guardianInfo.guardian_email === user.email);
                } else if (user.role === 'Admin') {
                    // For demo purposes, admin can see the first student's profile.
                    // A real app would have a search/selection mechanism.
                    studentProfile = studentProfiles[0];
                }
                 setProfile(studentProfile || null);
            }
        }
        fetchProfile();
    }, [user]);

    const handlePrintInvoice = (termPayment: TermPayment) => {
        if (!profile) return;
        const pdf = generateInvoicePdf(profile, termPayment);
        pdf.save(`Invoice_${profile.student.last_name}_${termPayment.term.replace(/\s/g, '_')}.pdf`);
    }

    if (!profile) {
        return (
            <Card>
                <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">Could not find financial records linked to your account.</p>
                </CardContent>
            </Card>
        );
    }
    
    const { financialDetails, student } = profile;

    return (
        <Card>
            <CardHeader>
                 <div className="flex items-center gap-4">
                    <Landmark className="h-8 w-8 text-primary"/>
                    <div>
                        <CardTitle>Financial History for {student.first_name} {student.last_name}</CardTitle>
                        <CardDescription>A detailed record of all school bills and payments.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {financialDetails ? (
                    <div className="space-y-6">
                        <Card className="bg-muted/50">
                            <CardContent className="p-4 flex items-center justify-between">
                                <p className="font-medium text-lg">Total Account Balance</p>
                                <p className={`text-2xl font-bold ${financialDetails.account_balance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    {formatCurrency(Math.abs(financialDetails.account_balance))}
                                    <span className="text-sm font-normal ml-2">{financialDetails.account_balance < 0 ? 'Debit (You Owe)' : 'Credit'}</span>
                                </p>
                            </CardContent>
                        </Card>

                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Term</TableHead>
                                        <TableHead>Total Billed</TableHead>
                                        <TableHead>Amount Paid</TableHead>
                                        <TableHead>Outstanding</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {financialDetails.payment_history.map((rec, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="font-medium">{rec.term}</TableCell>
                                            <TableCell>{formatCurrency(rec.total_fees)}</TableCell>
                                            <TableCell className="text-green-600">{formatCurrency(rec.amount_paid)}</TableCell>
                                            <TableCell className="text-red-600">{formatCurrency(rec.outstanding)}</TableCell>
                                            <TableCell>
                                                <Badge variant={rec.status === 'Paid' ? 'secondary' : (rec.status === 'Partially Paid' ? 'default' : 'destructive')}>
                                                    {rec.status}
                                                </Badge>
                                            </TableCell>
                                             <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => handlePrintInvoice(rec)}>
                                                    <Printer className="h-4 w-4"/>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                ) : (
                    <p className="text-muted-foreground text-center py-8">No financial records found.</p>
                )}
            </CardContent>
        </Card>
    );
}
