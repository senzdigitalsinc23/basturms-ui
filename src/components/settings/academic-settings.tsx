

'use client';
import { useState, useEffect } from 'react';
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { CalendarIcon, PlusCircle, Trash2, Edit } from "lucide-react";
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AcademicYear, ALL_ACADEMIC_YEAR_STATUSES, Term } from '@/lib/types';
import { getAcademicYears, saveAcademicYears, addAuditLog } from '@/lib/store';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { Checkbox } from '../ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';

const termSchema = z.object({
    name: z.string().min(1, 'Term name is required.'),
    startDate: z.date({ required_error: 'Start date is required.'}),
    endDate: z.date({ required_error: 'End date is required.'}),
    status: z.enum(['Upcoming', 'Active', 'Completed']),
});

const academicYearSchema = z.object({
    year: z.string().regex(/^\d{4}\/\d{4}$/, 'Year must be in YYYY/YYYY format'),
    terms: z.array(termSchema),
    status: z.enum(ALL_ACADEMIC_YEAR_STATUSES),
});

const addAcademicYearSchema = academicYearSchema.omit({ terms: true }).extend({
    numberOfTerms: z.number().min(1, 'Number of terms is required.'),
});


export function AcademicSettings() {
    const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isManageTermsOpen, setIsManageTermsOpen] = useState(false);
    const [isEditYearOpen, setIsEditYearOpen] = useState(false);
    const [selectedYear, setSelectedYear] = useState<AcademicYear | null>(null);
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
    const { user } = useAuth();
    const { toast } = useToast();
    
    const form = useForm<z.infer<typeof academicYearSchema>>({
        resolver: zodResolver(academicYearSchema),
    });

    const { fields } = useFieldArray({
        control: form.control,
        name: "terms",
    });
    
    const addForm = useForm<z.infer<typeof addAcademicYearSchema>>({
        resolver: zodResolver(addAcademicYearSchema),
         defaultValues: {
            year: `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
            numberOfTerms: 3,
            status: 'Upcoming',
        }
    });

    useEffect(() => {
        setAcademicYears(getAcademicYears());
    }, []);

    const handleAddYear = (values: z.infer<typeof addAcademicYearSchema>) => {
        const newYear: AcademicYear = {
            year: values.year,
            status: values.status,
            terms: Array.from({ length: values.numberOfTerms }, (_, i) => ({
                name: `Term ${i + 1}`,
                startDate: new Date().toISOString(),
                endDate: new Date().toISOString(),
                status: 'Upcoming'
            }))
        };

        const newYears = [...academicYears, newYear];
        saveAcademicYears(newYears);
        setAcademicYears(newYears);
        
        if(user) {
            addAuditLog({
                user: user.email,
                name: user.name,
                action: 'Create Academic Year',
                details: `Created new academic year: ${values.year}`,
            });
        }
        
        toast({ title: 'Academic Year Added', description: `The year ${values.year} has been created.` });
        setIsAddDialogOpen(false);
        addForm.reset();
    };
    
    const handleManageTerms = (year: AcademicYear) => {
        setSelectedYear(year);
        form.reset({
            ...year,
            terms: Array.isArray(year.terms) ? year.terms.map(t => ({...t, startDate: parseISO(t.startDate), endDate: parseISO(t.endDate)})) : []
        });
        setIsManageTermsOpen(true);
    };

    const handleEditYear = (year: AcademicYear) => {
        setSelectedYear(year);
        addForm.reset({
            year: year.year,
            status: year.status,
            numberOfTerms: Array.isArray(year.terms) ? year.terms.length : 0,
        });
        setIsEditYearOpen(true);
    }
    
    const processYearUpdate = (values: z.infer<typeof addAcademicYearSchema>) => {
        if (!selectedYear) return;

        const updatedYears = academicYears.map(year => 
            year.year === selectedYear.year ? { ...year, year: values.year, status: values.status } : year
        );
        
        saveAcademicYears(updatedYears);
        setAcademicYears(updatedYears);
        
        if(user) {
             addAuditLog({
                user: user.email,
                name: user.name,
                action: 'Update Academic Year',
                details: `Updated academic year: ${selectedYear.year} to ${values.year}`,
            });
        }
        
        toast({ title: 'Academic Year Updated', description: `The year ${selectedYear.year} has been updated.` });
        setIsEditYearOpen(false);
        setSelectedYear(null);
    }

    const handleUpdateYear = (values: z.infer<typeof academicYearSchema>) => {
        if (!selectedYear) return;

        const updatedYears = academicYears.map(year => 
            year.year === selectedYear.year ? { ...values, terms: values.terms.map(t => ({...t, startDate: t.startDate.toISOString(), endDate: t.endDate.toISOString()})) } : year
        );

        saveAcademicYears(updatedYears);
        setAcademicYears(updatedYears);

        if(user) {
            addAuditLog({
                user: user.email,
                name: user.name,
                action: 'Update Academic Year Terms',
                details: `Updated terms for academic year: ${selectedYear.year}`,
            });
        }
        
        toast({ title: 'Academic Year Updated', description: `The terms for ${selectedYear.year} have been updated.` });
        setIsManageTermsOpen(false);
        setSelectedYear(null);
    }

    const handleBulkDelete = () => {
        const yearsToDelete = Object.keys(rowSelection).filter(key => rowSelection[key]);
        const newYears = academicYears.filter(year => !yearsToDelete.includes(year.year));
        saveAcademicYears(newYears);
        setAcademicYears(newYears);
        setRowSelection({});
        toast({
            title: 'Academic Years Deleted',
            description: `${yearsToDelete.length} academic year(s) have been deleted.`
        });
    }

    const isAllSelected = academicYears.length > 0 && Object.keys(rowSelection).length === academicYears.length;

    return (
        <div className="space-y-4">
             <div className="flex justify-between items-center">
                <div>
                     {Object.keys(rowSelection).length > 0 && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Selected ({Object.keys(rowSelection).length})
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>This will permanently delete the selected academic years. This action cannot be undone.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleBulkDelete}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm"><PlusCircle className="mr-2"/> Add Academic Year</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Academic Year</DialogTitle>
                            <DialogDescription>Define a new academic year and its terms.</DialogDescription>
                        </DialogHeader>
                        <Form {...addForm}>
                            <form onSubmit={addForm.handleSubmit(handleAddYear)} className="space-y-4">
                                <FormField control={addForm.control} name="year" render={({ field }) => (
                                    <FormItem><FormLabel>Academic Year</FormLabel><FormControl><Input placeholder="e.g., 2024/2025" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                 <FormField control={addForm.control} name="numberOfTerms" render={({ field }) => (
                                    <FormItem><FormLabel>Number of Terms</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={addForm.control} name="status" render={({ field }) => (
                                    <FormItem><FormLabel>Status</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                        <SelectContent>{ALL_ACADEMIC_YEAR_STATUSES.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent>
                                    </Select><FormMessage /></FormItem>
                                )}/>
                                <div className="flex justify-end"><Button type="submit">Create Year</Button></div>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]"><Checkbox checked={isAllSelected} onCheckedChange={checked => {
                                const newRowSelection: Record<string, boolean> = {};
                                if (checked) { academicYears.forEach(y => newRowSelection[y.year] = true); }
                                setRowSelection(newRowSelection);
                            }}/></TableHead>
                            <TableHead>Academic Year</TableHead>
                            <TableHead>Terms</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {academicYears.map(year => (
                            <TableRow key={year.year}>
                                <TableCell><Checkbox checked={rowSelection[year.year] || false} onCheckedChange={checked => setRowSelection(prev => ({...prev, [year.year]: !!checked}))} /></TableCell>
                                <TableCell>{year.year}</TableCell>
                                <TableCell>{Array.isArray(year.terms) ? year.terms.length : 0}</TableCell>
                                <TableCell>{year.status}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" onClick={() => handleEditYear(year)}><Edit className="mr-2 h-4 w-4"/> Edit</Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleManageTerms(year)}>Manage Terms</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
             <Dialog open={isManageTermsOpen} onOpenChange={setIsManageTermsOpen}>
                <DialogContent className="sm:max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Manage Terms for {selectedYear?.year}</DialogTitle>
                        <DialogDescription>Edit term names and dates for this academic year.</DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleUpdateYear)} className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
                            {fields.map((field, index) => (
                                <div key={field.id} className="p-4 border rounded-lg space-y-4">
                                     <FormField control={form.control} name={`terms.${index}.name`} render={({ field }) => (
                                        <FormItem><FormLabel>Term Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                     )}/>
                                     <div className="grid grid-cols-2 gap-4">
                                        <FormField control={form.control} name={`terms.${index}.startDate`} render={({ field }) => (
                                            <FormItem className="flex flex-col"><FormLabel>Start Date</FormLabel>
                                            <Popover><PopoverTrigger asChild>
                                                <FormControl><Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button></FormControl>
                                            </PopoverTrigger><PopoverContent className="w-auto p-0" align="start">
                                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                            </PopoverContent></Popover><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name={`terms.${index}.endDate`} render={({ field }) => (
                                            <FormItem className="flex flex-col"><FormLabel>End Date</FormLabel>
                                             <Popover><PopoverTrigger asChild>
                                                <FormControl><Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button></FormControl>
                                            </PopoverTrigger><PopoverContent className="w-auto p-0" align="start">
                                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                            </PopoverContent></Popover><FormMessage /></FormItem>
                                        )} />
                                     </div>
                                     <FormField control={form.control} name={`terms.${index}.status`} render={({ field }) => (
                                        <FormItem><FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="Upcoming">Upcoming</SelectItem>
                                                <SelectItem value="Active">Active</SelectItem>
                                                <SelectItem value="Completed">Completed</SelectItem>
                                            </SelectContent>
                                        </Select><FormMessage /></FormItem>
                                    )} />
                                </div>
                            ))}
                             <DialogFooter className="pt-4 sticky bottom-0 bg-background/95 pb-1 -mx-1 px-1">
                                <Button type="submit">Save Changes</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
             <Dialog open={isEditYearOpen} onOpenChange={setIsEditYearOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Academic Year</DialogTitle>
                        <DialogDescription>Update details for {selectedYear?.year}</DialogDescription>
                    </DialogHeader>
                    <Form {...addForm}>
                        <form onSubmit={addForm.handleSubmit(processYearUpdate)} className="space-y-4">
                             <FormField control={addForm.control} name="year" render={({ field }) => (
                                <FormItem><FormLabel>Academic Year</FormLabel><FormControl><Input placeholder="e.g., 2024/2025" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={addForm.control} name="status" render={({ field }) => (
                                <FormItem><FormLabel>Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                    <SelectContent>{ALL_ACADEMIC_YEAR_STATUSES.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent>
                                </Select><FormMessage /></FormItem>
                            )}/>
                             <FormField control={addForm.control} name="numberOfTerms" render={({ field }) => (
                                <FormItem><FormLabel>Number of Terms</FormLabel><FormControl><Input type="number" {...field} readOnly disabled /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <DialogFooter><Button type="submit">Save Changes</Button></DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
             </Dialog>
        </div>
    )
}
