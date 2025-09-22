
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Staff } from '@/lib/types';
import { Loader2 } from 'lucide-react';

const editStaffSchema = z.object({
  first_name: z.string().min(1, 'First Name is required.'),
  last_name: z.string().min(1, 'Last Name is required.'),
  other_name: z.string().optional(),
  phone: z.string().min(1, 'Phone number is required.'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  id_no: z.string().min(1, 'ID number is required'),
  snnit_no: z.string().optional(),
  'address.residence': z.string().min(1, "Residence is required."),
});

type EditStaffFormProps = {
  defaultValues: Staff;
  onSubmit: (values: Partial<Staff>) => void;
};

export function EditStaffForm({ defaultValues, onSubmit }: EditStaffFormProps) {
  const form = useForm<z.infer<typeof editStaffSchema>>({
    resolver: zodResolver(editStaffSchema),
    defaultValues: {
        first_name: defaultValues.first_name,
        last_name: defaultValues.last_name,
        other_name: defaultValues.other_name,
        phone: defaultValues.phone,
        email: defaultValues.email,
        id_no: defaultValues.id_no,
        snnit_no: defaultValues.snnit_no,
        'address.residence': defaultValues.address.residence,
    }
  });

  const handleFormSubmit = (values: z.infer<typeof editStaffSchema>) => {
    const updatedStaff: Partial<Staff> = {
        first_name: values.first_name,
        last_name: values.last_name,
        other_name: values.other_name,
        phone: values.phone,
        email: values.email,
        id_no: values.id_no,
        snnit_no: values.snnit_no,
        address: {
            ...defaultValues.address,
            residence: values['address.residence'],
        },
    };
    onSubmit(updatedStaff);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
        <FormField name="first_name" render={({ field }) => (
            <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField name="last_name" render={({ field }) => (
            <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField name="phone" render={({ field }) => (
            <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField name="email" render={({ field }) => (
            <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <div className="flex justify-end pt-4">
          <Button type="submit" size="sm">
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  );
}
