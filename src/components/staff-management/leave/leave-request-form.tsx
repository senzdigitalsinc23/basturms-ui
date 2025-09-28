

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
import { format, eachDayOfInterval, isWeekend, addDays } from 'date-fns';
import { LeaveRequest, LeaveType, ALL_LEAVE_TYPES, Staff } from '@/lib/types';
import { useEffect, useState } from 'react';
import { getLeaveRequests } from '@/lib/store';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

const formSchema = z.object({
  staff_id: z.string({ required_error: 'Please select a staff member.' }),
  leave_type: z.enum(ALL_LEAVE_TYPES),
  date_range: z.object({
    from: z.date({ required_error: 'Start date is required.' }),
    to: z.date({ required_error: 'End date is required.' }),
  }),
  reason: z.string().min(1, 'A reason for the leave is required.'),
  leave_year: z.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;
type LeaveRequestFormProps = {
  staffList: Staff[];
  onSubmit: (values: Omit<LeaveRequest, 'id' | 'request_date' | 'status' | 'staff_name'>) => void;
};

export function LeaveRequestForm({ staffList, onSubmit }: LeaveRequestFormProps) {
  const [numberOfDays, setNumberOfDays] = useState(0);
  const [returnDate, setReturnDate] = useState<string | null>(null);
  const [leaveYear, setLeaveYear] = useState<number | null>(null);
  const [hasPending, setHasPending] = useState(false);
  const [totalDaysTakenThisYear, setTotalDaysTakenThisYear] = useState(0);
  const [annualLeaveLimit] = useState(36);
  const [maxDate, setMaxDate] = useState<Date | null>(null);
  
  const remainingLeaveDays = annualLeaveLimit - totalDaysTakenThisYear;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date_range: { from: undefined, to: undefined },
      reason: '',
    },
  });

  const watchedDateRange = form.watch('date_range');
  const watchedStaffId = form.watch('staff_id');
  const watchedLeaveType = form.watch('leave_type');

  useEffect(() => {
    if (watchedDateRange?.from) {
      const year = watchedDateRange.from.getFullYear();
      setLeaveYear(year);
      form.setValue('leave_year', year);
    } else {
      setLeaveYear(null);
      form.setValue('leave_year', undefined);
    }
  }, [watchedDateRange?.from, form]);

  useEffect(() => {
    form.clearErrors(); // Clear previous errors when staff or date changes
    setTotalDaysTakenThisYear(0);
    if (watchedStaffId && leaveYear) {
      const allRequests = getLeaveRequests();
      const approvedLeaveForYear = allRequests.filter(
        (r) =>
          r.staff_id === watchedStaffId &&
          r.leave_year === leaveYear &&
          r.status === 'Approved'
      );
      const daysTaken = approvedLeaveForYear.reduce((acc, curr) => {
        const days = eachDayOfInterval({
          start: new Date(curr.start_date),
          end: new Date(curr.end_date),
        }).filter(day => !isWeekend(day));
        return acc + (curr.days_approved || days.length);
      }, 0);
      setTotalDaysTakenThisYear(daysTaken);
    }

    if (watchedDateRange?.from && watchedDateRange?.to) {
        const days = eachDayOfInterval({
            start: watchedDateRange.from,
            end: watchedDateRange.to
        });
        const businessDays = days.filter(day => !isWeekend(day));
        setNumberOfDays(businessDays.length);

        const nextDay = addDays(watchedDateRange.to, 1);
        setReturnDate(format(nextDay, 'PPP'));

        if (watchedLeaveType === 'Annual') {
            if (businessDays > annualLeaveLimit) {
                form.setError('date_range', { type: 'manual', message: `Leave cannot exceed ${annualLeaveLimit} working days.` });
            }
            if (totalDaysTakenThisYear + businessDays > annualLeaveLimit) {
                form.setError('date_range', { type: 'manual', message: `Exceeds annual leave limit of ${annualLeaveLimit} days. Days already taken: ${totalDaysTakenThisYear}.` });
            }
        }

    } else {
        setNumberOfDays(0);
        setReturnDate(null);
    }

    // Calculate max date
    if (watchedDateRange?.from && watchedLeaveType === 'Annual') {
        let date = new Date(watchedDateRange.from);
        let daysToAdd = remainingLeaveDays;
        while (daysToAdd > 0) {
            date = addDays(date, 1);
            if (!isWeekend(date)) {
                daysToAdd--;
            }
        }
        setMaxDate(date);
    } else {
        setMaxDate(null);
    }

  }, [watchedDateRange, watchedStaffId, leaveYear, form, totalDaysTakenThisYear, annualLeaveLimit, watchedLeaveType, remainingLeaveDays]);
  
   useEffect(() => {
    if (watchedStaffId) {
        const pendingRequest = getLeaveRequests().find(r => r.staff_id === watchedStaffId && r.status === 'Pending');
        setHasPending(!!pendingRequest);
    } else {
        setHasPending(false);
    }
  }, [watchedStaffId]);


  const handleSubmit = (values: FormValues) => {
    onSubmit({
        staff_id: values.staff_id,
        leave_type: values.leave_type,
        leave_year: values.leave_year!,
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
        {hasPending && (
            <Alert variant="destructive">
                <Info className="h-4 w-4" />
                <AlertTitle>Pending Request Found</AlertTitle>
                <AlertDescription>
                    This staff member already has a pending leave request. You cannot submit another until the existing one is processed.
                </AlertDescription>
            </Alert>
        )}
         <div className="grid grid-cols-2 gap-4">
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
             <div className="grid grid-cols-2 gap-4">
                <FormItem>
                    <FormLabel>Leave Year</FormLabel>
                    <FormControl>
                        <Input value={leaveYear || 'Select range'} readOnly disabled />
                    </FormControl>
                </FormItem>
                 <FormItem>
                    <FormLabel>Days Left</FormLabel>
                    <FormControl>
                        <Input value={watchedLeaveType === 'Annual' && watchedStaffId ? `${remainingLeaveDays} day(s)` : 'N/A'} readOnly disabled />
                    </FormControl>
                </FormItem>
             </div>
         </div>
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
                    captionLayout="dropdown-buttons"
                    fromYear={new Date().getFullYear()}
                    toYear={new Date().getFullYear() + 2}
                    disabled={(date) => {
                        if (date < new Date(new Date().setHours(0, 0, 0, 0))) return true;
                        if (maxDate && field.value?.from && date > maxDate) return true;
                        return false;
                    }}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
            <FormItem>
                <FormLabel>Number of Days Applied</FormLabel>
                <FormControl>
                    <Input value={`${numberOfDays} working day(s)`} readOnly disabled />
                </FormControl>
            </FormItem>
            <FormItem>
                <FormLabel>Return Date</FormLabel>
                <FormControl>
                    <Input value={returnDate || 'Select range'} readOnly disabled />
                </FormControl>
            </FormItem>
        </div>
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
          <Button type="submit" disabled={hasPending || !!form.formState.errors.date_range}>Submit Request</Button>
        </div>
      </form>
    </Form>
  );
}
