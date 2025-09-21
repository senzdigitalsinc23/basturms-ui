
'use client';
import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { ALL_ROLES, Role, ALL_EMPLOYMENT_STATUSES, EmploymentStatus } from '@/lib/types';


const MAX_STEPS = 4;

const formSchema = z.object({
  // Personal & Contact
  first_name: z.string().min(1, 'First Name is required.'),
  last_name: z.string().min(1, 'Last Name is required.'),
  other_name: z.string().optional(),
  email: z.string().email('A valid email is required.'),
  phone: z.string().min(1, 'Phone number is required.'),
  role: z.enum(ALL_ROLES.filter(r => r !== 'Student' && r !== 'Parent') as [string, ...string[]], { required_error: 'Role is required.' }),
  id_type: z.enum(['Ghana Card', 'Passport', 'Voter ID', 'Drivers License']).default('Ghana Card'),
  id_no: z.string().min(1, 'ID number is required'),
  snnit_no: z.string().optional(),
  status: z.enum(ALL_EMPLOYMENT_STATUSES, { required_error: 'Status is required.' }),
  date_of_joining: z.date({ required_error: 'Joining date is required.' }),
});

type FormData = z.infer<typeof formSchema>;


export function AddStaffForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const methods = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
  });

  const { handleSubmit, trigger } = methods;

  const tabs = [
    { id: 1, name: 'Personal & Contact', fields: ['first_name', 'last_name', 'email', 'phone', 'role', 'id_no', 'status', 'date_of_joining'] },
    { id: 2, name: 'Academic History', fields: [] },
    { id: 3, name: 'Documents', fields: [] },
    { id: 4, name: 'Appointment History', fields: [] },
  ];

  const handleNext = async () => {
    const currentTab = tabs.find(t => t.id === currentStep);
    const result = await trigger(currentTab?.fields as (keyof FormData)[]);
    if (result) {
      setCurrentStep(prev => (prev < MAX_STEPS ? prev + 1 : prev));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => (prev > 1 ? prev - 1 : prev));
  };

  const processSubmit = async (data: FormData) => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to perform this action.'});
        return;
    }
    setIsLoading(true);

    // TODO: Implement staff creation logic
    console.log(data);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsLoading(false);
    toast({
        title: 'Staff Member Added (Simulated)',
        description: `${data.first_name} ${data.last_name} has been added.`
    });
    router.push(`/staff-management`);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(processSubmit)}>
            <Tabs value={String(currentStep)} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                {tabs.map(tab => (
                    <TabsTrigger key={tab.id} value={String(tab.id)} disabled={currentStep < tab.id} onClick={() => setCurrentStep(tab.id)}>
                        {tab.name}
                    </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="1">
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <FormField name="first_name" render={({ field }) => (
                            <FormItem><FormLabel>First Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                         )} />
                         <FormField name="last_name" render={({ field }) => (
                            <FormItem><FormLabel>Last Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                         )} />
                         <FormField name="other_name" render={({ field }) => (
                            <FormItem><FormLabel>Other Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                         )} />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField name="email" render={({ field }) => (
                            <FormItem><FormLabel>Email *</FormLabel><FormControl><Input {...field} placeholder="staff@example.com" /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField name="phone" render={({ field }) => (
                            <FormItem><FormLabel>Phone *</FormLabel><FormControl><Input {...field} placeholder="233-555-1234" /></FormControl><FormMessage /></FormItem>
                        )}/>
                         <FormField name="role" render={({ field }) => (
                            <FormItem><FormLabel>Role *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {ALL_ROLES.filter(r => r !== 'Student' && r !== 'Parent').map(role => (
                                        <SelectItem key={role} value={role}>{role}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select><FormMessage /></FormItem>
                        )}/>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <FormField name="id_no" render={({ field }) => (
                            <FormItem><FormLabel>Ghana Card Number</FormLabel><FormControl><Input {...field} placeholder="GHA-XXXXXXXXX-X"/></FormControl><FormMessage /></FormItem>
                         )} />
                         <FormField name="snnit_no" render={({ field }) => (
                            <FormItem><FormLabel>SSNIT Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                         )} />
                         <FormField name="status" render={({ field }) => (
                            <FormItem><FormLabel>Status *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {ALL_EMPLOYMENT_STATUSES.map(status => (
                                        <SelectItem key={status} value={status}>{status}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select><FormMessage /></FormItem>
                        )}/>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField name="date_of_joining" render={({ field }) => (
                            <FormItem className="flex flex-col"><FormLabel>Joining Date *</FormLabel>
                            <Popover><PopoverTrigger asChild>
                                <FormControl><Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                    {field.value ? (format(field.value, "PPP")) : (<span>Pick a date</span>)}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button></FormControl>
                            </PopoverTrigger><PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} captionLayout="dropdown-buttons" fromYear={new Date().getFullYear() - 50} toYear={new Date().getFullYear()} initialFocus />
                            </PopoverContent></Popover><FormMessage /></FormItem>
                        )}/>
                     </div>
                </div>
              </TabsContent>

              <TabsContent value="2">
                <div className="text-center text-muted-foreground p-8">
                    <p>Academic History form will be implemented here.</p>
                </div>
              </TabsContent>
              
               <TabsContent value="3">
                 <div className="text-center text-muted-foreground p-8">
                    <p>Documents upload form will be implemented here.</p>
                </div>
              </TabsContent>
              
               <TabsContent value="4">
                 <div className="text-center text-muted-foreground p-8">
                    <p>Appointment History form will be implemented here.</p>
                </div>
              </TabsContent>

            </Tabs>

            <div className="flex justify-between mt-8">
              {currentStep > 1 && (
                <Button type="button" variant="outline" onClick={handlePrevious} size="sm">
                  Previous
                </Button>
              )}
              <div />
              {currentStep < MAX_STEPS && (
                <Button type="button" onClick={handleNext} size="sm">
                  Next
                </Button>
              )}
              {currentStep === MAX_STEPS && (
                <Button type="submit" disabled={isLoading} size="sm">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Add Staff Member
                </Button>
              )}
            </div>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}
