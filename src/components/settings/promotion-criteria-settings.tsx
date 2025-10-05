
'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getPromotionCriteria, savePromotionCriteria, getSubjects, addAuditLog } from '@/lib/store';
import { PromotionCriteria, Subject } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { MultiSelectPopover } from '../academics/subjects/multi-select-popover';
import { Card, CardContent } from '../ui/card';

const formSchema = z.object({
  minAverageScore: z.coerce.number().min(0).max(100, "Must be between 0 and 100"),
  coreSubjects: z.array(z.string()),
  minCoreSubjectsToPass: z.coerce.number().min(0, "Cannot be negative"),
});

export function PromotionCriteriaSettings() {
    const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
    const { user } = useAuth();
    const { toast } = useToast();
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            minAverageScore: 50,
            coreSubjects: [],
            minCoreSubjectsToPass: 0,
        },
    });

    useEffect(() => {
        setAllSubjects(getSubjects());
        const criteria = getPromotionCriteria();
        if (criteria) {
            form.reset({
                minAverageScore: criteria.minAverageScore || 50,
                coreSubjects: criteria.coreSubjects || [],
                minCoreSubjectsToPass: criteria.minCoreSubjectsToPass || 0,
            });
        }
    }, [form]);
    
    const onSubmit = (values: z.infer<typeof formSchema>) => {
        if (!user) return;
        
        savePromotionCriteria(values);
        addAuditLog({
            user: user.email,
            name: user.name,
            action: 'Update Promotion Criteria',
            details: 'The student promotion criteria were updated.',
        });
        toast({
            title: 'Promotion Criteria Saved',
            description: 'The rules for student promotion have been updated.',
        });
    };

    return (
        <Card>
            <CardContent className="pt-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="minAverageScore"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Minimum Average Score (%)</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="e.g., 50" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="coreSubjects"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Core Subjects</FormLabel>
                                    <FormControl>
                                        <MultiSelectPopover 
                                            title="Subjects"
                                            options={allSubjects.map(s => ({ value: s.id, label: s.name }))}
                                            selectedValues={field.value}
                                            onChange={field.onChange}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="minCoreSubjectsToPass"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Minimum Core Subjects to Pass</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="e.g., 3" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-end">
                            <Button type="submit">Save Criteria</Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}

