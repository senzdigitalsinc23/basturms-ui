
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AcademicRecord } from '@/lib/types';

const formSchema = z.object({
  term: z.string().min(1, 'Term is required.'),
  subject: z.string().min(1, 'Subject is required.'),
  grade: z.string().min(1, 'Grade is required.'),
  teacher_remarks: z.string().min(1, 'Remarks are required.'),
});

type AcademicRecordFormProps = {
  onSubmit: (values: AcademicRecord) => void;
};

export function AcademicRecordForm({ onSubmit }: AcademicRecordFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { term: '', subject: '', grade: '', teacher_remarks: '' },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField name="term" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Term</FormLabel>
            <FormControl><Input placeholder="e.g., 1st Term 2024" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField name="subject" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Subject</FormLabel>
            <FormControl><Input placeholder="e.g., Mathematics" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField name="grade" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Grade</FormLabel>
            <FormControl><Input placeholder="e.g., A+" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField name="teacher_remarks" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Teacher Remarks</FormLabel>
            <FormControl><Textarea placeholder="e.g., Excellent performance." {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="flex justify-end">
          <Button type="submit" size="sm">Add Record</Button>
        </div>
      </form>
    </Form>
  );
}
