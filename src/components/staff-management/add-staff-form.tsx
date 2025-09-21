
'use client';
import { useState, useEffect } from 'react';
import { useForm, FormProvider, useFieldArray, useFormContext } from 'react-hook-form';
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
import { Loader2, CalendarIcon, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { ALL_ROLES, Role, AppointmentStatus, ALL_APPOINTMENT_STATUSES } from '@/lib/types';
import { getStaffAppointmentHistory, getClasses } from '@/lib/store';
import type { Class } from '@/lib/types';

const MAX_STEPS = 5;

const academicHistorySchema = z.object({
  school: z.string().min(1, 'School name is required'),
  program: z.string().min(1, 'Program is required'),
  year_completed: z.number().min(1900).max(new Date().getFullYear()),
});

const documentSchema = z.object({
  name: z.string().min(1, 'Document name is required'),
  file: z.any().refine(files => files?.length === 1, 'File is required.'),
});

const formSchema = z.object({
  // Personal & Contact
  first_name: z.string().min(1, 'First Name is required.'),
  last_name: z.string().min(1, 'Last Name is required.'),
  other_name: z.string().optional(),
  email: z.string().email('A valid email is required.'),
  phone: z.string().min(1, 'Phone number is required.'),
  id_type: z.enum(['Ghana Card', 'Passport', 'Voter ID', 'Drivers License']).default('Ghana Card'),
  id_no: z.string().min(1, 'ID number is required'),
  snnit_no: z.string().optional(),
  
  // Address
  country: z.string().min(1, "Country is required."),
  city: z.string().optional(),
  hometown: z.string().min(1, "Hometown is required."),
  residence: z.string().min(1, "Residence is required."),
  house_no: z.string().min(1, "House number is required."),
  gps_no: z.string().min(1, "GPS number is required."),

  // Academic History
  academic_history: z.array(academicHistorySchema).optional(),
  
  // Documents
  documents: z.array(documentSchema).optional(),

  // Appointment History
  appointment_date: z.date({ required_error: 'Appointment date is required.' }),
  role: z.enum(ALL_ROLES.filter(r => r !== 'Student' && r !== 'Parent') as [string, ...string[]], { required_error: 'Role is required.' }),
  class_assigned: z.array(z.string()).optional(),
  subjects_assigned: z.array(z.string()).optional(),
  appointment_status: z.enum(ALL_APPOINTMENT_STATUSES, { required_error: 'Appointment status is required.' }),
});

type FormData = z.infer<typeof formSchema>;


function AcademicHistoryFields() {
    const { control } = useFormContext<FormData>();
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'academic_history'
    });

    return (
        <div className="space-y-4">
            {fields.map((item, index) => (
                <div key={item.id} className="p-4 border rounded-md space-y-4 relative">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                            control={control}
                            name={`academic_history.${index}.school`}
                            render={({ field }) => (
                                <FormItem><FormLabel>School Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name={`academic_history.${index}.program`}
                            render={({ field }) => (
                                <FormItem><FormLabel>Program Offered</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name={`academic_history.${index}.year_completed`}
                            render={({ field }) => (
                                <FormItem><FormLabel>Year of Completion</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl><FormMessage /></FormItem>
                            )}
                        />
                    </div>
                     <Button type="button" variant="destructive" size="sm" className="absolute -top-3 -right-3 h-6 w-6 p-0 rounded-full" onClick={() => remove(index)}><X className="h-4 w-4" /></Button>
                </div>
            ))}
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ school: '', program: '', year_completed: new Date().getFullYear() })}
            >
                Add Academic History
            </Button>
        </div>
    );
}

function DocumentsFields() {
    const { control } = useFormContext<FormData>();
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'documents'
    });

    return (
        <div className="space-y-4">
            {fields.map((item, index) => (
                 <div key={item.id} className="p-4 border rounded-md space-y-4 relative">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={control}
                            name={`documents.${index}.name`}
                            render={({ field }) => (
                                <FormItem><FormLabel>Document Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )}
                        />
                         <FormField
                            control={control}
                            name={`documents.${index}.file`}
                            render={({ field }) => (
                                <FormItem><FormLabel>File</FormLabel><FormControl><Input type="file" accept=".pdf" onChange={(e) => field.onChange(e.target.files)} /></FormControl><FormMessage /></FormItem>
                            )}
                        />
                    </div>
                    <Button type="button" variant="destructive" size="sm" className="absolute -top-3 -right-3 h-6 w-6 p-0 rounded-full" onClick={() => remove(index)}><X className="h-4 w-4" /></Button>
                </div>
            ))}
             <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ name: '', file: null })}
            >
                Add Document
            </Button>
        </div>
    );
}


export function AddStaffForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedStaffId, setGeneratedStaffId] = useState('');
  const [classes, setClasses] = useState<Class[]>([]);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const methods = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      country: "Ghana",
    }
  });

  const { handleSubmit, trigger, watch } = methods;
  const appointmentDate = watch('appointment_date');

  useEffect(() => {
    setClasses(getClasses());
  }, []);

  useEffect(() => {
    if (appointmentDate) {
        const history = getStaffAppointmentHistory();
        const appYear = new Date(appointmentDate).getFullYear();
        const yearYY = appYear.toString().slice(-2);
        
        const appointmentsInYear = history.filter(h => new Date(h.appointment_date).getFullYear() === appYear);

        const nextInYear = appointmentsInYear.length + 1;
        const nextNumberPadded = nextInYear.toString().padStart(3, '0');
        
        setGeneratedStaffId(`LBAST${yearYY}${nextNumberPadded}`);
    } else {
        setGeneratedStaffId('');
    }
  }, [appointmentDate]);

  const tabs = [
    { id: 1, name: 'Personal & Contact', fields: ['first_name', 'last_name', 'email', 'phone', 'id_no'] },
    { id: 2, name: 'Address', fields: ['residence', 'country', 'hometown', 'house_no', 'gps_no'] },
    { id: 3, name: 'Academic History', fields: ['academic_history'] },
    { id: 4, name: 'Documents', fields: ['documents'] },
    { id: 5, name: 'Appointment', fields: ['appointment_date', 'role', 'appointment_status'] },
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
              <TabsList className="grid w-full grid-cols-5 mb-6">
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
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField name="email" render={({ field }) => (
                            <FormItem><FormLabel>Email *</FormLabel><FormControl><Input {...field} placeholder="staff@example.com" /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField name="phone" render={({ field }) => (
                            <FormItem><FormLabel>Phone *</FormLabel><FormControl><Input {...field} placeholder="233-555-1234" /></FormControl><FormMessage /></FormItem>
                        )}/>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField name="id_type" render={({ field }) => (
                            <FormItem><FormLabel>ID Type *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select an ID type" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="Ghana Card">Ghana Card</SelectItem>
                                    <SelectItem value="Passport">Passport</SelectItem>
                                    <SelectItem value="Voter ID">Voter ID</SelectItem>
                                    <SelectItem value="Drivers License">Drivers License</SelectItem>
                                </SelectContent>
                            </Select><FormMessage /></FormItem>
                        )}/>
                         <FormField name="id_no" render={({ field }) => (
                            <FormItem><FormLabel>ID Number</FormLabel><FormControl><Input {...field} placeholder="GHA-XXXXXXXXX-X"/></FormControl><FormMessage /></FormItem>
                         )} />
                         <FormField name="snnit_no" render={({ field }) => (
                            <FormItem><FormLabel>SSNIT Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                         )} />
                    </div>
                </div>
              </TabsContent>
              
              <TabsContent value="2">
                 <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <FormField name="country" render={({ field }) => (
                            <FormItem><FormLabel>Country *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                         )} />
                         <FormField name="city" render={({ field }) => (
                            <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                         )} />
                         <FormField name="hometown" render={({ field }) => (
                            <FormItem><FormLabel>Hometown *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                         )} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <FormField name="residence" render={({ field }) => (
                            <FormItem><FormLabel>Residence *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                         )} />
                         <FormField name="house_no" render={({ field }) => (
                            <FormItem><FormLabel>House No *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                         )} />
                         <FormField name="gps_no" render={({ field }) => (
                            <FormItem><FormLabel>GPS No *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                         )} />
                    </div>
                 </div>
              </TabsContent>

              <TabsContent value="3">
                <AcademicHistoryFields />
              </TabsContent>
              
               <TabsContent value="4">
                 <DocumentsFields />
              </TabsContent>
              
               <TabsContent value="5">
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField name="appointment_date" render={({ field }) => (
                                <FormItem className="flex flex-col"><FormLabel>Appointment Date *</FormLabel>
                                <Popover><PopoverTrigger asChild>
                                    <FormControl><Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                        {field.value ? (format(field.value, "PPP")) : (<span>Pick a date</span>)}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button></FormControl>
                                </PopoverTrigger><PopoverContent className="w-auto p-0" align="start">
                                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} captionLayout="dropdown-buttons" fromYear={new Date().getFullYear() - 50} toYear={new Date().getFullYear()} initialFocus />
                                </PopoverContent></Popover><FormMessage /></FormItem>
                            )}/>
                        <FormItem>
                            <FormLabel>Staff ID</FormLabel>
                            <FormControl><Input value={generatedStaffId} readOnly disabled /></FormControl>
                        </FormItem>
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
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <FormItem>
                            <FormLabel>Assign Classes</FormLabel>
                            {/* TODO: Replace with multi-select component */}
                            <p className="text-sm text-muted-foreground p-2 border rounded-md min-h-10">Multi-select for classes will be implemented here.</p>
                         </FormItem>
                          <FormItem>
                            <FormLabel>Assign Subjects</FormLabel>
                             {/* TODO: Replace with multi-select component */}
                            <p className="text-sm text-muted-foreground p-2 border rounded-md min-h-10">Multi-select for subjects will be implemented here.</p>
                         </FormItem>
                     </div>
                      <FormField name="appointment_status" render={({ field }) => (
                        <FormItem><FormLabel>Appointment Status *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                            <SelectContent>
                                {ALL_APPOINTMENT_STATUSES.map(status => (
                                    <SelectItem key={status} value={status}>{status}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select><FormMessage /></FormItem>
                    )}/>
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
