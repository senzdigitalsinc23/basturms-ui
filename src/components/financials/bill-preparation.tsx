'use client';
import { useState, useEffect } from 'react';
import { getFeeStructures, getClasses, getStudentProfiles, prepareBills, addAuditLog, getAcademicYears, getTermlyBills, saveTermlyBills, deleteTermlyBill } from '@/lib/store';
import { FeeStructureItem, Class, StudentProfile, AcademicYear, Term, TermlyBill } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PlusCircle, Trash2, ArrowRight, Loader2, Users, User, Check, ChevronsUpDown, MoreHorizontal, Pencil } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { format } from 'date-fns';

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(amount);

function BillPreparationForm({ onSave, existingBill }: { onSave: (bill: Omit<TermlyBill, 'id' | 'created_by' | 'created_at'>) => void, existingBill?: TermlyBill | null }) {
    const [step, setStep] = useState(1);
    const [feeStructures, setFeeStructures] = useState<FeeStructureItem[]>([]);
    const [billItems, setBillItems] = useState<(FeeStructureItem & { amount: number | '' })[]>(existingBill?.items.map(i => ({...i, id: i.description, name: i.description, amount: i.amount })) || []);
    const [termName, setTermName] = useState(existingBill?.term || '');
    
    const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
    const [allTerms, setAllTerms] = useState<{ value: string; label: string }[]>([]);

    const [classes, setClasses] = useState<Class[]>([]);
    const [students, setStudents] = useState<StudentProfile[]>([]);
    const [selectedClasses, setSelectedClasses] = useState<string[]>(existingBill?.assigned_classes || []);
    const [selectedStudents, setSelectedStudents] = useState<string[]>(existingBill?.assigned_students || []);

    useEffect(() => {
        setFeeStructures(getFeeStructures());
        setClasses(getClasses());
        setStudents(getStudentProfiles());
        const years = getAcademicYears();
        setAcademicYears(years);
        
        const terms = years.flatMap(year => 
            year.terms.map(term => ({
                value: `${term.name} ${year.year}`,
                label: `${term.name} (${year.year})`
            }))
        );
        setAllTerms(terms);
    }, []);

    const addBillItem = (item: FeeStructureItem) => {
        if (!billItems.some(bi => bi.id === item.id)) {
            setBillItems([...billItems, { ...item, amount: '' }]);
        }
    };

    const removeBillItem = (id: string) => {
        setBillItems(billItems.filter(item => item.id !== id));
    };

    const updateBillItemAmount = (id: string, amount: number | '') => {
        setBillItems(billItems.map(item => item.id === id ? { ...item, amount } : item));
    };

    const totalBillAmount = billItems.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
    const studentIdsToBill = [...new Set([...selectedStudents, ...students.filter(s => selectedClasses.includes(s.admissionDetails.class_assigned)).map(s => s.student.student_no)])];

    const handlePrepareBill = () => {
        const finalBillItems = billItems.map(({ id, name, amount }) => ({ description: name, amount: Number(amount) }));
        
        onSave({
            term: termName,
            total_amount: totalBillAmount,
            items: finalBillItems,
            assigned_classes: selectedClasses,
            assigned_students: selectedStudents,
            billed_student_ids: studentIdsToBill,
        });
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <div className="p-4 border rounded-md">
                    <h3 className="font-semibold mb-2">Step {step} of 2: {step === 1 ? 'Define bill items and amounts.' : 'Assign bill to students.'}</h3>
                    <Separator />
                    {step === 1 && (
                        <div className="space-y-4 mt-4">
                            <div>
                                <Label htmlFor="term-name">Term Name *</Label>
                                <Select value={termName} onValueChange={setTermName}>
                                    <SelectTrigger id="term-name">
                                        <SelectValue placeholder="Select a term..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {allTerms.map(term => (
                                            <SelectItem key={term.value} value={term.value}>{term.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                {billItems.map(item => (
                                    <div key={item.id} className="flex items-center gap-2 p-2 border rounded-md">
                                        <div className="flex-1 font-medium">{item.name}</div>
                                        <Input
                                            type="number"
                                            className="w-32"
                                            placeholder="Amount"
                                            value={item.amount}
                                            onChange={(e) => updateBillItemAmount(item.id, e.target.value === '' ? '' : Number(e.target.value))}
                                        />
                                        <Button variant="ghost" size="icon" onClick={() => removeBillItem(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between items-center font-semibold text-lg">
                                <div>Total: {formatCurrency(totalBillAmount)}</div>
                                <Button onClick={() => setStep(2)} disabled={billItems.length === 0 || !termName.trim() || billItems.some(i => i.amount === '')}>
                                    Next: Assign Students <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                     {step === 2 && (
                        <div className="space-y-4 mt-4">
                           <Accordion type="single" collapsible defaultValue="classes">
                                <AccordionItem value="classes">
                                    <AccordionTrigger><div className="flex items-center gap-2"><Users className="h-5 w-5 text-primary"/> Assign by Class</div></AccordionTrigger>
                                    <AccordionContent>
                                        <MultiSelectPopover title="Classes" options={classes} selectedValues={selectedClasses} onSelect={setSelectedClasses} />
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="students">
                                    <AccordionTrigger><div className="flex items-center gap-2"><User className="h-5 w-5 text-primary"/> Assign by Student</div></AccordionTrigger>
                                    <AccordionContent>
                                        <MultiSelectPopover title="Students" options={students.map(s => ({id: s.student.student_no, name: `${s.student.first_name} ${s.student.last_name}`}))} selectedValues={selectedStudents} onSelect={setSelectedStudents} />
                                    </AccordionContent>
                                </AccordionItem>
                           </Accordion>
                            <div className="pt-4">
                                <h3 className="font-semibold">Summary</h3>
                                <p className="text-sm text-muted-foreground">A total of <span className="font-bold">{studentIdsToBill.length}</span> student(s) will be billed.</p>
                            </div>
                           <div className="flex justify-between">
                                <Button variant="outline" onClick={() => setStep(1)}>Previous</Button>
                                <Button onClick={handlePrepareBill}>Save Bill</Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {step === 1 && (
                <div className="space-y-2 p-4 border rounded-md">
                    <h3 className="font-semibold">Available Fee Items</h3>
                    <p className="text-sm text-muted-foreground">Click to add items to the current bill.</p>
                    <div className="space-y-2">
                        {feeStructures.map(item => (
                            <Button
                                key={item.id}
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => addBillItem(item)}
                                disabled={billItems.some(bi => bi.id === item.id)}
                            >
                                <PlusCircle className="mr-2 h-4 w-4" /> {item.name}
                            </Button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export function TermlyBillManagement() {
    const [bills, setBills] = useState<TermlyBill[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingBill, setEditingBill] = useState<TermlyBill | null>(null);

    const { user } = useAuth();
    const { toast } = useToast();

    const fetchBills = () => {
        setBills(getTermlyBills());
    }

    useEffect(() => {
        fetchBills();
    }, []);

    const handleSave = (billData: Omit<TermlyBill, 'id' | 'created_by' | 'created_at'>) => {
        if (!user) return;
        setIsLoading(true);

        const allBills = getTermlyBills();
        let newBills: TermlyBill[];
        let action: 'created' | 'updated' = 'created';
        
        if (editingBill) { // Update existing
            action = 'updated';
            newBills = allBills.map(b => b.id === editingBill.id ? { ...editingBill, ...billData } : b);
        } else { // Create new
            const newBill: TermlyBill = {
                ...billData,
                id: `BILL-${Date.now()}`,
                created_at: new Date().toISOString(),
                created_by: user.id
            }
            newBills = [...allBills, newBill];
        }

        saveTermlyBills(newBills);
        prepareBills(billData.billed_student_ids, { term: billData.term, items: billData.items }, user.id);
        
        setTimeout(() => {
            setIsLoading(false);
            fetchBills();
            setIsFormOpen(false);
            setEditingBill(null);
            toast({ title: 'Bill Saved', description: `The bill for term "${billData.term}" has been ${action}.` });
            addAuditLog({
                user: user.email, name: user.name, action: `Bill ${action}`,
                details: `${action} bill for term "${billData.term}" for ${billData.billed_student_ids.length} students.`
            });
        }, 1000);
    }
    
    const handleDelete = (billId: string) => {
        if (!user) return;
        deleteTermlyBill(billId, user.id);
        fetchBills();
        toast({ title: "Bill Deleted", description: "The termly bill and associated student records have been removed." });
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" onClick={() => setEditingBill(null)}>
                            <PlusCircle className="mr-2 h-4 w-4"/> Prepare New Bill
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-6xl">
                         <DialogHeader>
                            <DialogTitle>{editingBill ? 'Edit Bill' : 'Prepare New Bill'}</DialogTitle>
                        </DialogHeader>
                        <BillPreparationForm onSave={handleSave} existingBill={editingBill} />
                    </DialogContent>
                </Dialog>
            </div>
            
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Term</TableHead>
                            <TableHead>Total Amount</TableHead>
                            <TableHead>Students Billed</TableHead>
                            <TableHead>Date Created</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {bills.map(bill => (
                            <TableRow key={bill.id}>
                                <TableCell className="font-medium">{bill.term}</TableCell>
                                <TableCell>{formatCurrency(bill.total_amount)}</TableCell>
                                <TableCell>{bill.billed_student_ids.length}</TableCell>
                                <TableCell>{format(new Date(bill.created_at), 'PPP')}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => { setEditingBill(bill); setIsFormOpen(true); }}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>This will delete the bill for {bill.term} and remove the associated charges from all {bill.billed_student_ids.length} students. This action is irreversible.</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(bill.id)}>Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

function MultiSelectPopover({ title, options, selectedValues, onSelect }: { 
    title: string;
    options: { id: string; name: string }[];
    selectedValues: string[];
    onSelect: (values: string[]) => void;
}) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                variant="outline"
                role="combobox"
                className="w-full justify-between h-auto"
                >
                <div className="flex gap-1 flex-wrap">
                    {selectedValues.length > 0 ? (
                        selectedValues.map(value => {
                            const option = options.find(o => o.id === value);
                            return <Badge variant="secondary" key={value}>{option?.name || value}</Badge>;
                        })
                    ) : `Select ${title}...`}
                </div>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                    <CommandInput placeholder={`Search ${title}...`} />
                    <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup>
                        {options.map(option => {
                            const isSelected = selectedValues.includes(option.id);
                            return (
                                <CommandItem
                                    key={option.id}
                                    onSelect={() => {
                                        const newSelection = isSelected
                                            ? selectedValues.filter(v => v !== option.id)
                                            : [...selectedValues, option.id];
                                        onSelect(newSelection);
                                    }}
                                >
                                    <Check className={cn("mr-2 h-4 w-4", isSelected ? "opacity-100" : "opacity-0")} />
                                    {option.name}
                                </CommandItem>
                            );
                        })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
