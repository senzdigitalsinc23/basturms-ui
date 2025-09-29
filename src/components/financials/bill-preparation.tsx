

'use client';
import { useState, useEffect } from 'react';
import { getFeeStructures, getClasses, getStudentProfiles, prepareBills, addAuditLog, getAcademicYears } from '@/lib/store';
import { FeeStructureItem, Class, StudentProfile, AcademicYear, Term } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PlusCircle, Trash2, X, ChevronsUpDown, Check, Users, User, ArrowRight, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

type BillItem = {
    id: string;
    name: string;
    amount: number | '';
};

export function BillPreparation() {
    const [step, setStep] = useState(1);
    const [feeStructures, setFeeStructures] = useState<FeeStructureItem[]>([]);
    const [billItems, setBillItems] = useState<BillItem[]>([]);
    const [termName, setTermName] = useState('');
    
    const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
    const [allTerms, setAllTerms] = useState<{ value: string; label: string }[]>([]);

    const [classes, setClasses] = useState<Class[]>([]);
    const [students, setStudents] = useState<StudentProfile[]>([]);
    const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const { user } = useAuth();
    const { toast } = useToast();

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

    const handlePrepareBills = () => {
        if (!user || studentIdsToBill.length === 0 || !termName.trim() || billItems.some(item => item.amount === '')) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please fill all required fields: Term Name, at least one student/class, and amounts for all bill items.' });
            return;
        }
        setIsLoading(true);

        const finalBillItems = billItems.map(({ id, name, amount }) => ({ description: name, amount: Number(amount) }));
        const billDetails = { term: termName, items: finalBillItems };

        prepareBills(studentIdsToBill, billDetails, user.id);
        
        setTimeout(() => {
            setIsLoading(false);
            toast({ title: 'Bills Prepared', description: `Bills have been successfully prepared for ${studentIdsToBill.length} students.` });
            addAuditLog({
                user: user.email,
                name: user.name,
                action: 'Prepare Bills',
                details: `Prepared bill for term "${termName}" for ${studentIdsToBill.length} students.`
            });
            // Reset form
            setStep(1);
            setBillItems([]);
            setTermName('');
            setSelectedClasses([]);
            setSelectedStudents([]);
        }, 1000);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Prepare New Bill</CardTitle>
                        <CardDescription>Step {step} of 2: {step === 1 ? 'Define bill items and amounts.' : 'Assign bill to students.'}</CardDescription>
                    </CardHeader>
                    {step === 1 && (
                        <CardContent className="space-y-4">
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
                            <CardFooter className="px-0 pb-0 justify-between">
                                <div className="font-semibold text-lg">
                                    Total: {new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(totalBillAmount)}
                                </div>
                                <Button onClick={() => setStep(2)} disabled={billItems.length === 0 || !termName.trim() || billItems.some(i => i.amount === '')}>
                                    Next: Assign Students <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </CardFooter>
                        </CardContent>
                    )}
                     {step === 2 && (
                        <CardContent className="space-y-4">
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
                           <CardFooter className="px-0 pb-0 justify-between">
                                <Button variant="outline" onClick={() => setStep(1)}>Previous</Button>
                                 <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button disabled={isLoading || studentIdsToBill.length === 0}>
                                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                            Finalize & Prepare Bills
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will generate a bill of {new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(totalBillAmount)} for {studentIdsToBill.length} students for the term "{termName}". This action cannot be easily undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handlePrepareBills}>Confirm</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </CardFooter>
                        </CardContent>
                    )}
                </Card>
            </div>
            {step === 1 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Available Fee Items</CardTitle>
                        <CardDescription>Click to add items to the current bill.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
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
                    </CardContent>
                </Card>
            )}
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
