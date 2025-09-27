

'use client';
import { useState, useEffect } from 'react';
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '../ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { CalendarIcon, PlusCircle, Loader2 } from "lucide-react";
import { useForm } from 'react-hook-form';
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

export function AcademicSettings() {
    const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isManageTermsOpen, setIsManageTermsOpen] = useState(false);
    const [selectedYear, setSelectedYear] = useState<AcademicYear | null>(null);
    const { user } = useAuth();
    const { toast } = useToast();

    const form = useForm<z.infer<typeof academicYearSchema>>({
        resolver: zodResolver(academicYearSchema),
    });

    useEffect(() => {
        setAcademicYears(getAcademicYears());
    }, []);

    const handleAddYear = (values: z.infer<typeof academicYearSchema>) => {
        const newYear: AcademicYear = {
            ...values,
            terms: Array.from({ length: values.terms.length }, (_, i) => ({
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
        form.reset();
    };
    
    const handleManageTerms = (year: AcademicYear) => {
        setSelectedYear(year);
        form.reset({
            ...year,
            terms: year.terms.map(t => ({...t, startDate: parseISO(t.startDate), endDate: parseISO(t.endDate)}))
        });
        setIsManageTermsOpen(true);
    };

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

    return (
        <div className="space-y-4">
             <div className="flex justify-end">
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm"><PlusCircle className="mr-2"/> Add Academic Year</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Academic Year</DialogTitle>
                            <DialogDescription>Define a new academic year and its terms.</DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleAddYear)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="year"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Academic Year</FormLabel>
                                            <FormControl><Input placeholder="e.g., 2024/2025" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={form.control}
                                    name="terms"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Number of Terms</FormLabel>
                                            <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Status</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {ALL_ACADEMIC_YEAR_STATUSES.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="flex justify-end">
                                    <Button type="submit">Create Year</Button>
                                </div>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Academic Year</TableHead>
                            <TableHead>Terms</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {academicYears.map(year => (
                            <TableRow key={year.year}>
                                <TableCell>{year.year}</TableCell>
                                <TableCell>{year.terms.length}</TableCell>
                                <TableCell>{year.status}</TableCell>
                                <TableCell><Button variant="outline" size="sm" onClick={() => handleManageTerms(year)}>Manage Terms</Button></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
             <Dialog open={isManageTermsOpen} onOpenChange={setIsManageTermsOpen}>
                <DialogContent className="sm:max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Manage Terms for {selectedYear?.year}</DialogTitle>
                        <DialogDescription>
                            Edit term names and dates for this academic year.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleUpdateYear)}>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Term Name</TableHead>
                                            <TableHead>Start Date</TableHead>
                                            <TableHead>End Date</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {form.getValues('terms').map((term, index) => (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    <FormField control={form.control} name={`terms.${index}.name`} render={({ field }) => (
                                                        <Input {...field} />
                                                    )} />
                                                </TableCell>
                                                <TableCell>
                                                    <FormField control={form.control} name={`terms.${index}.startDate`} render={({ field }) => (
                                                         <Popover>
                                                            <PopoverTrigger asChild>
                                                                <FormControl>
                                                                    <Button variant={"outline"} className={cn("w-[240px] pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                                                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                                    </Button>
                                                                </FormControl>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-auto p-0" align="start">
                                                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                                            </PopoverContent>
                                                        </Popover>
                                                    )} />
                                                </TableCell>
                                                <TableCell>
                                                     <FormField control={form.control} name={`terms.${index}.endDate`} render={({ field }) => (
                                                         <Popover>
                                                            <PopoverTrigger asChild>
                                                                <FormControl>
                                                                    <Button variant={"outline"} className={cn("w-[240px] pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                                                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                                    </Button>
                                                                </FormControl>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-auto p-0" align="start">
                                                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                                            </PopoverContent>
                                                        </Popover>
                                                    )} />
                                                </TableCell>
                                                <TableCell>
                                                    <FormField control={form.control} name={`terms.${index}.status`} render={({ field }) => (
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="Upcoming">Upcoming</SelectItem>
                                                                <SelectItem value="Active">Active</SelectItem>
                                                                <SelectItem value="Completed">Completed</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    )} />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                             <DialogFooter className="pt-4">
                                <Button type="submit">Save Changes</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
