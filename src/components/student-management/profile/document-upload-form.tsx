
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UploadedDocument } from '@/lib/types';

const formSchema = z.object({
  name: z.string().min(1, 'Document name is required.'),
  type: z.enum(['Birth Certificate', 'Transcript', 'Report Card', 'Admission Form', 'Admission Letter']),
  url: z.string().url('A valid URL is required.').min(1, 'URL is required.'),
});

type FormValues = Omit<UploadedDocument, 'uploaded_at'> & {type: 'Birth Certificate' | 'Transcript' | 'Report Card' | 'Admission Form' | 'Admission Letter'};

type DocumentUploadFormProps = {
  onSubmit: (values: UploadedDocument) => void;
};

export function DocumentUploadForm({ onSubmit }: DocumentUploadFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', type: 'Admission Form', url: '' },
  });

  const handleSubmit = (values: FormValues) => {
    onSubmit({
        ...values,
        uploaded_at: new Date().toISOString(),
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField name="name" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Document Name</FormLabel>
            <FormControl><Input placeholder="e.g., May 2024 Report Card" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField name="type" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Document Type</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
              <SelectContent>
                <SelectItem value="Birth Certificate">Birth Certificate</SelectItem>
                <SelectItem value="Transcript">Transcript</SelectItem>
                <SelectItem value="Report Card">Report Card</SelectItem>
                <SelectItem value="Admission Form">Admission Form</SelectItem>
                <SelectItem value="Admission Letter">Admission Letter</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
         <FormField name="url" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Document URL</FormLabel>
            <FormControl><Input placeholder="https://example.com/document.pdf" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="flex justify-end">
          <Button type="submit">Add Document</Button>
        </div>
      </form>
    </Form>
  );
}
