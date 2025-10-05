'use client';
import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getExpenses, saveExpenses, addAuditLog, getUsers } from '@/lib/store';
import { Expense, User } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, PlusCircle, Trash2, Edit, X } from 'lucide-react';
import { format, isWithinInterval } from 'date-fns';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DateRange } from 'react-day-picker';
import { Badge } from '../ui/badge';

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(amount);

const expenseSchema = z.object({
  id: z.string().optional(),
  date: z.date({ required_error: 'Date is required.' }),
  description: z.string().min(1, 'Description is required.'),
  category: z.enum(['Salaries', 'Utilities', 'Maintenance', 'Supplies', 'Procurement', 'Miscellaneous']),
  amount: z.coerce.number().min(0.01, 'Amount must be greater than 0.'),
  vendor: z.string().optional(),
  paymentMethod: z.enum(['Cash', 'Bank Transfer', 'Mobile Money', 'Cheque']),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

function ExpenseForm({ onSave, existingExpense }: { onSave: (data: Expense) => void; existingExpense?: Expense | null }) {
  const { user } = useAuth();
  
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: existingExpense
      ? { ...existingExpense, date: new Date(existingExpense.date) }
      : { date: new Date(), category: 'Miscellaneous', paymentMethod: 'Cash', amount: 0 },
  });

  const handleSubmit = (values: ExpenseFormValues) => {
    const expenseData: Expense = {
      ...values,
      id: existingExpense?.id || `exp_${Date.now()}`,
      date: values.date.toISOString(),
      recorded_by: user!.id,
    };
    onSave(expenseData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField name="date" control={form.control} render={({ field }) => (
          <FormItem><FormLabel>Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className="w-full justify-start text-left"><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, 'PPP') : 'Pick a date'}</Button></FormControl></PopoverTrigger><PopoverContent><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover><FormMessage /></FormItem>
        )} />
        <FormField name="description" control={form.control} render={({ field }) => (
          <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <div className="grid grid-cols-2 gap-4">
          <FormField name="category" control={form.control} render={({ field }) => (
            <FormItem><FormLabel>Category</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent>{['Salaries', 'Utilities', 'Maintenance', 'Supplies', 'Procurement', 'Miscellaneous'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
          )} />
          <FormField name="amount" control={form.control} render={({ field }) => (
            <FormItem><FormLabel>Amount</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField name="vendor" control={form.control} render={({ field }) => (
            <FormItem><FormLabel>Vendor/Payee</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField name="paymentMethod" control={form.control} render={({ field }) => (
            <FormItem><FormLabel>Payment Method</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent>{['Cash', 'Bank Transfer', 'Mobile Money', 'Cheque'].map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
          )} />
        </div>
        <DialogFooter>
          <Button type="submit">Save Expense</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

export function ExpenseManagement() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [categoryFilter, setCategoryFilter] = useState('all');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    setExpenses(getExpenses());
    setUsers(getUsers());
  }, []);

  useEffect(() => {
    let filtered = expenses;
    if (dateRange?.from) {
      filtered = filtered.filter(exp => isWithinInterval(new Date(exp.date), { start: dateRange.from!, end: dateRange.to || dateRange.from! }));
    }
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(exp => exp.category === categoryFilter);
    }
    setFilteredExpenses(filtered.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, [expenses, dateRange, categoryFilter]);

  const totalExpenses = filteredExpenses.reduce((acc, exp) => acc + exp.amount, 0);

  const handleSaveExpense = (data: Expense) => {
    const allExpenses = getExpenses();
    let updatedExpenses;
    let action: 'created' | 'updated' = 'created';

    if (editingExpense) {
      action = 'updated';
      updatedExpenses = allExpenses.map(exp => exp.id === editingExpense.id ? data : exp);
    } else {
      updatedExpenses = [...allExpenses, data];
    }
    
    saveExpenses(updatedExpenses);
    setExpenses(updatedExpenses);
    addAuditLog({ user: user!.email, name: user!.name, action: `Expense ${action}`, details: `${data.description}: ${formatCurrency(data.amount)}` });
    toast({ title: 'Expense Saved', description: `Expense record has been ${action}.` });
    
    setIsFormOpen(false);
    setEditingExpense(null);
  };
  
  const handleDeleteExpense = (id: string) => {
    const allExpenses = getExpenses();
    const updatedExpenses = allExpenses.filter(exp => exp.id !== id);
    saveExpenses(updatedExpenses);
    setExpenses(updatedExpenses);
    toast({ title: 'Expense Deleted' });
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Expense Records</CardTitle>
                <CardDescription>A log of all recorded operational expenses.</CardDescription>
            </div>
            <Button onClick={() => { setEditingExpense(null); setIsFormOpen(true); }} size="sm">
                <PlusCircle className="mr-2"/> Add Expense
            </Button>
        </CardHeader>
        <CardContent>
            <div className="flex items-center gap-4 mb-4">
                <Popover>
                    <PopoverTrigger asChild><Button variant="outline" className="w-[280px] justify-start"><CalendarIcon className="mr-2 h-4 w-4" />{dateRange?.from ? dateRange.to ? `${format(dateRange.from, "LLL dd, y")} - ${format(dateRange.to, "LLL dd, y")}`: format(dateRange.from, "LLL dd, y"): "Pick a date range"}</Button></PopoverTrigger>
                    <PopoverContent><Calendar mode="range" selected={dateRange} onSelect={setDateRange} /></PopoverContent>
                </Popover>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[200px]"><SelectValue/></SelectTrigger>
                    <SelectContent><SelectItem value="all">All Categories</SelectItem>{['Salaries', 'Utilities', 'Maintenance', 'Supplies', 'Procurement', 'Miscellaneous'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
            </div>
            <div className="mb-4 p-4 bg-muted rounded-lg font-bold text-lg">
                Total Expenses (Filtered): {formatCurrency(totalExpenses)}
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Description</TableHead><TableHead>Category</TableHead><TableHead>Amount</TableHead><TableHead>Recorded By</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {filteredExpenses.map(exp => (
                            <TableRow key={exp.id}>
                                <TableCell>{format(new Date(exp.date), 'PPP')}</TableCell>
                                <TableCell>{exp.description}</TableCell>
                                <TableCell><Badge variant="secondary">{exp.category}</Badge></TableCell>
                                <TableCell>{formatCurrency(exp.amount)}</TableCell>
                                <TableCell>{users.find(u => u.id === exp.recorded_by)?.name || 'N/A'}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => { setEditingExpense(exp); setIsFormOpen(true); }}><Edit className="h-4 w-4"/></Button>
                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteExpense(exp.id)}><Trash2 className="h-4 w-4"/></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{editingExpense ? 'Edit' : 'Add'} Expense</DialogTitle>
            </DialogHeader>
            <ExpenseForm onSave={handleSaveExpense} existingExpense={editingExpense}/>
        </DialogContent>
      </Dialog>
    </div>
  );
}
