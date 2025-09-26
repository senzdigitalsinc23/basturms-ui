
'use client';
import { useState, useEffect } from 'react';
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { PlusCircle, Loader2 } from "lucide-react";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AcademicYear, ALL_ACADEMIC_YEAR_STATUSES } from '@/lib/types';
import { getAcademicYears, saveAcademicYears, addAuditLog } from '@/lib/store';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

const academicYearSchema = z.object({
    year: z.string().regex(/^\d{4}\/\d{4}$/, 'Year must be in YYYY/YYYY format'),
    terms: z.coerce.number().min(1, 'At least one term is required.'),
    status: z.enum(ALL_ACADEMIC_YEAR_STATUSES),
});

export function AcademicSettings() {
    const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
    const [selectedYear, setSelectedYear] = useState<AcademicYear | null>(null);
    const { user } = useAuth();
    const { toast } = useToast();

    const form = useForm<z.infer<typeof academicYearSchema>>({
        resolver: zodResolver(academicYearSchema),
        defaultValues: {
            year: `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
            terms: 3,
            status: 'Upcoming',
        }
    });

    useEffect(() => {
        setAcademicYears(getAcademicYears());
    }, []);

    const handleAddYear = (values: z.infer<typeof academicYearSchema>) => {
        const newYears = [...academicYears, values];
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
        setIsManageDialogOpen(true);
    };

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
                                            <FormControl><Input type="number" {...field} /></FormControl>
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
                                <TableCell>{year.terms}</TableCell>
                                <TableCell>{year.status}</TableCell>
                                <TableCell><Button variant="outline" size="sm" onClick={() => handleManageTerms(year)}>Manage Terms</Button></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
             <Dialog open={isManageDialogOpen} onOpenChange={setIsManageDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Manage Terms for {selectedYear?.year}</DialogTitle>
                        <DialogDescription>
                            This academic year has {selectedYear?.terms} term(s). Future functionality will allow editing term dates here.
                        </DialogDescription>
                    </DialogHeader>
                    {/* Future term management UI will go here */}
                </DialogContent>
            </Dialog>
        </div>
    )
}
