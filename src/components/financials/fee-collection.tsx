
'use client';
import { useState, useEffect } from 'react';
import { getStudentProfiles, recordPayment, addAuditLog } from '@/lib/store';
import { StudentProfile, TermPayment } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Wallet } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(amount);

export function FeeCollection() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<StudentProfile[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState<number | ''>('');
    const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Bank Transfer' | 'Mobile Money' | 'Card'>('Cash');
    const { user } = useAuth();
    const { toast } = useToast();

    useEffect(() => {
        if (searchQuery.length > 2) {
            const profiles = getStudentProfiles();
            const filtered = profiles.filter(p =>
                p.student.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.student.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.student.student_no.includes(searchQuery)
            );
            setSearchResults(filtered);
        } else {
            setSearchResults([]);
        }
    }, [searchQuery]);

    const handleSelectStudent = (student: StudentProfile) => {
        setSelectedStudent(student);
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleRecordPayment = () => {
        if (!selectedStudent || !user || !paymentAmount) {
            toast({ variant: 'destructive', title: 'Error', description: 'Missing required payment details.' });
            return;
        }

        const updatedProfile = recordPayment(selectedStudent.student.student_no, paymentAmount, paymentMethod, user.id);
        
        if (updatedProfile) {
            setSelectedStudent(updatedProfile);
            toast({ title: 'Payment Recorded', description: `Payment of ${formatCurrency(paymentAmount)} recorded for ${updatedProfile.student.first_name}.` });
            addAuditLog({
                user: user.email,
                name: user.name,
                action: 'Record Payment',
                details: `Recorded payment of ${formatCurrency(paymentAmount)} for student ${updatedProfile.student.student_no}`
            });
            setIsPaymentDialogOpen(false);
            setPaymentAmount('');
        } else {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to record payment.' });
        }
    };

    const latestTermPayment = selectedStudent?.financialDetails?.payment_history
        .sort((a, b) => new Date(b.payment_date || 0).getTime() - new Date(a.payment_date || 0).getTime())[0];

    return (
        <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
                <Card>
                    <CardHeader>
                        <CardTitle>Find Student</CardTitle>
                        <CardDescription>Search by name or student ID.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Start typing to search..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="mt-4 space-y-2">
                            {searchResults.map(student => (
                                <Button
                                    key={student.student.student_no}
                                    variant="ghost"
                                    className="w-full justify-start h-auto"
                                    onClick={() => handleSelectStudent(student)}
                                >
                                    <Avatar className="h-9 w-9 mr-3">
                                        <AvatarImage src={student.student.avatarUrl} />
                                        <AvatarFallback>{student.student.first_name[0]}{student.student.last_name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold text-left">{student.student.first_name} {student.student.last_name}</p>
                                        <p className="text-sm text-muted-foreground text-left">{student.student.student_no}</p>
                                    </div>
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="md:col-span-2">
                {selectedStudent ? (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                     <Avatar className="h-16 w-16">
                                        <AvatarImage src={selectedStudent.student.avatarUrl} />
                                        <AvatarFallback className="text-2xl">{selectedStudent.student.first_name[0]}{selectedStudent.student.last_name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle>{selectedStudent.student.first_name} {selectedStudent.student.last_name}</CardTitle>
                                        <CardDescription>{selectedStudent.student.student_no}</CardDescription>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-muted-foreground">Total Outstanding</p>
                                    <p className="text-2xl font-bold text-red-600">{formatCurrency(selectedStudent.financialDetails?.account_balance ? Math.abs(selectedStudent.financialDetails.account_balance) : 0)}</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                             <div className="border-t pt-4">
                                <h4 className="font-semibold mb-2">Current Term Bill ({latestTermPayment?.term})</h4>
                                <div className="space-y-1 text-sm">
                                    {latestTermPayment?.bill_items.map((item, index) => (
                                        <div key={index} className="flex justify-between">
                                            <p className="text-muted-foreground">{item.description}</p>
                                            <p>{formatCurrency(item.amount)}</p>
                                        </div>
                                    ))}
                                    <div className="flex justify-between font-bold border-t pt-2 mt-2">
                                        <p>Total Billed</p>
                                        <p>{formatCurrency(latestTermPayment?.total_fees || 0)}</p>
                                    </div>
                                     <div className="flex justify-between font-medium text-green-600">
                                        <p>Amount Paid</p>
                                        <p>{formatCurrency(latestTermPayment?.amount_paid || 0)}</p>
                                    </div>
                                </div>
                             </div>
                        </CardContent>
                        <CardFooter className="justify-end">
                            <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button><Wallet className="mr-2 h-4 w-4" /> Record Payment</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Record Payment for {selectedStudent.student.first_name}</DialogTitle>
                                        <DialogDescription>
                                            Enter the amount being paid. The current outstanding balance is <span className="font-bold">{formatCurrency(selectedStudent.financialDetails?.account_balance ? Math.abs(selectedStudent.financialDetails.account_balance) : 0)}</span>.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="amount">Amount (GHS)</Label>
                                            <Input id="amount" type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(Number(e.target.value))} placeholder="0.00" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="method">Payment Method</Label>
                                            <Select value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as any)}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Cash">Cash</SelectItem>
                                                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                                    <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                                                    <SelectItem value="Card">Card</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>Cancel</Button>
                                        <Button onClick={handleRecordPayment}>Confirm Payment</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </CardFooter>
                    </Card>
                ) : (
                    <div className="flex items-center justify-center h-full rounded-lg border-2 border-dashed border-muted-foreground/30 text-muted-foreground p-12">
                        <p>Select a student to view their financial details.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
