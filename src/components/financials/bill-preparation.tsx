
'use client';
import { useState, useEffect } from 'react';
import { getFeeStructures, getClasses, getStudentProfiles, prepareBills, addAuditLog, getAcademicYears, getTermlyBills, saveTermlyBills, deleteTermlyBill, getClassSchoolLevel, updateTermlyBillStatus } from '@/lib/store';
import { FeeStructureItem, Class, StudentProfile, AcademicYear, Term, TermlyBill, SchoolLevel, ALL_SCHOOL_LEVELS } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PlusCircle, Trash2, ArrowRight, Loader2, Users, User, Check, ChevronsUpDown, MoreHorizontal, Pencil, Plus, CheckCircle, XCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { format } from 'date-fns';
import { Separator } from '../ui/separator';

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(amount);

function BillPreparationForm({ onSave, existingBill }: { onSave: (bill: Omit<TermlyBill, 'bill_number' | 'created_by' | 'created_at'>) => void, existingBill?: TermlyBill | null }) {
    const [step, setStep] = useState(1);
    const [feeStructures, setFeeStructures] = useState<FeeStructureItem[]>([]);
    const [billItems, setBillItems] = useState<(FeeStructureItem & { amount: number | '' })[]>(existingBill?.items.map(i => {
        const feeItem = getFeeStructures().find(fs => fs.name === i.description);
        return {
            id: feeItem?.id || i.description,
            name: i.description,
            amount: i.amount,
            levelAmounts: feeItem?.levelAmounts || {},
            isMiscellaneous: feeItem?.isMiscellaneous || !feeItem
        };
    }) || []);
    const [termName, setTermName] = useState(existingBill?.term || '');
    
    const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
    const [allTerms, setAllTerms] = useState<{ value: string; label: string }[]>([]);

    const [classes, setClasses] = useState<Class[]>([]);
    const [students, setStudents] = useState<StudentProfile[]>([]);
    const [selectedClasses, setSelectedClasses] = useState<string[]>(existingBill?.assigned_classes || []);
    const [selectedStudents, setSelectedStudents] = useState<string[]>(existingBill?.assigned_students || []);
    const [selectedLevel, setSelectedLevel] = useState<SchoolLevel | undefined>();

    const [miscItemName, setMiscItemName] = useState('');
    const [miscItemAmount, setMiscItemAmount] = useState<number | ''>('');


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

    useEffect(() => {
        if (selectedLevel) {
            const standardItems = feeStructures.filter(item => !item.isMiscellaneous);
            const miscItemsFromStructure = feeStructures.filter(item => item.isMiscellaneous);
            
            const itemsForLevel = standardItems.map(item => ({
                ...item,
                amount: item.levelAmounts[selectedLevel] || 0
            }));

            const miscItemsForLevel = miscItemsFromStructure.map(item => ({
                ...item,
                amount: item.levelAmounts[selectedLevel] || 0
            }));

            setBillItems([...itemsForLevel, ...miscItemsForLevel]);
        } else {
            // If no level is selected, clear the standard items
            setBillItems(billItems.filter(item => item.isMiscellaneous));
        }
    }, [selectedLevel, feeStructures]);

    const addBillItem = (item: FeeStructureItem) => {
        if (!billItems.some(bi => bi.id === item.id)) {
            const level = selectedLevel || 'JHS'; // Default to a level to get some amount
            const amount = item.levelAmounts[level] || 0;
            setBillItems([...billItems, { ...item, amount }]);
        }
    };
    
    const addMiscItem = () => {
        if (miscItemName.trim() && miscItemAmount !== '') {
            const miscId = `misc_${Date.now()}`;
            const miscItem: FeeStructureItem = { id: miscId, name: miscItemName, levelAmounts: {}, isMiscellaneous: true };
            setBillItems([...billItems, { ...miscItem, amount: Number(miscItemAmount) }]);
            setMiscItemName('');
            setMiscItemAmount('');
        }
    };

    const removeBillItem = (id: string) => {
        setBillItems(billItems.filter(item => item.id !== id));
    };

    const getStudentsToBill = () => {
        return [...new Set([...selectedStudents, ...students.filter(s => selectedClasses.includes(s.admissionDetails.class_assigned)).map(s => s.student.student_no)])];
    }
    const studentIdsToBill = getStudentsToBill();

    const calculateTotalBill = (studentId: string): number => {
        const studentProfile = students.find(s => s.student.student_no === studentId);
        if (!studentProfile) return 0;
        const classId = studentProfile.admissionDetails.class_assigned;
        const schoolLevel = getClassSchoolLevel(classId);
        
        return billItems.reduce((acc, item) => {
            let amount = 0;
            if (item.isMiscellaneous) {
                amount = Number(item.amount) || (schoolLevel ? item.levelAmounts[schoolLevel] || 0 : 0);
            } else if (schoolLevel) {
                 amount = item.amount || item.levelAmounts[schoolLevel] || 0;
            }
            return acc + amount;
        }, 0);
    }
    
    const getBillItemsForStudent = (studentId: string) => {
        const studentProfile = students.find(s => s.student.student_no === studentId);
        if (!studentProfile) return [];
        const classId = studentProfile.admissionDetails.class_assigned;
        const schoolLevel = getClassSchoolLevel(classId);
        if (!schoolLevel) return [];

        return billItems.map(item => ({
            description: item.name,
            amount: item.isMiscellaneous ? Number(item.amount) : (item.levelAmounts[schoolLevel] || 0)
        }));
    };

    // For display purposes, we can show an average or a range
    const averageBillAmount = studentIdsToBill.length > 0
        ? studentIdsToBill.reduce((acc, id) => acc + calculateTotalBill(id), 0) / studentIdsToBill.length
        : 0;

    const handlePrepareBill = () => {
        const billDataForStore = {
            term: termName,
            items: billItems.map(item => ({description: item.name, amount: item.amount || 0})),
            assigned_classes: selectedClasses,
            assigned_students: selectedStudents,
        };
        onSave(billDataForStore as any);
    }

    const standardItems = feeStructures.filter(item => !item.isMiscellaneous);
    const miscFeeItems = feeStructures.filter(item => item.isMiscellaneous);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <div className="p-4 border rounded-md">
                    <h3 className="font-semibold mb-2">Step {step} of 2: {step === 1 ? 'Define bill items and amounts.' : 'Assign bill to students.'}</h3>
                    <Separator />
                    <div className="max-h-[60vh] overflow-y-auto p-1">
                        {step === 1 && (
                            <div className="space-y-4 mt-4">
                                <div className="grid md:grid-cols-2 gap-4">
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
                                    <div>
                                        <Label htmlFor="school-level">Target School Level (Template)</Label>
                                        <Select value={selectedLevel} onValueChange={(val: SchoolLevel) => setSelectedLevel(val)}>
                                            <SelectTrigger id="school-level">
                                                <SelectValue placeholder="Select level to auto-fill amounts" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {ALL_SCHOOL_LEVELS.map(level => (
                                                    <SelectItem key={level} value={level}>{level}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Bill Items</Label>
                                    {billItems.map((item, index) => (
                                        <div key={item.id} className="flex items-center gap-2 p-2 border rounded-md bg-muted/30">
                                            <div className="flex-1 font-medium">{item.name}</div>
                                             <Input
                                                type="number"
                                                className="w-32"
                                                placeholder="Amount"
                                                value={item.amount}
                                                onChange={(e) => setBillItems(billItems.map(bi => bi.id === item.id ? { ...bi, amount: Number(e.target.value) } : bi))}
                                            />
                                            <Button variant="ghost" size="icon" onClick={() => removeBillItem(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-end items-center font-semibold text-lg">
                                    <Button onClick={() => setStep(2)} disabled={billItems.length === 0 || !termName.trim()}>
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
                                    <p className="text-sm text-muted-foreground">A total of <span className="font-bold">{studentIdsToBill.length}</span> student(s) will be billed. Average bill amount is <span className="font-bold">{formatCurrency(averageBillAmount)}</span>.</p>
                                </div>
                            <div className="flex justify-between">
                                    <Button variant="outline" onClick={() => setStep(1)}>Previous</Button>
                                    <Button onClick={handlePrepareBill}>Save Bill</Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {step === 1 && (
                 <div className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
                     <div className="p-4 border rounded-md">
                        <h3 className="font-semibold mb-2">Add One-Off Item</h3>
                        <div className="space-y-2">
                             <Input placeholder="Item Name" value={miscItemName} onChange={e => setMiscItemName(e.target.value)} />
                             <Input type="number" placeholder="Amount" value={miscItemAmount} onChange={e => setMiscItemAmount(e.target.value === '' ? '' : Number(e.target.value))} />
                             <Button onClick={addMiscItem} size="sm" className="w-full">
                                <Plus className="mr-2 h-4 w-4"/> Add One-Off Item
                            </Button>
                        </div>
                    </div>
                    <div className="p-4 border rounded-md">
                        <h3 className="font-semibold">Standard Fee Items</h3>
                        <div className="space-y-2 mt-2">
                            {standardItems.map(item => (
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
                        <h3 className="font-semibold mt-4">Miscellaneous Items</h3>
                         <div className="space-y-2 mt-2">
                            {miscFeeItems.map(item => (
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

    const handleSave = (billData: Omit<TermlyBill, 'bill_number' | 'created_by' | 'created_at' | 'billed_student_ids'> & { items: FeeStructureItem[] }) => {
        if (!user) return;
        setIsLoading(true);

        const allBills = getTermlyBills();
        let action: 'created' | 'updated' = 'created';
        
        let finalBill: TermlyBill;

        if (editingBill) {
            action = 'updated';
            const billToUpdate = { 
                ...editingBill, 
                ...billData, 
                items: billData.items.map(i => ({ description: i.name, amount: i.amount || 0 })) 
            };
            const newBills = allBills.map(b => b.bill_number === editingBill.bill_number ? billToUpdate : b);
            saveTermlyBills(newBills);
            finalBill = billToUpdate;
        } else {
            finalBill = {
                ...billData,
                bill_number: `BILL-${Date.now()}`,
                created_at: new Date().toISOString(),
                created_by: user.id,
                billed_student_ids: [], 
                status: 'Pending',
                items: billData.items.map(i => ({ description: i.name, amount: i.amount || 0 }))
            };
            const newBills = [...allBills, finalBill];
            saveTermlyBills(newBills);
        }

        setTimeout(() => {
            setIsLoading(false);
            fetchBills();
            setIsFormOpen(false);
            setEditingBill(null);
            toast({ title: `Bill ${action}`, description: `The bill for term "${billData.term}" has been saved with Pending status.` });
            addAuditLog({
                user: user.email, name: user.name, action: `Bill ${action}`,
                details: `${action} bill for term "${billData.term}".`
            });
        }, 500);
    }
    
    const handleDelete = (bill: TermlyBill) => {
        if (!user) return;
        if (bill.status === 'Approved' && user.role === 'Accountant') {
            toast({ variant: 'destructive', title: 'Permission Denied', description: 'Approved bills cannot be deleted by an accountant.'});
            return;
        }
        deleteTermlyBill(bill.bill_number, user.id);
        fetchBills();
        toast({ title: "Bill Deleted", description: "The termly bill and associated student records have been removed." });
    }

    const handleApprove = (bill: TermlyBill) => {
        if (!user) return;
        updateTermlyBillStatus(bill.bill_number, 'Approved', user.id);
        prepareBills(bill.assigned_classes, bill.assigned_students, bill.items, bill.term, user.id, bill.bill_number);
        fetchBills();
        toast({ title: 'Bill Approved', description: `Bill ${bill.bill_number} has been approved and applied to student accounts.` });
    };

    const handleReject = (bill: TermlyBill) => {
        if (!user) return;
        updateTermlyBillStatus(bill.bill_number, 'Rejected', user.id);
        fetchBills();
        toast({ title: 'Bill Rejected', description: `Bill ${bill.bill_number} has been rejected.` });
    };

    const isAdmin = user?.role === 'Admin' || user?.role === 'Headmaster';

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
                    if (!isOpen) setEditingBill(null);
                    setIsFormOpen(isOpen);
                }}>
                    <DialogTrigger asChild>
                        <Button size="sm">
                            <PlusCircle className="mr-2 h-4 w-4"/> Prepare New Bill
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-6xl">
                         <DialogHeader>
                            <DialogTitle>{editingBill ? 'Edit Bill' : 'Prepare New Bill'}</DialogTitle>
                        </DialogHeader>
                        <BillPreparationForm onSave={handleSave as any} existingBill={editingBill} />
                    </DialogContent>
                </Dialog>
            </div>
            
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Bill Number</TableHead>
                            <TableHead>Term</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Students Billed</TableHead>
                            <TableHead>Date Created</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {bills.map(bill => (
                            <TableRow key={bill.bill_number}>
                                <TableCell className="font-mono">{bill.bill_number}</TableCell>
                                <TableCell className="font-medium">{bill.term}</TableCell>
                                <TableCell>
                                    <Badge variant={bill.status === 'Approved' ? 'secondary' : bill.status === 'Pending' ? 'default' : 'destructive'}>
                                        {bill.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>{bill.billed_student_ids.length}</TableCell>
                                <TableCell>{format(new Date(bill.created_at), 'PPP')}</TableCell>
                                <TableCell className="text-right space-x-1">
                                    {bill.status === 'Pending' && isAdmin && (
                                        <>
                                            <Button variant="ghost" size="icon" onClick={() => handleApprove(bill)}>
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleReject(bill)}>
                                                <XCircle className="h-4 w-4 text-red-600" />
                                            </Button>
                                        </>
                                    )}
                                    <Button variant="ghost" size="icon" onClick={() => { setEditingBill(bill); setIsFormOpen(true); }} disabled={bill.status === 'Approved' && !isAdmin}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" disabled={bill.status === 'Approved' && !isAdmin}><Trash2 className="h-4 w-4" /></Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>This will delete the bill for {bill.term}. {bill.status === 'Approved' && 'This will also reverse all associated charges for students.'} This action is irreversible.</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(bill)}>Delete</AlertDialogAction>
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
