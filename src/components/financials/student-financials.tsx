
'use client';
import { useState, useEffect } from 'react';
import { getStudentProfileByUserId, getStudentProfiles } from '@/lib/store';
import { StudentProfile, TermPayment } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Landmark } from 'lucide-react';

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(amount);

export function StudentFinancials() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<StudentProfile | null>(null);

    useEffect(() => {
        if (user) {
            let studentProfile;
            if (user.role === 'Student') {
                 // The user is the student, find their profile by user ID
                const studentUser = getStudentProfiles().find(p => p.contactDetails.email === user.email);
                if (studentUser) {
                    studentProfile = studentUser;
                }
            } else if (user.role === 'Parent') {
                // The user is a parent, find a student linked to them (simple logic for now)
                studentProfile = getStudentProfiles().find(p => p.guardianInfo.guardian_email === user.email);
            }
             setProfile(studentProfile || null);
        }
    }, [user]);

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

