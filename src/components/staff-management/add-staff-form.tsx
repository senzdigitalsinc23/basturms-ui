

'use client';
import { useState, useEffect } from 'react';
import { useForm, FormProvider, useFieldArray, useFormContext, Controller } from 'react-hook-form';
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
import { Separator } from '@/components/ui/separator';
import { Loader2, CalendarIcon, X, Check, ChevronsUpDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { ALL_ROLES, Role, AppointmentStatus, ALL_APPOINTMENT_STATUSES, Subject, Staff, ALL_ACCOUNTANT_ROLES } from '@/lib/types';
import { getStaffAppointmentHistory, getClasses, addStaff, addStaffAcademicHistory, addStaffDocument, getSubjects, updateStaff, getStaffDocuments, storeGetStaffAcademicHistory } from '@/lib/store';
import type { Class } from '@/lib/types';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { Badge } from '../ui/badge';
import { addStaffAppointmentHistory } from '@/lib/store';

const MAX_STEPS = 6;

const academicHistorySchema = z.object({
  school: z.string().min(1, 'School name is required'),
  qualification: z.string().min(1, 'Qualification is required'),
  program_offered: z.string().min(1, 'Program is required'),
  year_completed: z.number().min(1900).max(new Date().getFullYear()),
});

const documentSchema = z.object({
  name: z.string().min(1, 'Document name is required'),
  file: z.any().refine(file => file instanceof File || typeof file === 'string', 'File is required.'),
});

const formSchema = z.object({
  // Personal & Contact
  first_name: z.string().min(1, 'First Name is required.'),
  last_name: z.string().min(1, 'Last Name is required.'),
  other_name: z.string().optional(),
  email: z.string().email('A valid email is required.').optional().or(z.literal('')),
  phone: z.string().min(1, 'Phone number is required.'),
  id_type: z.enum(['Ghana Card', 'Passport', 'Voter ID', 'Drivers License']).default('Ghana Card'),
  id_no: z.string().min(1, 'ID number is required'),
  snnit_no: z.string().optional(),
  
  // Address
  address: z.object({
    country: z.string().min(1, "Country is required."),
    city: z.string().optional(),
    hometown: z.string().min(1, "Hometown is required."),
    residence: z.string().min(1, "Residence is required."),
    house_no: z.string().min(1, "House number is required."),
    gps_no: z.string().min(1, "GPS number is required."),
  }),

  // Academic History
  academic_history: z.array(academicHistorySchema).optional(),
  
  // Documents
  documents: z.array(documentSchema).optional(),

  // Appointment History
  appointment_date: z.date({ required_error: 'Appointment date is required.' }),
  roles: z.array(z.string()).min(1, 'At least one role is required.'),
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={control}
                            name={`academic_history.${index}.school`}
                            render={({ field }) => (
                                <FormItem><FormLabel>School Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )}
                        />
                         <FormField
                            control={control}
                            name={`academic_history.${index}.program_offered`}
                            render={({ field }) => (
                                <FormItem><FormLabel>Program Offered</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )}
                        />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={control}
                            name={`academic_history.${index}.qualification`}
                            render={({ field }) => (
                                <FormItem><FormLabel>Qualification</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name={`academic_history.${index}.year_completed`}
                            render={({ field }) => (
                                <FormItem><FormLabel>Year of Completion</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} /></FormControl><FormMessage /></FormItem>
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
                onClick={() => append({ school: '', qualification: '', program_offered: '', year_completed: new Date().getFullYear() })}
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
                                <FormItem><FormLabel>File</FormLabel><FormControl><Input type="file" accept=".pdf,.doc,.docx" onChange={(e) => field.onChange(e.target.files?.[0])} /></FormControl><FormMessage /></FormItem>
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

function PreviewItem({ label, value }: { label: string, value?: React.ReactNode }) {
    return (
        <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <div className="font-medium">{value || 'N/A'}</div>
        </div>
    )
}


type AddStaffFormProps = {
    isEditMode?: boolean;
    defaultValues?: Staff;
    onSubmit: (values: any) => void;
};


export function AddStaffForm({ isEditMode = false, defaultValues, onSubmit }: AddStaffFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedStaffId, setGeneratedStaffId] = useState(defaultValues?.staff_id || '');
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const methods = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: isEditMode && defaultValues ? {
        ...defaultValues,
        appointment_date: new Date(defaultValues.date_of_joining),
        roles: defaultValues.roles || [],
        appointment_status: getStaffAppointmentHistory().find(a => a.staff_id === defaultValues.staff_id)?.appointment_status || 'Appointed',
        class_assigned: getStaffAppointmentHistory().find(a => a.staff_id === defaultValues.staff_id)?.class_assigned,
        subjects_assigned: getStaffAppointmentHistory().find(a => a.staff_id === defaultValues.staff_id)?.subjects_assigned,
        academic_history: storeGetStaffAcademicHistory().filter(h => h.staff_id === defaultValues.staff_id),
        documents: getStaffDocuments().filter(d => d.staff_id === defaultValues.staff_id).map(d => ({name: d.document_name, file: d.file})),
    } : {
      first_name: '',
      last_name: '',
      other_name: '',
      email: '',
      phone: '',
      id_type: 'Ghana Card',
      id_no: '',
      snnit_no: '',
      address: {
        country: "Ghana",
        city: '',
        hometown: '',
        residence: '',
        house_no: '',
        gps_no: '',
      },
      academic_history: [],
      documents: [],
      appointment_date: undefined,
      roles: [],
      class_assigned: [],
      subjects_assigned: [],
      appointment_status: undefined,
    }
  });

  const { handleSubmit, trigger, watch } = methods;
  const appointmentDate = watch('appointment_date');
  const roles = watch('roles');
  const isTeacher = roles?.includes('Teacher');

  useEffect(() => {
    setClasses(getClasses());
    setSubjects(getSubjects());
  }, []);

  useEffect(() => {
    if (!isEditMode && appointmentDate) {
        const history = getStaffAppointmentHistory();
        const appYear = new Date(appointmentDate).getFullYear();
        const yearYY = appYear.toString().slice(-2);
        
        const appointmentsInYear = history.filter(h => new Date(h.appointment_date).getFullYear() === appYear);

        const nextInYear = appointmentsInYear.length + 1;
        const nextNumberPadded = nextInYear.toString().padStart(3, '0');
        
        setGeneratedStaffId(`LBAST${yearYY}${nextNumberPadded}`);
    } else if (!isEditMode) {
        setGeneratedStaffId('');
    }
  }, [appointmentDate, isEditMode]);

  const tabs = [
    { id: 1, name: 'Personal & Contact', fields: ['first_name', 'last_name', 'email', 'phone', 'id_no'] },
    { id: 2, name: 'Address', fields: ['address.residence', 'address.country', 'address.hometown', 'address.house_no', 'address.gps_no'] },
    { id: 3, name: 'Academic History', fields: ['academic_history'] },
    { id: 4, name: 'Documents', fields: ['documents'] },
    { id: 5, name: 'Appointment', fields: ['appointment_date', 'roles', 'appointment_status'] },
    { id: 6, name: 'Preview & Submit', fields: [] },
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

    const staffData: Omit<Staff, 'user_id'> = {
        staff_id: isEditMode && defaultValues ? defaultValues.staff_id : generatedStaffId,
        first_name: data.first_name,
        last_name: data.last_name,
        other_name: data.other_name,
        email: data.email || '',
        phone: data.phone,
        roles: data.roles as Role[],
        id_type: data.id_type,
        id_no: data.id_no,
        snnit_no: data.snnit_no,
        date_of_joining: data.appointment_date.toISOString(),
        address: data.address,
    };
    
    onSubmit({staffData, academic_history: data.academic_history, documents: data.documents, appointment_history: {
        staff_id: isEditMode && defaultValues ? defaultValues.staff_id : generatedStaffId,
        appointment_date: data.appointment_date.toISOString(),
        roles: data.roles as Role[],
        class_assigned: data.class_assigned,
        subjects_assigned: data.subjects_assigned,
        appointment_status: data.appointment_status,
    }});
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsLoading(false);
    
    const message = data.appointment_status === 'Declined'
      ? `${data.first_name} ${data.last_name}'s appointment has been declined and their record stored.`
      : `${data.first_name} ${data.last_name} has been ${isEditMode ? 'updated' : 'added'}.`;
      
    toast({
        title: isEditMode ? 'Staff Member Updated' : 'Staff Member Processed',
        description: message,
    });

    if (!isEditMode) {
      router.push(`/staff-management`);
    }
  };

  return (
    <Card>
      <CardContent className="p-0">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(processSubmit)} className="flex flex-col h-full">
             <div className="flex-grow overflow-y-auto p-6">
                <Tabs value={String(currentStep)} className="w-full">
                <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 mb-6">
                    {tabs.map(tab => (
                        <TabsTrigger key={tab.id} value={String(tab.id)} disabled={currentStep < tab.id} onClick={() => setCurrentStep(tab.id)}>
                            {tab.name}
                        </TabsTrigger>
                    ))}
                </TabsList>

                <TabsContent value="1">
                    <div className="space-y-6 max-h-[60vh] overflow-y-auto p-1">
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
                                <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} placeholder="staff@example.com" /></FormControl><FormMessage /></FormItem>
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
                    <div className="space-y-6 max-h-[60vh] overflow-y-auto p-1">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField name="address.country" render={({ field }) => (
                                <FormItem><FormLabel>Country *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField name="address.city" render={({ field }) => (
                                <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField name="address.hometown" render={({ field }) => (
                                <FormItem><FormLabel>Hometown *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField name="address.residence" render={({ field }) => (
                                <FormItem><FormLabel>Residence *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField name="address.house_no" render={({ field }) => (
                                <FormItem><FormLabel>House No *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField name="address.gps_no" render={({ field }) => (
                                <FormItem><FormLabel>GPS No *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="3">
                   <div className="max-h-[60vh] overflow-y-auto p-1">
                        <AcademicHistoryFields />
                   </div>
                </TabsContent>
                
                <TabsContent value="4">
                    <div className="max-h-[60vh] overflow-y-auto p-1">
                        <DocumentsFields />
                    </div>
                </TabsContent>
                
                <TabsContent value="5">
                    <div className="space-y-6 max-h-[60vh] overflow-y-auto p-1">
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
                            <FormField
                                control={methods.control}
                                name="roles"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Role(s) *</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                            variant="outline"
                                            role="combobox"
                                            className={cn("w-full justify-between h-auto", !field.value?.length && "text-muted-foreground")}
                                            >
                                            <div className="flex gap-1 flex-wrap">
                                                {field.value?.map(role => <Badge variant="secondary" key={role}>{role}</Badge>)}
                                                {field.value?.length === 0 && "Select roles"}
                                            </div>
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                        <Command>
                                            <CommandInput placeholder="Search roles..." />
                                            <CommandList>
                                                <CommandEmpty>No role found.</CommandEmpty>
                                                <CommandGroup>
                                                {ALL_ROLES.filter(r => r !== 'Student' && r !== 'Parent').map(role => (
                                                    <CommandItem
                                                    value={role}
                                                    key={role}
                                                    onSelect={() => {
                                                        const selected = field.value || [];
                                                        const isSelected = selected.includes(role);
                                                        const newValue = isSelected
                                                        ? selected.filter(id => id !== role)
                                                        : [...selected, role];
                                                        field.onChange(newValue);
                                                    }}
                                                    >
                                                    <Check className={cn("mr-2 h-4 w-4", (field.value || []).includes(role) ? "opacity-100" : "opacity-0")} />
                                                    {role}
                                                    </CommandItem>
                                                ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        {isTeacher && <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={methods.control}
                                name="class_assigned"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Assign Classes</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                            variant="outline"
                                            role="combobox"
                                            className={cn("w-full justify-between h-auto", !field.value?.length && "text-muted-foreground")}
                                            >
                                            <div className="flex gap-1 flex-wrap">
                                                {field.value?.map(classId => {
                                                    const cls = classes.find(c => c.id === classId);
                                                    return <Badge variant="secondary" key={classId}>{cls?.name}</Badge>
                                                })}
                                                {field.value?.length === 0 && "Select classes"}
                                            </div>
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                        <Command>
                                            <CommandInput placeholder="Search classes..." />
                                            <CommandList>
                                                <CommandEmpty>No class found.</CommandEmpty>
                                                <CommandGroup>
                                                {classes.map(c => (
                                                    <CommandItem
                                                    value={c.id}
                                                    key={c.id}
                                                    onSelect={() => {
                                                        const selected = field.value || [];
                                                        const isSelected = selected.includes(c.id);
                                                        const newValue = isSelected
                                                        ? selected.filter(id => id !== c.id)
                                                        : [...selected, c.id];
                                                        field.onChange(newValue);
                                                    }}
                                                    >
                                                    <Check className={cn("mr-2 h-4 w-4", (field.value || []).includes(c.id) ? "opacity-100" : "opacity-0")} />
                                                    {c.name}
                                                    </CommandItem>
                                                ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={methods.control}
                                name="subjects_assigned"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Assign Subjects</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                            variant="outline"
                                            role="combobox"
                                            className={cn("w-full justify-between h-auto", !field.value?.length && "text-muted-foreground")}
                                            >
                                            <div className="flex gap-1 flex-wrap">
                                                {field.value?.map(subjectId => {
                                                    const sub = subjects.find(s => s.id === subjectId);
                                                    return <Badge variant="secondary" key={subjectId}>{sub?.name}</Badge>
                                                })}
                                                {field.value?.length === 0 && "Select subjects"}
                                            </div>
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                        <Command>
                                            <CommandInput placeholder="Search subjects..." />
                                            <CommandList>
                                                <CommandEmpty>No subject found.</CommandEmpty>
                                                <CommandGroup>
                                                {subjects.map(s => (
                                                    <CommandItem
                                                    value={s.name}
                                                    key={s.id}
                                                    onSelect={() => {
                                                        const selected = field.value || [];
                                                        const isSelected = selected.includes(s.id);
                                                        const newValue = isSelected
                                                        ? selected.filter(id => id !== s.id)
                                                        : [...selected, s.id];
                                                        field.onChange(newValue);
                                                    }}
                                                    >
                                                    <Check className={cn("mr-2 h-4 w-4", (field.value || []).includes(s.id) ? "opacity-100" : "opacity-0")} />
                                                    {s.name}
                                                    </CommandItem>
                                                ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>}
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
                <TabsContent value="6">
                   <div className="space-y-6 max-h-[60vh] overflow-y-auto p-1">
                        <h3 className="text-lg font-semibold">Review Details</h3>
                        <p className="text-sm text-muted-foreground">Please review all the information carefully before submitting.</p>
                        
                        <h4 className="text-md font-semibold text-primary pt-4">Personal & Contact</h4>
                        <Separator />
                        <div className="grid md:grid-cols-3 gap-4">
                        <PreviewItem label="First Name" value={watch('first_name')} />
                        <PreviewItem label="Last Name" value={watch('last_name')} />
                        <PreviewItem label="Other Name" value={watch('other_name')} />
                        <PreviewItem label="Email" value={watch('email')} />
                        <PreviewItem label="Phone" value={watch('phone')} />
                        <PreviewItem label="ID Type" value={watch('id_type')} />
                        <PreviewItem label="ID Number" value={watch('id_no')} />
                        <PreviewItem label="SSNIT Number" value={watch('snnit_no')} />
                        </div>
                        <h4 className="text-md font-semibold text-primary pt-4">Address</h4>
                        <Separator />
                        <div className="grid md:grid-cols-3 gap-4">
                            <PreviewItem label="Country" value={watch('address.country')} />
                            <PreviewItem label="City" value={watch('address.city')} />
                            <PreviewItem label="Hometown" value={watch('address.hometown')} />
                            <PreviewItem label="Residence" value={watch('address.residence')} />
                            <PreviewItem label="House No" value={watch('address.house_no')} />
                            <PreviewItem label="GPS No" value={watch('address.gps_no')} />
                        </div>

                        <h4 className="text-md font-semibold text-primary pt-4">Appointment Details</h4>
                        <Separator />
                        <div className="grid md:grid-cols-3 gap-4">
                            <PreviewItem label="Staff ID" value={generatedStaffId} />
                            <PreviewItem label="Appointment Date" value={watch('appointment_date') ? format(watch('appointment_date'), 'PPP') : ''} />
                            <PreviewItem label="Roles" value={<div className="flex flex-wrap gap-1">{watch('roles')?.map(r => <Badge key={r} variant="secondary">{r}</Badge>)}</div>} />
                            <PreviewItem label="Appointment Status" value={watch('appointment_status')} />
                            {isTeacher && <>
                                <PreviewItem label="Classes Assigned" value={<div className="flex flex-wrap gap-1">{watch('class_assigned')?.map(cId => <Badge key={cId} variant="outline">{classes.find(c => c.id === cId)?.name}</Badge>)}</div>} />
                                <PreviewItem label="Subjects Assigned" value={<div className="flex flex-wrap gap-1">{watch('subjects_assigned')?.map(sId => <Badge key={sId} variant="outline">{subjects.find(s => s.id === sId)?.name}</Badge>)}</div>} />
                            </>}
                        </div>
                        {watch('academic_history') && watch('academic_history')!.length > 0 && <>
                            <h4 className="text-md font-semibold text-primary pt-4">Academic History</h4>
                            <Separator />
                            <ul className="space-y-2">
                            {watch('academic_history')?.map((hist, i) => (
                                <li key={i} className="text-sm border p-2 rounded-md">
                                    <span className="font-bold">{hist.qualification}</span> from <span className="font-bold">{hist.school}</span> ({hist.year_completed}) - {hist.program_offered}
                                </li>
                            ))}
                            </ul>
                        </>}
                        {watch('documents') && watch('documents')!.length > 0 && <>
                            <h4 className="text-md font-semibold text-primary pt-4">Documents to be Uploaded</h4>
                            <Separator />
                            <ul className="list-disc pl-5 space-y-1">
                            {watch('documents')?.map((doc, i) => <li key={i} className="text-sm">{doc.name} ({(doc.file as File)?.name || 'Existing file'})</li>)}
                            </ul>
                        </>}
                    </div>
                </TabsContent>

                </Tabs>
            </div>
            <div className="flex justify-between mt-auto p-6 border-t bg-background sticky bottom-0 z-10">
              {currentStep > 1 && (
                <Button type="button" variant="outline" onClick={handlePrevious} size="sm">
                  Previous
                </Button>
              )}
              <div />
              {currentStep < MAX_STEPS && (
                <Button type="button" onClick={handleNext} size="sm">
                  {currentStep === MAX_STEPS - 1 ? 'Preview & Submit' : 'Next'}
                </Button>
              )}
              {currentStep === MAX_STEPS && (
                <Button type="submit" disabled={isLoading} size="sm">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {isEditMode ? 'Save Changes' : 'Add Staff Member'}
                </Button>
              )}
            </div>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}
