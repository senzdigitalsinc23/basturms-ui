
'use client';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { HealthRecords, ALL_BLOOD_GROUPS, BloodGroup } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const formSchema = z.object({
    blood_group: z.enum(ALL_BLOOD_GROUPS),
    allergies: z.string().optional(),
    medical_notes: z.string().optional(),
    vaccinations: z.array(z.object({
        name: z.string().min(1, "Vaccine name is required."),
        date: z.date({required_error: "Date is required."}),
    })).optional(),
});

type HealthRecordsFormProps = {
  onSubmit: (values: HealthRecords) => void;
  defaultValues?: HealthRecords;
};

export function HealthRecordsForm({ onSubmit, defaultValues }: HealthRecordsFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        ...defaultValues,
        allergies: defaultValues?.allergies?.join(', '),
        vaccinations: defaultValues?.vaccinations?.map(v => ({...v, date: new Date(v.date)}))
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "vaccinations"
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const formattedData: HealthRecords = {
        blood_group: values.blood_group,
        allergies: values.allergies ? values.allergies.split(',').map(s => s.trim()).filter(Boolean) : [],
        medical_notes: values.medical_notes,
        vaccinations: values.vaccinations?.map(v => ({...v, date: v.date.toISOString()})),
    }
    onSubmit(formattedData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 max-h-[70vh] overflow-y-auto p-1">
        <FormField
          name="blood_group"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Blood Group</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select Blood Group" /></SelectTrigger></FormControl>
                <SelectContent>
                  {ALL_BLOOD_GROUPS.map(group => <SelectItem key={group} value={group}>{group}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="allergies"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Allergies (comma-separated)</FormLabel>
              <FormControl><Input placeholder="e.g., Peanuts, Dust" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="medical_notes"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Medical Notes</FormLabel>
              <FormControl><Textarea placeholder="Any other medical information..." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div>
            <FormLabel>Vaccinations</FormLabel>
            <div className="space-y-4 mt-2">
                {fields.map((field, index) => (
                    <div key={field.id} className="flex items-start gap-2 p-2 border rounded-md">
                       <div className="grid grid-cols-2 gap-4 flex-1">
                            <FormField
                                control={form.control}
                                name={`vaccinations.${index}.name`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl><Input placeholder="Vaccine Name" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name={`vaccinations.${index}.date`}
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
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
                                                    fromYear={1990}
                                                    toYear={new Date().getFullYear()}
                                                    initialFocus 
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                       </div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ name: '', date: new Date() })}
                >
                    Add Vaccination
                </Button>
            </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </Form>
  );
}
