
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Class, StudentProfile } from '@/lib/types';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const editStudentSchema = z.object({
    first_name: z.string().min(2, 'First name is required.'),
    last_name: z.string().min(2, 'Last name is required.'),
    other_name: z.string().optional(),
    dob: z.date({ required_error: 'Date of birth is required.' }),
    gender: z.enum(['Male', 'Female', 'Other'], { required_error: 'Please select a gender.' }),
    
    email: z.string().email('Invalid email address.').optional(),
    phone: z.string().optional(),
    residence: z.string().optional(),
    
    guardian_name: z.string().min(2, "Guardian's name is required."),
    guardian_phone: z.string().min(1, "Guardian's phone is required."),
    guardian_email: z.string().email('Invalid email address.').optional(),
    guardian_relationship: z.string().min(2, "Guardian's relationship is required."),

    class_assigned: z.string({ required_error: 'Please select a class.' }),
});


type EditStudentFormProps = {
  defaultValues: StudentProfile;
  onSubmit: (values: Partial<StudentProfile>) => void;
  classes: Class[];
};

export function EditStudentForm({
  defaultValues,
  onSubmit,
  classes = []
}: EditStudentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<z.infer<typeof editStudentSchema>>({
    resolver: zodResolver(editStudentSchema),
    defaultValues: {
        first_name: defaultValues.student.first_name,
        last_name: defaultValues.student.last_name,
        other_name: defaultValues.student.other_name,
        dob: new Date(defaultValues.student.dob),
        gender: defaultValues.student.gender,
        email: defaultValues.contactDetails.email,
        phone: defaultValues.contactDetails.phone,
        residence: defaultValues.contactDetails.residence,
        guardian_name: defaultValues.guardianInfo.guardian_name,
        guardian_phone: defaultValues.guardianInfo.guardian_phone,
        guardian_email: defaultValues.guardianInfo.guardian_email,
        guardian_relationship: defaultValues.guardianInfo.guardian_relationship,
        class_assigned: defaultValues.admissionDetails.class_assigned,
    },
  });

  const handleFormSubmit = async (values: z.infer<typeof editStudentSchema>) => {
    setIsLoading(true);
    
    const profileData: Partial<StudentProfile> = {
        student: {
            // student_no should not be edited, so we spread the original and overwrite fields
            ...defaultValues.student,
            first_name: values.first_name,
            last_name: values.last_name,
            other_name: values.other_name,
            dob: values.dob.toISOString(),
            gender: values.gender,
        },
        contactDetails: {
            ...defaultValues.contactDetails,
            email: values.email,
            phone: values.phone,
            residence: values.residence,
        },
        guardianInfo: {
            ...defaultValues.guardianInfo,
            guardian_name: values.guardian_name,
            guardian_phone: values.guardian_phone,
            guardian_email: values.guardian_email,
            guardian_relationship: values.guardian_relationship,
        },
        admissionDetails: {
            ...defaultValues.admissionDetails,
            class_assigned: values.class_assigned,
        }
    };

    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    onSubmit(profileData);
    setIsLoading(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
        <h4 className="text-sm font-semibold text-primary">Student Details</h4>
        <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="first_name" render={({ field }) => (
                <FormItem><FormLabel>First Name</FormLabel><FormControl><Input placeholder="John" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
             <FormField control={form.control} name="last_name" render={({ field }) => (
                <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input placeholder="Doe" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
        </div>
        <FormField control={form.control} name="other_name" render={({ field }) => (
            <FormItem><FormLabel>Other Name(s)</FormLabel><FormControl><Input placeholder="Kwame" {...field} /></FormControl><FormMessage /></FormItem>
        )}/>
        <div className="grid grid-cols-2 gap-4">
             <FormField control={form.control} name="dob" render={({ field }) => (
                <FormItem className="flex flex-col"><FormLabel>Date of Birth</FormLabel>
                <Popover><PopoverTrigger asChild>
                    <FormControl><Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")} size="sm">
                        {field.value ? (format(field.value, "PPP")) : (<span>Pick a date</span>)}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button></FormControl>
                </PopoverTrigger><PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus />
                </PopoverContent></Popover><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="gender" render={({ field }) => (
                <FormItem><FormLabel>Gender</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger></FormControl>
                    <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent>
                </Select><FormMessage /></FormItem>
            )}/>
        </div>

        <h4 className="text-sm font-semibold text-primary pt-4">Contact Details</h4>
         <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="student@example.com" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
             <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="024 XXX XXXX" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
        </div>
        <FormField control={form.control} name="residence" render={({ field }) => (
            <FormItem><FormLabel>Current Residence</FormLabel><FormControl><Input placeholder="123 Main St, Accra" {...field} /></FormControl><FormMessage /></FormItem>
        )}/>

        <h4 className="text-sm font-semibold text-primary pt-4">Guardian's Details</h4>
        <FormField control={form.control} name="guardian_name" render={({ field }) => (
            <FormItem><FormLabel>Guardian's Name</FormLabel><FormControl><Input placeholder="Jane Doe" {...field} /></FormControl><FormMessage /></FormItem>
        )}/>
        <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="guardian_phone" render={({ field }) => (
                <FormItem><FormLabel>Guardian's Phone</FormLabel><FormControl><Input placeholder="020 XXX XXXX" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="guardian_relationship" render={({ field }) => (
                <FormItem><FormLabel>Relationship</FormLabel><FormControl><Input placeholder="Mother" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
        </div>
        <FormField control={form.control} name="guardian_email" render={({ field }) => (
            <FormItem><FormLabel>Guardian's Email</FormLabel><FormControl><Input placeholder="guardian@example.com" {...field} /></FormControl><FormMessage /></FormItem>
        )}/>

        <h4 className="text-sm font-semibold text-primary pt-4">Admission Details</h4>
        <div className="grid grid-cols-1">
            <FormField control={form.control} name="class_assigned" render={({ field }) => (
                <FormItem><FormLabel>Assign to Class</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select a class" /></SelectTrigger></FormControl>
                    <SelectContent>
                        {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                </Select><FormMessage /></FormItem>
            )}/>
        </div>


        <div className="flex justify-end pt-4 sticky bottom-0 bg-background/95 pb-4">
          <Button type="submit" disabled={isLoading} size="sm">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  );
}
