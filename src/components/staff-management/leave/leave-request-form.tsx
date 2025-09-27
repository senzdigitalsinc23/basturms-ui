
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { LeaveRequest, LeaveType, ALL_LEAVE_TYPES, Staff } from '@/lib/types';
import { DateRange } from 'react-day-picker';

const formSchema = z.object({
  staff_id: z.string({ required_error: 'Please select a staff member.' }),
  leave_type: z.enum(ALL_LEAVE_TYPES),
  date_range: z.object({
    from: z.date({ required_error: 'Start date is required.' }),
    to: z.date({ required_error: 'End date is required.' }),
  }),
  reason: z.string().min(1, 'A reason for the leave is required.'),
});

type FormValues = z.infer<typeof formSchema>;
type LeaveRequestFormProps = {
  staffList: Staff[];
  onSubmit: (values: Omit<LeaveRequest, 'id' | 'request_date' | 'status' | 'staff_name'>) => void;
};

export function LeaveRequestForm({ staffList, onSubmit }: LeaveRequestFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date_range: { from: undefined, to: undefined },
      reason: '',
    },
  });

  const handleSubmit = (values: FormValues) => {
    onSubmit({
        staff_id: values.staff_id,
        leave_type: values.leave_type,
        start_date: values.date_range.from.toISOString(),
        end_date: values.date_range.to.toISOString(),
        reason: values.reason,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          name="staff_id"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Staff Member</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a staff member" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {staffList.map((staff) => (
                    <SelectItem key={staff.staff_id} value={staff.staff_id}>
                      {staff.first_name} {staff.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="leave_type"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Leave Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ALL_LEAVE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="date_range"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Leave Dates</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value?.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value?.from ? (
                        field.value.to ? (
                          `${format(field.value.from, "LLL dd, y")} - ${format(
                            field.value.to,
                            "LLL dd, y"
                          )}`
                        ) : (
                          format(field.value.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={field.value?.from}
                    selected={field.value}
                    onSelect={field.onChange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="reason"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason for Leave</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter the reason for the leave request..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit">Submit Request</Button>
        </div>
      </form>
    </Form>
  );
}
