
'use client';
import { useState, useEffect } from 'react';
import { getBooks, getBorrowingRecords, saveBorrowingRecords, getStudentProfiles, getStaff, addAuditLog, saveBooks } from '@/lib/store';
import { Book, BorrowingRecord, StudentProfile, Staff } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, PlusCircle, BookUp, Undo2, Search, User, Book as BookIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { addDays, format, isPast } from 'date-fns';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';

const borrowingSchema = z.object({
  borrowerId: z.string().min(1, 'Please select a borrower.'),
  bookId: z.string().min(1, 'Please select a book.'),
  dueDate: z.date({ required_error: 'Due date is required.' }),
});

type BorrowingFormValues = z.infer<typeof borrowingSchema>;

function BorrowingForm({ books, borrowers, onSave }: { books: Book[], borrowers: {id: string, name: string}[], onSave: (data: BorrowingFormValues) => void }) {
  const form = useForm<BorrowingFormValues>({
    resolver: zodResolver(borrowingSchema),
    defaultValues: { dueDate: addDays(new Date(), 14) },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
        <FormField name="borrowerId" control={form.control} render={({ field }) => (
          <FormItem><FormLabel>Borrower</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a student or staff" /></SelectTrigger></FormControl><SelectContent>{borrowers.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
        )} />
        <FormField name="bookId" control={form.control} render={({ field }) => (
          <FormItem><FormLabel>Book</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a book" /></SelectTrigger></FormControl><SelectContent>{books.filter(b => b.quantity > 0).map(b => <SelectItem key={b.id} value={b.id}>{b.title} ({b.quantity} available)</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
        )} />
        <FormField name="dueDate" control={form.control} render={({ field }) => (
          <FormItem className="flex flex-col"><FormLabel>Due Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className={cn(!field.value && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, 'PPP') : 'Pick a date'}</Button></FormControl></PopoverTrigger><PopoverContent><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover><FormMessage /></FormItem>
        )} />
        <DialogFooter>
          <Button type="submit">Issue Book</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

export function BorrowingManagement() {
  const [borrowingRecords, setBorrowingRecords] = useState<BorrowingRecord[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [borrowers, setBorrowers] = useState<{id: string, name: string}[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchData = () => {
    setBorrowingRecords(getBorrowingRecords());
    setBooks(getBooks());
    const students = getStudentProfiles().map(s => ({ id: s.student.student_no, name: `${s.student.first_name} ${s.student.last_name}` }));
    const staff = getStaff().map(s => ({ id: s.staff_id, name: `${s.first_name} ${s.last_name} (Staff)` }));
    setBorrowers([...students, ...staff]);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleIssueBook = (data: BorrowingFormValues) => {
    if (!user) return;

    const book = books.find(b => b.id === data.bookId);
    if (!book || book.quantity < 1) {
      toast({ variant: 'destructive', title: 'Book not available' });
      return;
    }

    const newRecord: BorrowingRecord = {
      id: `brw_${Date.now()}`,
      borrower_id: data.borrowerId,
      borrower_name: borrowers.find(b => b.id === data.borrowerId)?.name || 'Unknown',
      book_id: data.bookId,
      book_title: book.title,
      borrow_date: new Date().toISOString(),
      due_date: data.dueDate.toISOString(),
      status: 'Borrowed',
    };

    const updatedRecords = [...borrowingRecords, newRecord];
    saveBorrowingRecords(updatedRecords);

    const updatedBooks = books.map(b => b.id === data.bookId ? { ...b, quantity: b.quantity - 1 } : b);
    saveBooks(updatedBooks);
    
    fetchData();
    setIsFormOpen(false);
    toast({ title: 'Book Issued' });
  };

  const handleReturnBook = (recordId: string) => {
    const record = borrowingRecords.find(r => r.id === recordId);
    if (!record) return;

    const updatedRecords = borrowingRecords.map(r => r.id === recordId ? { ...r, status: 'Returned', return_date: new Date().toISOString() } : r);
    saveBorrowingRecords(updatedRecords);

    const updatedBooks = books.map(b => b.id === record.book_id ? { ...b, quantity: b.quantity + 1 } : b);
    saveBooks(updatedBooks);
    
    fetchData();
    toast({ title: 'Book Returned' });
  };
  
  const filteredRecords = borrowingRecords.filter(record => 
    record.borrower_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    record.book_title.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a,b) => (a.status === 'Borrowed' ? -1 : 1));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Library Borrowing & Returns</CardTitle>
              <CardDescription>Manage book loans for students and staff.</CardDescription>
            </div>
             <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button size="sm"><PlusCircle className="mr-2" /> Issue New Book</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Issue a Book</DialogTitle></DialogHeader>
                <BorrowingForm books={books} borrowers={borrowers} onSave={handleIssueBook} />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
           <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by borrower name or book title..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader><TableRow><TableHead>Book Title</TableHead><TableHead>Borrower</TableHead><TableHead>Due Date</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {filteredRecords.map(rec => {
                    const isOverdue = rec.status === 'Borrowed' && isPast(new Date(rec.due_date));
                    return (
                        <TableRow key={rec.id}>
                            <TableCell><div className="flex items-center gap-2"><BookIcon className="h-4 w-4 text-muted-foreground"/>{rec.book_title}</div></TableCell>
                            <TableCell><div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground"/>{rec.borrower_name}</div></TableCell>
                            <TableCell>{format(new Date(rec.due_date), 'PPP')}</TableCell>
                            <TableCell>
                                <Badge variant={rec.status === 'Returned' ? 'secondary' : (isOverdue ? 'destructive' : 'default')}>
                                    {isOverdue ? 'Overdue' : rec.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                {rec.status === 'Borrowed' && (
                                    <Button variant="outline" size="sm" onClick={() => handleReturnBook(rec.id)}>
                                        <Undo2 className="mr-2 h-4 w-4"/> Mark as Returned
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
