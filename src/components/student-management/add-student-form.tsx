'use client';
import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getClasses, addStudentProfile } from '@/lib/store';
import { Class, StudentProfile } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { differenceInYears, format } from 'date-fns';

import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

const MAX_STEPS = 6;

const formSchema = z.object({
  // Personal
  first_name: z.string().min(2, 'First name is required.'),
  last_name: z.string().min(2, 'Last name is required.'),
  other_name: z.string().optional(),
  dob: z.date({ required_error: 'Date of birth is required.' }),
  gender: z.enum(['Male', 'Female', 'Other'], { required_error: 'Please select a gender.' }),
  nhis_number: z.string().optional(),

  // Contact
  email: z.string().email('Invalid email address.').optional().or(z.literal('')),
  phone: z.string().optional(),
  country: z.string().min(1, "Country is required."),
  city: z.string().optional(),
  hometown: z.string().min(1, "Hometown is required."),
  residence: z.string().min(1, "Residence is required."),
  house_no: z.string().min(1, "House number is required."),
  gps_no: z.string().min(1, "GPS number is required."),

  // Parents
  guardian_name: z.string().min(2, "Guardian's name is required."),
  guardian_phone: z.string().min(1, "Guardian's phone is required."),
  guardian_email: z.string().email('Invalid email address.').optional().or(z.literal('')),
  guardian_relationship: z.string().min(2, "Guardian's relationship is required."),

  // Emergency
  emergency_name: z.string().min(2, "Emergency contact name is required."),
  emergency_phone: z.string().min(1, "Emergency contact phone is required."),
  emergency_relationship: z.string().min(2, "Emergency contact relationship is required."),

  // Admission
  enrollment_date: z.date({ required_error: 'Enrollment date is required.' }),
  class_assigned: z.string({ required_error: 'Please select a class.' }),
});

type FormData = z.infer<typeof formSchema>;


function PreviewItem({ label, value }: { label: string, value?: string | null }) {
    return (
        <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="font-medium">{value || 'N/A'}</p>
        </div>
    )
}


export function AddStudentForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    setClasses(getClasses());
  }, []);

  const methods = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
        country: "Ghana",
    }
  });

  const { handleSubmit, trigger, watch, formState: { errors } } = methods;
  const dob = watch('dob');
  const [age, setAge] = useState<number | null>(null);

  useEffect(() => {
    if (dob) {
      setAge(differenceInYears(new Date(), dob));
    }
  }, [dob]);

  const tabs = [
    { id: 1, name: 'Personal', fields: ['first_name', 'last_name', 'dob', 'gender'] },
    { id: 2, name: 'Contact/Address', fields: ['residence', 'country', 'hometown', 'house_no', 'gps_no'] },
    { id: 3, name: 'Parents Details', fields: ['guardian_name', 'guardian_phone', 'guardian_relationship'] },
    { id: 4, name: 'Emergency Contact', fields: ['emergency_name', 'emergency_phone', 'emergency_relationship'] },
    { id: 5, name: 'Admission Info', fields: ['enrollment_date', 'class_assigned'] },
    { id: 6, name: 'Preview', fields: [] },
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

    const profileData: Omit<StudentProfile, 'student.student_no' | 'contactDetails.student_no' | 'guardianInfo.student_no' | 'emergencyContact.student_no' | 'admissionDetails.student_no' | 'admissionDetails.admission_no' | 'student.avatarUrl'> = {
        student: {
            first_name: data.first_name,
            last_name: data.last_name,
            other_name: data.other_name,
            dob: data.dob.toISOString(),
            gender: data.gender,
        },
        contactDetails: {
            email: data.email,
            phone: data.phone,
            country: data.country,
            city: data.city,
            hometown: data.hometown,
            residence: data.residence,
            house_no: data.house_no,
            gps_no: data.gps_no,
        },
        guardianInfo: {
            guardian_name: data.guardian_name,
            guardian_phone: data.guardian_phone,
            guardian_email: data.guardian_email,
            guardian_relationship: data.guardian_relationship,
        },
        emergencyContact: {
            emergency_name: data.emergency_name,
            emergency_phone: data.emergency_phone,
            emergency_relationship: data.emergency_relationship,
        },
        admissionDetails: {
            enrollment_date: data.enrollment_date.toISOString(),
            class_assigned: data.class_assigned,
            admission_status: 'Admitted',
        },
    };
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newProfile = addStudentProfile(profileData, user.id);
    
    setIsLoading(false);
    toast({
        title: 'Student Enrolled Successfully',
        description: `${newProfile.student.first_name} ${newProfile.student.last_name} has been added.`
    });
    router.push(`/student-management/students/${newProfile.student.student_no}`);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(processSubmit)}>
            <Tabs value={String(currentStep)} className="w-full">
              <TabsList className="grid w-full grid-cols-6 mb-6">
                {tabs.map(tab => (
                    <TabsTrigger key={tab.id} value={String(tab.id)} disabled={currentStep < tab.id && tab.id !== MAX_STEPS} onClick={() => setCurrentStep(tab.id)}>
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
                        <FormField name="dob" render={({ field }) => (
                            <FormItem className="flex flex-col"><FormLabel>Date of Birth *</FormLabel>
                            <Popover><PopoverTrigger asChild>
                                <FormControl><Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                    {field.value ? (format(field.value, "PPP")) : (<span>Pick a date</span>)}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button></FormControl>
                            </PopoverTrigger><PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} captionLayout="dropdown-buttons" fromYear={new Date().getFullYear() - 25} toYear={new Date().getFullYear() - 2} initialFocus />
                            </PopoverContent></Popover><FormMessage /></FormItem>
                        )}/>
                        <FormItem><FormLabel>Age</FormLabel><FormControl><Input value={age ?? ''} readOnly disabled /></FormControl></FormItem>
                     </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField name="gender" render={({ field }) => (
                            <FormItem><FormLabel>Gender *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger></FormControl>
                                <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent>
                            </Select><FormMessage /></FormItem>
                        )}/>
                         <FormField name="nhis_number" render={({ field }) => (
                            <FormItem><FormLabel>NHIS Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                         )} />
                      </div>
                </div>
              </TabsContent>

              <TabsContent value="2">
                 <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField name="email" render={({ field }) => (
                            <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} placeholder="student@example.com" /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField name="phone" render={({ field }) => (
                            <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} placeholder="024-123-4567" /></FormControl><FormMessage /></FormItem>
                        )}/>
                    </div>
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
                 <div className="space-y-6">
                    <FormField name="guardian_name" render={({ field }) => (
                        <FormItem><FormLabel>Guardian's Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField name="guardian_phone" render={({ field }) => (
                            <FormItem><FormLabel>Guardian's Phone *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField name="guardian_relationship" render={({ field }) => (
                            <FormItem><FormLabel>Relationship to Student *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                    </div>
                     <FormField name="guardian_email" render={({ field }) => (
                        <FormItem><FormLabel>Guardian's Email</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                 </div>
              </TabsContent>
              
               <TabsContent value="4">
                 <div className="space-y-6">
                    <FormField name="emergency_name" render={({ field }) => (
                        <FormItem><FormLabel>Emergency Contact Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField name="emergency_phone" render={({ field }) => (
                            <FormItem><FormLabel>Emergency Contact Phone *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField name="emergency_relationship" render={({ field }) => (
                            <FormItem><FormLabel>Relationship to Student *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                    </div>
                 </div>
              </TabsContent>

               <TabsContent value="5">
                 <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField name="enrollment_date" render={({ field }) => (
                            <FormItem className="flex flex-col"><FormLabel>Enrollment Date *</FormLabel>
                            <Popover><PopoverTrigger asChild>
                                <FormControl><Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                    {field.value ? (format(field.value, "PPP")) : (<span>Pick a date</span>)}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button></FormControl>
                            </PopoverTrigger><PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} captionLayout="dropdown-buttons" fromYear={new Date().getFullYear() - 10} toYear={new Date().getFullYear()} initialFocus />
                            </PopoverContent></Popover><FormMessage /></FormItem>
                        )}/>
                         <FormField name="class_assigned" render={({ field }) => (
                            <FormItem><FormLabel>Assign to Class *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select a class" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                </SelectContent>
                            </Select><FormMessage /></FormItem>
                        )}/>
                    </div>
                 </div>
              </TabsContent>

              <TabsContent value="6">
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold">Review Details</h3>
                    <p className="text-sm text-muted-foreground">Please review all the information carefully before submitting.</p>
                    
                    <h4 className="text-md font-semibold text-primary pt-4">Personal Details</h4>
                    <Separator />
                    <div className="grid md:grid-cols-3 gap-4">
                        <PreviewItem label="First Name" value={watch('first_name')} />
                        <PreviewItem label="Last Name" value={watch('last_name')} />
                        <PreviewItem label="Other Name" value={watch('other_name')} />
                        <PreviewItem label="Date of Birth" value={watch('dob') ? format(watch('dob'), 'PPP') : ''} />
                        <PreviewItem label="Gender" value={watch('gender')} />
                        <PreviewItem label="NHIS Number" value={watch('nhis_number')} />
                    </div>

                    <h4 className="text-md font-semibold text-primary pt-4">Contact & Address</h4>
                     <Separator />
                     <div className="grid md:grid-cols-3 gap-4">
                        <PreviewItem label="Email" value={watch('email')} />
                        <PreviewItem label="Phone" value={watch('phone')} />
                        <PreviewItem label="Country" value={watch('country')} />
                        <PreviewItem label="City" value={watch('city')} />
                        <PreviewItem label="Hometown" value={watch('hometown')} />
                        <PreviewItem label="Residence" value={watch('residence')} />
                        <PreviewItem label="House No" value={watch('house_no')} />
                        <PreviewItem label="GPS No" value={watch('gps_no')} />
                    </div>

                    <h4 className="text-md font-semibold text-primary pt-4">Parent's Details</h4>
                     <Separator />
                     <div className="grid md:grid-cols-2 gap-4">
                        <PreviewItem label="Guardian's Name" value={watch('guardian_name')} />
                        <PreviewItem label="Guardian's Phone" value={watch('guardian_phone')} />
                        <PreviewItem label="Relationship" value={watch('guardian_relationship')} />
                        <PreviewItem label="Guardian's Email" value={watch('guardian_email')} />
                    </div>

                     <h4 className="text-md font-semibold text-primary pt-4">Emergency Contact</h4>
                     <Separator />
                      <div className="grid md:grid-cols-2 gap-4">
                        <PreviewItem label="Emergency Contact Name" value={watch('emergency_name')} />
                        <PreviewItem label="Emergency Contact Phone" value={watch('emergency_phone')} />
                        <PreviewItem label="Relationship" value={watch('emergency_relationship')} />
                    </div>

                     <h4 className="text-md font-semibold text-primary pt-4">Admission Details</h4>
                     <Separator />
                     <div className="grid md:grid-cols-2 gap-4">
                        <PreviewItem label="Enrollment Date" value={watch('enrollment_date') ? format(watch('enrollment_date'), 'PPP') : ''} />
                        <PreviewItem label="Class Assigned" value={classes.find(c => c.id === watch('class_assigned'))?.name} />
                    </div>
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
              {currentStep < MAX_STEPS - 1 && (
                <Button type="button" onClick={handleNext} size="sm">
                  Next
                </Button>
              )}
              {currentStep === MAX_STEPS - 1 && (
                <Button type="button" onClick={handleNext} size="sm">
                  Review Details
                </Button>
              )}
              {currentStep === MAX_STEPS && (
                <Button type="submit" disabled={isLoading} size="sm">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Submit Enrollment
                </Button>
              )}
            </div>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}
