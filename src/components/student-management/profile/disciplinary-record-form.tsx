
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
import { DisciplinaryRecord, User } from '@/lib/types';

const formSchema = z.object({
  date: z.date({ required_error: 'Date of incident is required.' }),
  incident: z.string().min(1, 'Incident description is required.'),
  action_taken: z.string().min(1, 'Action taken is required.'),
  reported_by: z.string({ required_error: 'Please select who reported this.' }),
});

type FormValues = Omit<DisciplinaryRecord, 'date'> & { date: Date };

type DisciplinaryRecordFormProps = {
  onSubmit: (values: DisciplinaryRecord) => void;
  users: User[];
};

export function DisciplinaryRecordForm({ onSubmit, users }: DisciplinaryRecordFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { date: new Date(), incident: '', action_taken: '' },
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
            <FormLabel>Date of Incident</FormLabel>
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
                 <Calendar 
                    mode="single" 
                    selected={field.value} 
                    onSelect={field.onChange} 
                    captionLayout="dropdown-buttons"
                    fromYear={2015}
                    toYear={new Date().getFullYear()}
                    initialFocus 
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )} />
        <FormField name="incident" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Incident</FormLabel>
            <FormControl><Textarea placeholder="Describe the incident" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField name="action_taken" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Action Taken</FormLabel>
            <FormControl><Input placeholder="e.g., Detention" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
         <FormField name="reported_by" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Reported By</FormLabel>
             <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select a staff member" /></SelectTrigger></FormControl>
                <SelectContent>
                    {users.filter(u => u.role === 'Admin' || u.role === 'Teacher' || u.role === 'Headmaster').map(user => (
                        <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                    ))}
                </SelectContent>
             </Select>
            <FormMessage />
          </FormItem>
        )} />
        <div className="flex justify-end">
          <Button type="submit">Add Record</Button>
        </div>
      </form>
    </Form>
  );
}
