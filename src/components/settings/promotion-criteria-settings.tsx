

'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getPromotionCriteria, savePromotionCriteria, getSubjects, addAuditLog } from '@/lib/store';
import { PromotionCriteria, Subject, SchoolLevel, ALL_SCHOOL_LEVELS } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { MultiSelectPopover } from '../academics/subjects/multi-select-popover';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

const ruleSchema = z.object({
  minAverageScore: z.coerce.number().min(0).max(100, "Must be between 0 and 100"),
  minPassMark: z.coerce.number().min(0).max(100, "Must be between 0 and 100"),
  compulsorySubjects: z.array(z.string()),
  electiveSubjects: z.array(z.string()),
  minElectivesToPass: z.coerce.number().min(0, "Cannot be negative"),
});

const formSchema = z.record(z.enum(ALL_SCHOOL_LEVELS), ruleSchema.partial());

type FormData = z.infer<typeof formSchema>;

function PromotionRuleForm({ level, allSubjects }: { level: SchoolLevel, allSubjects: Subject[] }) {
    const { control, watch } = useFormContext<FormData>();
    const compulsorySubjects = watch(`${level}.compulsorySubjects`) || [];

    const availableElectives = allSubjects.filter(sub => !compulsorySubjects.includes(sub.id));
    
    return (
        <div className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={control}
                    name={`${level}.minAverageScore`}
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
                    control={control}
                    name={`${level}.minPassMark`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Minimum Pass Mark per Subject (%)</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="e.g., 40" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            {level !== 'Pre-School' && (
                <>
                    <FormField
                        control={control}
                        name={`${level}.compulsorySubjects`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Compulsory Core Subjects (Must Pass)</FormLabel>
                                <FormControl>
                                    <MultiSelectPopover 
                                        title="Core Subjects"
                                        options={allSubjects.map(s => ({ value: s.id, label: s.name }))}
                                        selectedValues={field.value || []}
                                        onChange={field.onChange}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name={`${level}.electiveSubjects`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Elective Subjects Pool</FormLabel>
                                <FormControl>
                                    <MultiSelectPopover 
                                        title="Elective Subjects"
                                        options={availableElectives.map(s => ({ value: s.id, label: s.name }))}
                                        selectedValues={field.value || []}
                                        onChange={field.onChange}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name={`${level}.minElectivesToPass`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Minimum Number of Electives to Pass</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="e.g., 2" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </>
            )}
        </div>
    )
}

export function PromotionCriteriaSettings() {
    const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
    const { user } = useAuth();
    const { toast } = useToast();
    
    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
    });

    useEffect(() => {
        setAllSubjects(getSubjects());
        const criteria = getPromotionCriteria();
        
        const defaultValues: FormData = ALL_SCHOOL_LEVELS.reduce((acc, level) => {
            acc[level] = {
                minAverageScore: 50,
                minPassMark: 40,
                compulsorySubjects: [],
                electiveSubjects: [],
                minElectivesToPass: 0,
                ...criteria[level] // Override defaults with saved values
            };
            return acc;
        }, {} as FormData);

        form.reset(defaultValues);
    }, [form]);
    
    const onSubmit = (values: FormData) => {
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
            description: 'The rules for student promotion have been updated for all school levels.',
        });
    };

    return (
        <Card>
            <CardContent className="pt-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <Accordion type="single" collapsible defaultValue="Lower Primary">
                            {ALL_SCHOOL_LEVELS.map(level => (
                                <AccordionItem key={level} value={level}>
                                    <AccordionTrigger className="text-lg font-semibold">{level}</AccordionTrigger>
                                    <AccordionContent>
                                        <PromotionRuleForm level={level} allSubjects={allSubjects} />
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                        <div className="flex justify-end pt-4">
                            <Button type="submit">Save All Criteria</Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}

