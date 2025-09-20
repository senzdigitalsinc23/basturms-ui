
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CommunicationLog } from '@/lib/types';

const formSchema = z.object({
  date: z.date({ required_error: 'Date is required.' }),
  type: z.enum(['Email', 'Phone Call', 'Meeting'], { required_error: 'Type is required.' }),
  with_whom: z.string().min(1, 'This field is required.'),
  notes: z.string().min(1, 'Notes are required.'),
});

type FormValues = Omit<CommunicationLog, 'date'> & { date: Date, type: 'Email' | 'Phone Call' | 'Meeting' };

type CommunicationLogFormProps = {
  onSubmit: (values: CommunicationLog) => void;
};

export function CommunicationLogForm({ onSubmit }: CommunicationLogFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { date: new Date(), type: 'Phone Call', with_whom: '', notes: '' },
  });

  const handleSubmit = (values: FormValues) => {
    onSubmit({
        ...values,
        date: values.date.toISOString(),
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField name="date" control={form.control} render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Date</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button variant="outline" className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>
                    {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )} />
        <FormField name="type" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Type</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
              <SelectContent>
                <SelectItem value="Phone Call">Phone Call</SelectItem>
                <SelectItem value="Email">Email</SelectItem>
                <SelectItem value="Meeting">Meeting</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
        <FormField name="with_whom" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>With Whom</FormLabel>
            <FormControl><Input placeholder="e.g., Jane Doe (Mother)" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField name="notes" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Notes</FormLabel>
            <FormControl><Textarea placeholder="Summarize the communication" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="flex justify-end">
          <Button type="submit">Add Log</Button>
        </div>
      </form>
    </Form>
  );
}
